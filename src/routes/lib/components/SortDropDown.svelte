<script>
  import { createEventDispatcher } from "svelte";
  import { ChevronDown } from "@lucide/svelte";

  export let open = false;
  const dispatch = createEventDispatcher();

  function setSort(value) {
    dispatch("change", value);
    open = false; // close dropdown after selection
  }
</script>

<div class="relative">
  <button
    on:click={() => (open = !open)}
    class="px-4 py-2 rounded border-[var(--color-primary-dark)] border bg-white flex items-center gap-2"
  >
    Sort
    <ChevronDown class="w-4 h-4" />
  </button>

  {#if open}
    <div
      class="absolute mt-2 w-48 bg-white shadow-lg border border-[var(--color-primary-dark)] rounded z-50"
    >
      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('name-asc')}>
        Name ↑
      </button>
      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('name-desc')}>
        Name ↓
      </button>

      <hr />

      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('date-asc')}>
        Date ↑
      </button>
      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('date-desc')}>
        Date ↓
      </button>

      <hr />

      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('rating-asc')}>
        Rating ↑
      </button>
      <button class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        on:click={() => setSort('rating-desc')}>
        Rating ↓
      </button>
    </div>
  {/if}
</div>
