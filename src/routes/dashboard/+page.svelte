<div class="min-h-screen p-6 font-sans">
  <!-- Upcoming Activities -->
  <section class="mb-10">
    <h2
      class="text-xl font-semibold flex items-center gap-2 mb-4"
      style="color: var(--color-text-primary)"
    >
      📅 Upcoming Activities
    </h2>

    <div
      class="border-2 border-dashed rounded-xl p-10 text-center"
      style="color: var(--color-text-secondary); background-color: var(--color-white); border-color: var(--color-border)"
    >
      <div class="text-5xl mb-4">📆</div>
      <p class="mb-4">No upcoming activities planned yet.</p>
      <a href="/dashboard/plan-activity">
        class="px-6 py-2 rounded"
        style="background-color: var(--color-primary-dark); color: var(--color-white)"
      >
        Plan your first activity
      </a>
    </div>
  </section>

  <!-- Group Chat -->
  <section>
    <h2
      class="text-xl font-semibold flex items-center gap-2 mb-4"
      style="color: var(--color-text-primary)"
    >
      💬 Group Chat
    </h2>

    <div
      class="rounded-xl shadow border p-6"
      style="background-color: var(--color-white); border-color: var(--color-border-light)"
    >
      <div
        class="p-4 rounded-xl mb-4"
        style="background-color: var(--color-secondary-light); border: 1px solid var(--color-secondary-dark)"
      >
        <h3 class="font-semibold mb-2 flex items-center gap-2">🌟 Quick Poll</h3>
        <p class="mb-4">Teacher Anne is planning an activity this Friday</p>

        <label class="flex items-center gap-2 mb-2"><input type="checkbox" /> YES (12)</label>
        <label class="flex items-center gap-2 mb-4"><input type="checkbox" /> NO (3)</label>
      </div>

      <div class="flex items-center gap-2">
        <input
          type="text"
          placeholder="Plan a lesson at"
          class="border p-2 rounded w-full"
          style="border-color: var(--color-border-light)"
        />
        <button
          class="px-4 py-2 rounded"
          style="background-color: var(--color-primary); color: var(--color-white)"
        >
          Post
        </button>
      </div>
    </div>
  </section>
</div>

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
      <button
        class="w-full shadow p-3 rounded flex items-center gap-2"
        style="background-color: var(--color-white)"
      >
        💾 Saved Items
      </button>
      <button
        class="w-full shadow p-3 rounded flex items-center gap-2"
        style="background-color: var(--color-white)"
      >
        📚 Assignments
      </button>
    </div>
  </section>

  <!-- Groups -->
  <section
    class="border rounded-xl shadow p-4"
    style="background-color: var(--color-white); border-color: var(--color-border)"
  >
    <h3
      class="font-semibold mb-4 flex items-center gap-2"
      style="color: var(--color-text-primary)"
    >
      👥 Your Groups
    </h3>

    <div
      class="flex items-center justify-between p-3 rounded border"
      style="background-color: var(--color-bg); border-color: var(--color-border)"
    >
      <span>🇳🇱 Netherlands</span>
      <span
        class="px-3 py-1 rounded-full"
        style="background-color: var(--color-primary-dark); color: var(--color-white)"
      >
        83
      </span>
    </div>
    <div
      class="flex items-center justify-between p-3 rounded border"
      style="background-color: var(--color-bg); border-color: var(--color-border)"
    >
      <span>Zl Zeeland</span>
      <span
        class="px-3 py-1 rounded-full"
        style="background-color: var(--color-primary-dark); color: var(--color-white)"
      >
        21
      </span>
    </div>
    <div
      class="flex items-center justify-between p-3 rounded border"
      style="background-color: var(--color-bg); border-color: var(--color-border)"
    >
      <span>Sl School</span>
      <span
        class="px-3 py-1 rounded-full"
        style="background-color: var(--color-primary-dark); color: var(--color-white)"
      >
        5
      </span>
    </div>
  </section>
</div>