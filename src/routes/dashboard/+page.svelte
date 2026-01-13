<script>
  import { onMount } from 'svelte';
  import { listPlans } from '$lib/api/planner.js';

  let plans = [];

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      let loadedPlans = await listPlans({}, token);

      loadedPlans = loadedPlans.map((p) => {
        const date = new Date(p.date); // parse ISO date

        // If start_time exists, split into hours/minutes and set on date
        if (p.start_time) {
          const [hours, minutes] = p.start_time.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
        }

        return {
          ...p,
          start: date,
        };
      });

      // Sort earliest first
      plans = loadedPlans.sort((a, b) => a.start - b.start);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  });

  function formatDateTime(dt) {
    return dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
</script>

<div class="min-h-screen p-6 font-sans">
  <!-- Upcoming Activities -->
  <section class="mb-10">
    <h2
      class="text-xl font-semibold flex items-center gap-2 mb-4"
      style="color: var(--color-text-primary)"
    >
      📅 Upcoming Activities
    </h2>

    {#if plans && plans.length}
      <div class="space-y-4">
        {#each plans as plan}
          <div
            class="p-4 rounded-xl border flex flex-col gap-1 shadow-sm"
            style="background-color: var(--color-white); border-color: var(--color-border)"
          >
            <h3 class="font-semibold text-lg" style="color: var(--color-text-primary)">
              {plan.title}
            </h3>
            <p class="text-sm" style="color: var(--color-text-secondary)">
              {plan.class_name} · {formatDateTime(plan.start)}, {plan.notes}
            </p>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="border-2 border-dashed rounded-xl p-10 text-center"
        style="color: var(--color-text-secondary); background-color: var(--color-white); border-color: var(--color-border)"
      >
        <div class="text-5xl mb-4">📆</div>
        <p class="mb-4">No upcoming activities planned yet.</p>
        <a
          href="/"
          class="px-6 py-2 rounded"
          style="background-color: var(--color-primary-dark); color: var(--color-white)"
        >
          Plan your first activity
        </a>
      </div>
    {/if}
  </section>

  <!-- Right Section -->
  <div class="col-span-1 space-y-8">
    <!-- Quick Tools -->
    <section
      class="border rounded-xl shadow"
      style="background-color: var(--color-secondary); border-color: var(--color-secondary-dark)"
    >
      <div
        class="p-4 border-b font-semibold"
        style="color: var(--color-text-primary); border-color: var(--color-secondary-dark)"
      >
        ⚡ Quick Tools
      </div>

      <div class="p-4 space-y-3">
        <button
          class="w-full shadow p-3 rounded flex items-center gap-2"
          style="background-color: var(--color-white)"
        >
          🖨️ Print Idea
        </button>
        <button
          class="w-full shadow p-3 rounded flex items-center gap-2"
          style="background-color: var(--color-white)"
        >
          📝 My Notes
        </button>
        <a
          href="/dashboard/saved-items"
          class="w-full shadow p-3 rounded flex items-center gap-2 block"
          style="background-color: var(--color-white); text-decoration: none; color: inherit;"
        >
          💾 Saved Items
        </a>
      </div>
    </section>
  </div>
</div>
