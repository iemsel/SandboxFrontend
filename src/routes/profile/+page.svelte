<script>
  import { authStore } from "$lib/api/authStore";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$authStore.isLoggedIn) {
      goto("/login");
    }
  });

  // Mock themes for now (no API yet)
  let themes = [
    { id: 1, title: "Default", equipped: true },
    { id: 2, title: "Ocean", equipped: false },
    { id: 3, title: "Forest", equipped: false },
    { id: 4, title: "Sunset", equipped: false },
  ];

  function equipTheme(theme) {
    themes = themes.map(t => ({
      ...t,
      equipped: t.id === theme.id
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
      <span class="font-medium">
        {$authStore.user?.email}
      </span>
    </div>
  </div>

  <!-- PASSWORD -->
  <div class="bg-white rounded-lg p-6 shadow-sm flex items-center justify-between">
    <div class="flex flex-col">
      <span class="text-sm text-gray-500">Password</span>
      <span class="tracking-widest">••••••••••••</span>
    </div>

    <button class="text-sm font-medium hover:underline">
      Change
    </button>
  </div>

  <!-- THEMES -->
  <section class="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-4">
    <h2 class="text-lg font-semibold">Theme selection</h2>

    <div class="flex flex-wrap gap-3">
      {#each themes as theme}
        <button
          on:click={() => equipTheme(theme)}
          class="px-4 py-2 rounded text-sm border transition
            {theme.equipped ? 'ring-2 font-semibold' : 'hover:opacity-80'}"
        >
          {theme.title}
        </button>
      {/each}
    </div>
  </section>

  <!-- QUICK REDIRECTIONS-->
  <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
    <button
      class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            bg-white border border-[var(--color-border-light)]
            text-[var(--color-primary-dark)]
            hover:bg-gray-50 transition"
      on:click={() => goto("/")}
    >
      🏠 Go To Home
    </button>

    <button
      class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            bg-[var(--color-primary)]
            text-white font-semibold
            hover:bg-[var(--color-primary-dark)] transition"
      on:click={() => goto("/dashboard")}
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