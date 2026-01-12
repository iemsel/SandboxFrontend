<script>
  import IdeaCard from '../../lib/components/IdeaCard.svelte';
  import { Search } from "@lucide/svelte";

  export let data;
  const { savedIdeas } = data;

  let search = "";
  
  // Filter to only show ideas where isFavorited === true
  $: filteredIdeas = savedIdeas.filter((idea) => {
    if (idea.isFavorited !== true) {
      return false;
    }
    if (!search) {
      return true;
    }
    const searchLower = search.toLowerCase();
    return idea.title.toLowerCase().includes(searchLower) ||
           (idea.description && idea.description.toLowerCase().includes(searchLower));
  });
</script>

<section class="px-8 py-6">
  <h1 class="text-3xl font-bold mb-8" style="color: var(--color-text-primary)">
    💾 Saved Items
  </h1>

  <!-- Search Bar -->
  <div class="flex items-center gap-3 mb-6">
    <div class="relative">
      <Search
        class="w-4 h-4 text-[var(--color-primary-dark)] absolute left-3 top-1/2 -translate-y-1/2"
      />
      <input
        bind:value={search}
        placeholder="Search saved ideas..."
        class="border px-10 py-2 rounded w-80 border-[var(--color-primary-dark)] focus:outline-none"
      />
    </div>
  </div>

  <!-- Saved Ideas Grid -->
  {#if filteredIdeas.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredIdeas as idea}
        <IdeaCard {idea} />
      {/each}
    </div>
  {:else if savedIdeas.length === 0}
    <div
      class="border-2 border-dashed rounded-xl p-10 text-center"
      style="color: var(--color-text-secondary); background-color: var(--color-white); border-color: var(--color-border)"
    >
      <div class="text-5xl mb-4">💾</div>
      <p class="mb-4">You haven't saved any ideas yet.</p>
      <a href="/"
        class="px-6 py-2 rounded inline-block"
        style="background-color: var(--color-primary-dark); color: var(--color-white)"
      >
        Browse Ideas
      </a>
    </div>
  {:else}
    <p style="color: var(--color-text-secondary)">No saved ideas match your search.</p>
  {/if}
</section>

<style>
  section {
    font-family: system-ui;
  }
</style>
