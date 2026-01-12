<script>
  export let message = "";
  export let visible = false;
  export let type = "success"; // success | error | info

  let timeout;

  $: if (visible) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      visible = false;
    }, 3000);
  }
</script>

{#if visible}
  <div
    class="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg
      transition-opacity duration-300
      {type === 'success'
        ? 'bg-green-700 text-white'
        : type === 'error'
        ? 'bg-red-700 text-white'
        : 'bg-gray-800 text-white'}"
    role="status"
    aria-live="polite"
  >
    {message}
  </div>
{/if}
