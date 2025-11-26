<script>
  import '../app.css';
  let { children } = $props();
</script>

<header class="bg-gray-100 p-4">
  <h1 class="text-lg font-semibold">My New Svelte App</h1>
</header>

<main class="p-4">
  {@render children?.()}
</main>

<footer class="p-4 text-center text-gray-600">
  © {new Date().getFullYear()}
</footer>
