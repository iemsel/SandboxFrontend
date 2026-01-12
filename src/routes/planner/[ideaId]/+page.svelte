<script>
  import { onMount } from "svelte";
  import Notification from '../../lib/components/Notification.svelte';
  import { notify } from "$lib/stores/notifications.js";
  import { listPlans, createPlan, addPlanItem } from "$lib/api/planner.js";
  import { me } from "$lib/api/auth.js"; 
  import { goto } from '$app/navigation';

  // ----- State -----
  export let data; // passed from parent
  const { idea } = data;

  let token = null;
  let user = null;
  let plans = [];
  let selectedSlot = null;      
  let occupiedSlots = [];     
  let selectedDateTime = null;   
  let selectedEndTime = null;   

  // ----- Time & week helpers -----
  let currentDate = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,"0")}:00`);
  $: disablePrevWeek = monday < getMonday(new Date());
  $: monday = getMonday(currentDate);
  $: weekNumber = getISOWeek(currentDate);
  $: year = monday.getFullYear();
  $: monthName = monday.toLocaleDateString("en-US", { month: "long" });
  $: dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  // ----- Day array update -----
  let days = [
    { label: "MON" }, { label: "TUE" }, { label: "WED" },
    { label: "THU" }, { label: "FRI" }, { label: "SAT" }, { label: "SUN" }
  ];

  $: {
    const today = new Date();
    days = days.map((d, i) => {
      const date = dayDates[i];
      return {
        ...d,
        num: date.getDate(),
        selected: date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate(),
      };
    });
  }

  // ----- Reactive slot & time computation -----
  $: if (selectedSlot && idea?.duration?.max) {
    // Compute start & end times
    const start = new Date(
      dayDates[selectedSlot.dayIndex].getFullYear(),
      dayDates[selectedSlot.dayIndex].getMonth(),
      dayDates[selectedSlot.dayIndex].getDate(),
      selectedSlot.hourIndex,
      selectedSlot.minute || 0
    );
    const end = new Date(start.getTime() + idea.duration.max * 60000);

    selectedDateTime = start;
    selectedEndTime = end;

    // Compute occupied slots for highlighting
    const totalMinutes = idea.duration.max;
    const slotCount = Math.ceil(totalMinutes / 30);
    const slots = [];

    let currentHour = selectedSlot.hourIndex;
    let currentMinute = selectedSlot.minute || 0;

    for (let i = 0; i < slotCount; i++) {
      slots.push({ dayIndex: selectedSlot.dayIndex, hourIndex: currentHour, minute: currentMinute });
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    occupiedSlots = slots;
  } else {
    // Clear if no slot selected
    selectedDateTime = null;
    selectedEndTime = null;
    occupiedSlots = [];
  }

  // ----- Week navigation -----
  function nextWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
    resetSelectedSlot();
  }

  function prevWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 7);
    resetSelectedSlot();
  }

  // ----- Helper functions -----
  function getISOWeek(date) {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  }

  function getMonday(d) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    return date;
  }

  function toMysqlDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function toMysqlTime(d) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;
  }

  function isPastSlot(dayIndex, hourIndex, minute = 0) {
    const slotDate = new Date(
      dayDates[dayIndex].getFullYear(),
      dayDates[dayIndex].getMonth(),
      dayDates[dayIndex].getDate(),
      hourIndex,
      minute
    );
    return slotDate <= new Date();
  }
  
  function resetSelectedSlot() {
    selectedSlot = null;
    selectedDateTime = null;
    selectedEndTime = null;
    occupiedSlots = [];
  }

  // ----- Slot selection -----
  function selectSlot(dayIndex, hourIndex, minute = 0) {
    if (isPastSlot(dayIndex, hourIndex, minute)) {
      notify({ type: 'error', message: 'Cannot select a past time slot.' });
      return;
    }

    selectedSlot = { dayIndex, hourIndex, minute };
  }

  // ----- Load plans -----
  async function loadPlans() {
    if (!token) return;
    try {
      plans = await listPlans({}, token);
      console.log('Loaded plans:', plans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }

  // ----- Save plan -----
  async function savePlan() {
    try {
      if (!token) {
        notify({ type: "error", message: "You must be logged in to save a plan" });
        return;
      }
      if (!selectedDateTime) {
        notify({ type: "error", message: "Please select a time slot before saving." });
        return;
      }

      // Create plan
      const planData = {
        title: idea.title,
        date: toMysqlDate(selectedDateTime),
        class_name: 'Personal',
        notes: toMysqlTime(selectedDateTime),
      };
      const plan = await createPlan(planData, token);
      console.log('Plan created:', plan);

      // Add idea as plan item
      const itemData = {
        idea_id: idea.id,
        custom_title: idea.title,
        custom_description: idea.description,
        start_time: toMysqlTime(selectedDateTime),
        end_time: toMysqlTime(selectedEndTime),
        location: null
      };
      const planItem = await addPlanItem(plan.id, itemData, token);
      console.log('Plan item added:', planItem);

      // Refresh plans
      await loadPlans();
      notify({ type: "success", message: "Plan saved successfully!" });
      goto('/dashboard');
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "Failed to save plan: " + err.message });
    }
  }

  // ----- On mount -----
  onMount(async () => {
    try {
      token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found. User is not logged in.');
        return;
      }

      const auth = await me(token);
      user = auth.user;

      await loadPlans();
    } catch (err) {
      console.error("Failed to get user info or plans:", err);
    }
  });
</script>

<div class="p-8 font-sans grid grid-cols-3 gap-10">
  <!-- LEFT: Idea panel -->
  <div class="col-span-1">
    <section
      class="rounded-xl shadow p-6"
      style="background-color: var(--color-white); border: 1px solid var(--color-border);"
    >
      <h2
        class="text-lg font-semibold mb-4"
        style="color: var(--color-text-primary);"
      >
        Idea
      </h2>

      {#if idea}
        <div
          class="w-full h-48 rounded-xl flex items-center justify-center text-xl mb-4"
          style="background-color: var(--color-bg); color: var(--color-text-secondary); border: 1px dashed var(--color-border-light);"
        >
          {#if idea.imageUrl}
            <img
              src={idea.imageUrl}
              alt={idea.title}
              class="w-full h-full object-cover rounded-xl"
              on:error={(e) => e.target.src = 'https://picsum.photos/400/300'} 
            />
          {:else}
            Image Placeholder
          {/if}
        </div>

        <h3
          class="text-2xl font-bold mb-2"
          style="color: var(--color-text-primary);"
        >
          {idea.title}
        </h3>
        <p class="mb-4" style="color: var(--color-text-secondary);">
          {idea.description}
        </p>

        <div
          class="flex items-center gap-6 mb-5"
          style="color: var(--color-text-secondary);"
        >
          <span>🔧 {idea.difficulty}</span>
          <!-- <span>⭐ {idea.rating}</span> for when rating works -->
          <span>
            ⏱
            {#if idea.duration?.min != null && idea.duration?.max != null}
              {idea.duration.min}–{idea.duration.max} min
            {:else if idea.duration?.max != null}
              {idea.duration.max} min
            {/if}
          </span>
        </div>
      {:else}
        <div>Loading idea...</div>
      {/if}

      <!-- Selected Time Card -->
      {#if selectedDateTime}
  <div
    class="mt-6 p-4 rounded-xl border"
    style="background-color: var(--color-bg); border-color: var(--color-border-light); color: var(--color-text-primary);"
  >
    <div class="font-semibold mb-1">Selected Time:</div>

    <!-- Start Date & Time -->
    <div class="text-xl font-bold">
      {selectedDateTime.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "long",
      })}
    </div>

    <div class="text-lg mb-1">
      {selectedDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })} 
      – 
      {selectedEndTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </div>

    <div class="text-sm" style="color: var(--color-text-secondary);">
      Week {weekNumber}, {year}
    </div>
  </div>
{/if}

    </section>
  </div>

  <!-- RIGHT: Schedule -->
  <div class="col-span-2">
    <section
      class="rounded-xl shadow p-6 flex flex-col"
      style="background-color: var(--color-white); border: 1px solid var(--color-border); height: 700px;"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2
          class="text-xl font-semibold"
          style="color: var(--color-text-primary);"
        >
          Schedule
        </h2>
        <div class="flex items-center gap-6">
          <button
            on:click={prevWeek}
            disabled={disablePrevWeek}
            style="
              color: {disablePrevWeek ? '#999' : 'var(--color-text-secondary)'};
              cursor: {disablePrevWeek ? 'not-allowed' : 'pointer'};
            "
            title={disablePrevWeek ? 'Cannot navigate to past weeks' : ''}
          >
            &lt;
          </button>
          <div class="text-center">
            <div
              class="font-semibold"
              style="color: var(--color-text-primary);"
            >
              Week {weekNumber}, {year}
            </div>
            <div style="color: var(--color-text-secondary);">{monthName}</div>
          </div>
          <button
            on:click={nextWeek}
            style="color: var(--color-text-secondary);">&gt;</button
          >
        </div>
      </div>

      <!-- Days header -->
      <div
        class="grid grid-cols-8 text-center border-b pb-4 mb-2"
        style="border-color: var(--color-border-light);"
      >
        <div></div>

        {#each days as d}
          <div>
            <div
              class="text-sm mb-1"
              style="color: var(--color-text-secondary);"
            >
              {d.label}
            </div>

            <div
              class="w-10 h-10 mx-auto flex items-center justify-center rounded-full"
              style="
                background-color: {d.selected
                ? 'var(--color-primary-dark)'
                : 'transparent'};
                color: {d.selected
                ? 'var(--color-white)'
                : 'var(--color-text-primary)'};
                border: 1px solid {d.selected
                ? 'var(--color-primary-dark)'
                : 'var(--color-border-light)'};
              "
            >
              {d.num}
            </div>
          </div>
        {/each}
      </div>

      <!-- Time grid -->
      <div class="flex-1 overflow-y-scroll pr-4" style="scrollbar-width: thin;">
        {#each hours as hour, hourIndex}
          <div
            class="grid grid-cols-8 h-14 border-b"
            style="border-color: var(--color-border-light);"
          >
            <div
              class="flex items-center justify-end pr-3 text-sm"
              style="color: var(--color-text-secondary);"
            >
              {hour}
            </div>

            {#each Array(7) as _, dayIndex}
              <div
                class="border-l relative"
                tabindex="0"
                role="button"
                style="border-color: var(--color-border-light);"
              >

                <!-- Top half :00 -->
                <button
                  class="absolute top-0 left-0 right-0 h-1/2 cursor-pointer"
                  on:click={() => selectSlot(dayIndex, hourIndex, 0)}
                  aria-label={`Select ${days[dayIndex].label} ${hourIndex}:00`}
                  style="
                    background-color: {
                      occupiedSlots.some(
                        s => s.dayIndex === dayIndex && s.hourIndex === hourIndex && s.minute === 0
                      )
                        ? 'var(--color-primary-light)'
                        : isPastSlot(dayIndex, hourIndex, 0)
                        ? '#e0e0e0'
                        : 'transparent'
                    };
                    opacity: {isPastSlot(dayIndex, hourIndex, 0) ? 0.5 : 1};
                  "
                  title={isPastSlot(dayIndex, hourIndex, 0) ? 'Past time slot cannot be selected' : ''}
                ></button>

                <!-- Bottom half :30 -->
                <button
                  class="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer"
                  on:click={() => selectSlot(dayIndex, hourIndex, 30)}
                  aria-label={`Select ${days[dayIndex].label} ${hourIndex}:30`}
                  style="
                    background-color: {
                      occupiedSlots.some(
                        s => s.dayIndex === dayIndex && s.hourIndex === hourIndex && s.minute === 30
                      )
                        ? 'var(--color-primary-light)'
                        : isPastSlot(dayIndex, hourIndex, 30)
                        ? '#e0e0e0'
                        : 'transparent'
                    };
                    opacity: {isPastSlot(dayIndex, hourIndex, 30) ? 0.5 : 1};
                  "
                  title={isPastSlot(dayIndex, hourIndex, 30) ? 'Past time slot cannot be selected' : ''}
                ></button>

                <!-- Half-hour divider -->
                <div
                  class="absolute left-0 right-0"
                  style="top: 50%; border-top: 1px dashed var(--color-border-light); opacity: 0.6;"
                ></div>
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Footer buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <a
          href={`/idea/${idea.id}`}
          class="px-5 py-2 rounded border inline-flex items-center justify-center"
          style="background-color: var(--color-white); border-color: var(--color-border); color: var(--color-text-primary);"
        >
          Cancel
        </a>
        <button
          class="px-5 py-2 rounded"
          style="background-color: var(--color-primary-dark); color: var(--color-white);"
          on:click={savePlan}
        >
          Save
        </button>
      </div>
    </section>
  </div>
</div>