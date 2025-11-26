<script>
  import "../app.css";
  import Nav from "./lib/components/Nav.svelte";
  let { children } = $props();
</script>

<Nav/>

<main class="p-4">
  {@render children?.()}
</main>

<footer class="p-4 text-center text-gray-600">
  © {new Date().getFullYear()}
</footer>
