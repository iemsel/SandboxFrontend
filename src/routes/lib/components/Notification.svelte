<script>
  import { notification } from "$lib/stores/notifications.js";
  import { fade } from "svelte/transition";

  let visible = false;
  let current = null;

  $: if ($notification) {
    current = $notification;
    visible = true;

    // auto-hide after duration
    setTimeout(() => {
      visible = false;
      notification.set(null);
    }, current.duration || 3000);
  }
</script>

{#if visible && current}
  <div
    class="fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white"
    class:success={current.type === 'success'}
    class:error={current.type === 'error'}
    class:info={current.type === 'info'}
    transition:fade
  >
    {current.message}
  </div>
{/if}

<style>
.success { background-color: #44ca8e; }
.error { background-color: #b00020; }
.info { background-color: #0066cc; }
</style>
