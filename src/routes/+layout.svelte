<script>
  import '../app.css';
  import Nav from './lib/components/Nav.svelte';
  import Notification from './lib/components/Notification.svelte';
  import { authStore } from '$lib/api/authStore.js';
  import { getStoredUser } from '$lib/api/auth.js';
  import { onMount } from 'svelte';

  const themes = {
    1: {},
    2: {},
    3: {},
    4: {},
  };

  function applyTheme(colors) {
    for (const [key, value] of Object.entries(colors)) {
      document.documentElement.style.setProperty(key, value);
    }
  }

  onMount(() => {
    const savedThemeId = localStorage.getItem('theme-id');
    if (!savedThemeId) return;

    const theme = themes[savedThemeId];
    if (theme) applyTheme(theme);
  });

  let { children } = $props();

  $effect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = getStoredUser();
      authStore.initialize(storedUser);
    }
  });
</script>

<Nav />

<main class="px-4 py-8 max-w-6xl mx-auto">
  {@render children?.()}
</main>

<footer class="p-4 text-center text-gray-600">
  © {new Date().getFullYear()}
</footer>

<Notification />

<style global>
  :root {
    --color-primary: #46826b;
    --color-primary-light: #b3f2da;
    --color-primary-dark: #2f5c48;
    --color-secondary: #f9edcf;
    --color-secondary-light: #fff4d6;
    --color-secondary-dark: #f7d48f;
    --color-bg: #f1f8f4;
    --color-white: #ffffff;
    --color-border: #c7e5d9;
    --color-border-light: #e0f2eb;
    --color-text-primary: #2f5c48;
    --color-text-secondary: #46826b;
    --color-text-accent: #b38600;
  }

  :global(body) {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
  }
</style>
