<script>
  let selectedGroup = "";
  let inviteChecked = false;
  $: if (!inviteChecked) selectedGroup = "";

  let week = 49;
  let year = 2025;
  let month = "December";

  const days = [
    { label: "MON", num: 1 },
    { label: "TUE", num: 2 },
    { label: "WED", num: 3, selected: true },
    { label: "THU", num: 4 },
    { label: "FRI", num: 5 },
    { label: "SAT", num: 6 },
    { label: "SUN", num: 7 }
  ];

  // Hours: 00:00 → 23:00
  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );
</script>

<div class="p-8 font-sans grid grid-cols-3 gap-10">

  <!-- LEFT: Idea panel -->
  <div class="col-span-1">
    <section class="rounded-xl shadow p-6" style="background-color: var(--color-white); border: 1px solid var(--color-border);">
      <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text-primary);">Idea</h2>
      
      <!-- image-->
      <div class="w-full h-48 rounded-xl flex items-center justify-center text-xl mb-4"
           style="background-color: var(--color-bg); color: var(--color-text-secondary); border: 1px dashed var(--color-border-light);">
        Image Placeholder
      </div>

      <!-- title idea-->
      <h3 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary);">Build a Bird Feeder</h3>

      <!-- description idea-->
      <p class="mb-4" style="color: var(--color-text-secondary);">
        Create a simple bird feeder using recycled materials and watch local birds visit your garden.
      </p>

      <!-- properties idea -->
      <div class="flex items-center gap-6 mb-5" style="color: var(--color-text-secondary);">
        <span>🔧 Easy</span>
        <span>⭐ 4.6</span>
        <span>⏱ 45–60 min</span>
      </div>

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

  <!-- RIGHT SIDE -->
<div class="col-span-2">
  <section
    class="rounded-xl shadow p-6 flex flex-col"
    style="background-color: var(--color-white); border: 1px solid var(--color-border); height: 700px;"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold" style="color: var(--color-text-primary);">Schedule</h2>

      <div class="flex items-center gap-6">
        <button style="color: var(--color-text-secondary);">&lt;</button>

        <div class="text-center">
          <div class="font-semibold" style="color: var(--color-text-primary);">Week 49, 2025</div>
          <div style="color: var(--color-text-secondary);">December</div>
        </div>

        <button style="color: var(--color-text-secondary);">&gt;</button>
      </div>
    </div>


    <!-- DAY HEADER WITH EMPTY TIME COLUMN -->
    <div
      class="grid grid-cols-8 text-center border-b pb-4 mb-2"
      style="border-color: var(--color-border-light);"
    >
      <!-- Empty column for time labels -->
      <div></div>

      {#each days as d}
        <div>
          <div class="text-sm mb-1" style="color: var(--color-text-secondary);">
            {d.label}
          </div>

          <div
            class="w-10 h-10 mx-auto flex items-center justify-center rounded-full"
            style="
              background-color: {d.selected ? 'var(--color-primary)' : 'transparent'};
              color: {d.selected ? 'var(--color-white)' : 'var(--color-text-primary)'};
              border: 1px solid {d.selected ? 'var(--color-primary)' : 'var(--color-border-light)'};
            "
          >
            {d.num}
          </div>
        </div>
      {/each}
    </div>


    <!-- SCROLLING GRID -->
    <div class="flex-1 overflow-y-scroll pr-4" style="scrollbar-width: thin;">
      
      {#each hours as hour}
        <!-- 8 column row: TIME | 7 DAYS -->
        <div
          class="grid grid-cols-8 h-14 border-b"
          style="border-color: var(--color-border-light);"
        >
          <!-- TIME COLUMN -->
          <div
            class="flex items-center justify-end pr-3 text-sm"
            style="color: var(--color-text-secondary);"
          >
            {hour}
          </div>

          <!-- 7 DAY CELLS -->
          {#each Array(7) as _}
            <div class="border-l" style="border-color: var(--color-border-light);"></div>
          {/each}
        </div>
      {/each}

    </div>
  </section>  
</div>
</div>