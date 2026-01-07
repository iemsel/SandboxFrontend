<script>
  import { authStore } from '$lib/api/authStore';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!$authStore.isLoggedIn) {
      goto(resolve('/login'));
    }
  });

  // Pre set data untill we connect it to database
  let themes = [
    {
      id: 1,
      title: 'Default',
      equipped: true,
      colors: {
        '--color-primary': '#46826b',
        '--color-primary-light': '#b3f2da',
        '--color-primary-dark': '#2f5c48',

        '--color-secondary': '#f9edcf',
        '--color-secondary-light': '#fff4d6',
        '--color-secondary-dark': '#f7d48f',

        '--color-bg': '#f1f8f4',
        '--color-white': '#ffffff',
        '--color-border': '#c7e5d9',
        '--color-border-light': '#e0f2eb',

        '--color-text-primary': '#2f5c48',
        '--color-text-secondary': '#46826b',
        '--color-text-accent': '#b38600',
      },
    },

    {
      id: 2,
      title: 'Ocean',
      equipped: false,
      colors: {
        '--color-primary': '#1e3a5f',
        '--color-primary-light': '#7da6d3',
        '--color-primary-dark': '#0f1e2f',

        '--color-secondary': '#cfe4f9',
        '--color-secondary-light': '#e6f2ff',
        '--color-secondary-dark': '#9bbfe5',

        '--color-bg': '#e6f0fa',
        '--color-white': '#ffffff',
        '--color-border': '#b8d3ec',
        '--color-border-light': '#c7e0f5',

        '--color-text-primary': '#0f1e2f',
        '--color-text-secondary': '#1e3a5f',
        '--color-text-accent': '#2b6cb0',
      },
    },

    {
      id: 3,
      title: 'Dark',
      equipped: false,
      colors: {
        '--color-primary': '#3fa48d',
        '--color-primary-light': '#7bd8c2',
        '--color-primary-dark': '#1f5f52',

        '--color-secondary': '#2a2a2a',
        '--color-secondary-light': '#3a3a3a',
        '--color-secondary-dark': '#1f1f1f',

        '--color-bg': '#121212',
        '--color-white': '#1e1e1e',
        '--color-border': '#2f2f2f',
        '--color-border-light': '#3a3a3a',

        '--color-text-primary': '#e6f2ee',
        '--color-text-secondary': '#9fdac7',
        '--color-text-accent': '#f5c76b',
      },
    },

    {
      id: 4,
      title: 'Sunset',
      equipped: false,
      colors: {
        '--color-primary': '#ff7f50',
        '--color-primary-light': '#ffc3a6',
        '--color-primary-dark': '#b34727',

        '--color-secondary': '#ffe3d6',
        '--color-secondary-light': '#fff0e8',
        '--color-secondary-dark': '#f7b59c',

        '--color-bg': '#fff5f0',
        '--color-white': '#ffffff',
        '--color-border': '#ffd1c2',
        '--color-border-light': '#ffe0d6',

        '--color-text-primary': '#5a2a1d',
        '--color-text-secondary': '#b34727',
        '--color-text-accent': '#d97706',
      },
    },
  ];

  function applyTheme(theme) {
    for (const [key, value] of Object.entries(theme.colors)) {
      document.documentElement.style.setProperty(key, value);
    }

    localStorage.setItem('theme-id', theme.id);

    themes = themes.map((t) => ({
      ...t,
      equipped: t.id === theme.id,
    }));
  }
</script>

<section class="max-w-3xl mx-auto p-8 flex flex-col gap-6">
  <h1 class="text-xl font-semibold">Profile</h1>

  <!-- PROFILE HEADER -->
  <div class="flex items-center gap-6 bg-white rounded-lg p-6 shadow-sm">
    <div
      class="bg-white text-[var(--color-primary-dark)] font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-sm text-xl"
    >
      {$authStore.initial}
    </div>

    <div class="flex flex-col">
      <span class="text-sm text-gray-500">Email</span>
      <span class="font-medium">{$authStore.user?.email}</span>
    </div>
  </div>

  <!-- PASSWORD -->
  <div class="bg-white rounded-lg p-6 shadow-sm flex items-center justify-between">
    <div class="flex flex-col">
      <span class="text-sm text-gray-500">Password</span>
      <span class="tracking-widest">••••••••••••</span>
    </div>

    <button class="text-sm font-medium hover:underline">Change</button>
  </div>

  <!-- THEMES -->
  <section class="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-4">
    <h2 class="text-lg font-semibold">Theme selection</h2>

    <div class="flex flex-wrap gap-3">
      {#each themes as theme (theme.id)}
        <button
          on:click={() => applyTheme(theme)}
          class={`px-4 py-2 rounded text-sm border transition ${
            theme.equipped ? 'ring-2 font-semibold' : 'hover:opacity-80'
          }`}
        >
          {theme.title}
        </button>
      {/each}
    </div>
  </section>

  <!-- QUICK REDIRECTIONS -->
  <div class="mt-10 flex flex-col sm:flex-row justify-between">
    <button
      class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-white border border-[var(--color-border-light)]
        text-[var(--color-primary-dark)]
        hover:bg-gray-50 transition"
      on:click={() => goto(resolve('/'))}
    >
      🏠 Go To Home
    </button>

    <button
      class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-white border border-[var(--color-border-light)]
        text-[var(--color-primary-dark)]
        hover:bg-gray-50 transition"
      on:click={() => goto(resolve('/help'))}
    >
      ❓ Go to Tutorial or FAQ
    </button>

    <button
      class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-[var(--color-primary)]
        text-white font-semibold
        hover:bg-[var(--color-primary-dark)] transition"
      on:click={() => goto(resolve('/dashboard'))}
    >
      📊 Go to Dashboard
    </button>
  </div>
</section>

<style>
  section {
    font-family: system-ui;
  }
</style>
