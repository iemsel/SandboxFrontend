<script>
  import { onMount } from "svelte";
  import { listPlans } from "$lib/api/planner.js";
  import { me } from "$lib/api/auth.js"; // use your auth.js for token/user

  let selectedGroup = "";
  let inviteChecked = false;
  $: if (!inviteChecked) selectedGroup = "";

  // Days of the week
  let days = [
    { label: "MON" },
    { label: "TUE" },
    { label: "WED" },
    { label: "THU" },
    { label: "FRI" },
    { label: "SAT" },
    { label: "SUN" }
  ];

  // Hours for time grid
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  let currentDate = new Date();
  let plans = [];
  let token = null;
  let user = null;

  // Get ISO week number
  function getISOWeek(date) {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  }

  // Get Monday of the current week
  function getMonday(d) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    return date;
  }

  // Reactive week data
  $: monday = getMonday(currentDate);
  $: weekNumber = getISOWeek(currentDate);
  $: year = monday.getFullYear();
  $: monthName = monday.toLocaleDateString("en-US", { month: "long" });
  $: dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Update days array with dynamic day numbers and highlight current day
  $: {
    const today = new Date();

    days = days.map((d, i) => {
      const date = dayDates[i];
      return {
        ...d,
        num: date.getDate(),
        selected:
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
      };
    });
  }

  // Navigate weeks
  function nextWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  function prevWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 7);
  }

  // dummy idea data
  let idea = null;

  // Fetch plans from backend
  async function loadPlans() {
    if (!token) return;

    try {
      const date = new Date().toISOString().slice(0, 10); // fetch today's plans
      plans = await listPlans({ date }, token);
      console.log("Fetched plans:", plans);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  }

  onMount(async () => {
    try {
      // Get current user and token from auth.js
      const response = await me(token);
      user = response.user;
      token = response.token || null;

      // Fetch backend plans
      await loadPlans();
    } catch (err) {
      console.error("Failed to get user info or plans:", err);
    }

    // Existing dummy idea loading (kept exactly as before)
    setTimeout(() => {
      idea = {
        title: "Build a Bird Feeder",
        description: "Create a simple bird feeder using recycled materials and watch local birds visit your garden.",
        difficulty: "Easy",
        rating: 4.6,
        time: "45–60 min",
        image: null
      };
    }, 500); // fake delay
  });
</script>

<div class="p-8 font-sans grid grid-cols-3 gap-10">
  <!-- LEFT: Idea panel -->
  <div class="col-span-1">
    <section class="rounded-xl shadow p-6" style="background-color: var(--color-white); border: 1px solid var(--color-border);">
      <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text-primary);">Idea</h2>
      
      {#if idea}
        <div class="w-full h-48 rounded-xl flex items-center justify-center text-xl mb-4"
             style="background-color: var(--color-bg); color: var(--color-text-secondary); border: 1px dashed var(--color-border-light);">
          {#if idea.image}
            <img src={idea.image} alt={idea.title} class="w-full h-full object-cover rounded-xl"/>
          {:else}
            Image Placeholder
          {/if}
        </div>

        <h3 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary);">{idea.title}</h3>
        <p class="mb-4" style="color: var(--color-text-secondary);">{idea.description}</p>

        <div class="flex items-center gap-6 mb-5" style="color: var(--color-text-secondary);">
          <span>🔧 {idea.difficulty}</span>
          <span>⭐ {idea.rating}</span>
          <span>⏱ {idea.time}</span>
        </div>
      {:else}
        <div>Loading idea...</div>
      {/if}

      <!-- Invite checkbox -->
      <label class="font-medium flex items-center gap-2 mb-2" style="color: var(--color-text-primary);">
        <input type="checkbox" bind:checked={inviteChecked} /> Invite:
      </label>

      <!-- Group dropdown -->
      <select bind:value={selectedGroup} class="border p-2 rounded w-full"
              disabled={!inviteChecked}
              style="background-color: var(--color-bg); border-color: var(--color-border); color: var(--color-text-primary);">
        <option value="">Select group</option>
        <option value="family">Family</option>
        <option value="friends">Friends</option>
      </select>
    </section>
  </div>

  <!-- RIGHT: Schedule -->
  <div class="col-span-2">
    <section class="rounded-xl shadow p-6 flex flex-col"
             style="background-color: var(--color-white); border: 1px solid var(--color-border); height: 700px;">

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold" style="color: var(--color-text-primary);">Schedule</h2>
        <div class="flex items-center gap-6">
          <button on:click={prevWeek} style="color: var(--color-text-secondary);">&lt;</button>
          <div class="text-center">
            <div class="font-semibold" style="color: var(--color-text-primary);">Week {weekNumber}, {year}</div>
            <div style="color: var(--color-text-secondary);">{monthName}</div>
          </div>
          <button on:click={nextWeek} style="color: var(--color-text-secondary);">&gt;</button>
        </div>
      </div>

      <!-- Days header -->
      <div class="grid grid-cols-8 text-center border-b pb-4 mb-2" style="border-color: var(--color-border-light);">
        <div></div> <!-- Empty column for time labels -->

        {#each days as d}
          <div>
            <div class="text-sm mb-1" style="color: var(--color-text-secondary);">
              {d.label}
            </div>

            <div
              class="w-10 h-10 mx-auto flex items-center justify-center rounded-full"
              style="
                background-color: {d.selected ? 'var(--color-primary-dark)' : 'transparent'};
                color: {d.selected ? 'var(--color-white)' : 'var(--color-text-primary)'};
                border: 1px solid {d.selected ? 'var(--color-primary-dark)' : 'var(--color-border-light)'};
              "
            >
              {d.num}
            </div>
          </div>
        {/each}
      </div>

      <!-- Time grid -->
      <div class="flex-1 overflow-y-scroll pr-4" style="scrollbar-width: thin;">
        {#each hours as hour}
          <div class="grid grid-cols-8 h-14 border-b" style="border-color: var(--color-border-light);">
            <div class="flex items-center justify-end pr-3 text-sm" style="color: var(--color-text-secondary);">{hour}</div>
            {#each Array(7) as _}
              <div class="border-l relative" style="border-color: var(--color-border-light);">
                <div class="absolute left-0 right-0" style="top: 50%; border-top: 1px dashed var(--color-border-light); opacity: 0.6;"></div>
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Footer buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <button class="px-5 py-2 rounded border"
                style="background-color: var(--color-white); border-color: var(--color-border); color: var(--color-text-primary);">
          Cancel
        </button>
        <button class="px-5 py-2 rounded" style="background-color: var(--color-primary-dark); color: var(--color-white);">
          Save
        </button>
      </div>
  </section>  
</div>
</div>