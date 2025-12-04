<script>
  let selectedGroup = "";
  let inviteChecked = false;
  $: if (!inviteChecked) selectedGroup = "";
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
</div>
