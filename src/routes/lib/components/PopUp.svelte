<script>
  export let message = "";
  export let type = "success"; // "success", "error", "info"
  export let duration = 3000;

  import { onMount } from "svelte";

  let visible = true;

  onMount(() => {
    const timer = setTimeout(() => {
      visible = false;
    }, duration);

    return () => clearTimeout(timer);
  });

  function close() {
    visible = false;
  }
</script>

{#if visible}
  <div
    class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white z-50
      {type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}"
  >
    <div class="flex items-center justify-between gap-4">
      <span>{message}</span>
      <button class="font-bold" on:click={close}>✕</button>
    </div>
  </div>
{/if}
