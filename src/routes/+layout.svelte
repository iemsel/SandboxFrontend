<script>
  import "../app.css";
  import Nav from "./lib/components/Nav.svelte";
  let { children } = $props();
</script>
<style global>
  :root {
    /* Primary Colors */
    --color-primary: #46826b;
    --color-primary-light: #b3f2da;
    --color-primary-dark: #2f5c48;

    /* Secondary / Accent Colors */
    --color-secondary: #f9edcf;
    --color-secondary-light: #fff4d6;
    --color-secondary-dark: #f7d48f;

    /* Neutral Colors */
    --color-bg: #f1f8f4;
    --color-white: #ffffff;
    --color-border: #c7e5d9;
    --color-border-light: #e0f2eb;

    /* Text Colors */
    --color-text-primary: #2f5c48;
    --color-text-secondary: #46826b;
    --color-text-accent: #b38600; 
  }

  :global(body) {
    background-color: var(--color-bg);
  }
</style>
<Nav/>

<main class="px-4 py-8 max-w-6xl mx-auto">
  {@render children?.()}
</main>

<footer class="p-4 text-center text-gray-600">
  © {new Date().getFullYear()}
</footer>
