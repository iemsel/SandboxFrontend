<script>
  export let data;
  import Nav from "./lib/components/Nav.svelte";
  import IdeaCard from "./lib/components/IdeaCard.svelte";
  import SortDropDown from "./lib/components/SortDropDown.svelte";
  import {
    Search,
    Filter,
    ChevronDown,
    Heart,
    Clock,
    Star,
  } from "@lucide/svelte";
  import FilterPanel from "./lib/components/FilterPanel.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    handleApplyFilters({ detail: filters });
  });

  const QUICK_FILTERS = {
    All: {
      minAge: 0,
      maxAge: 18,
      minDuration: 0,
      maxDuration: 120,
      difficulty: null,
    },

    Popular: {
      // placeholder for later when rating works
    },

    "Quick and Easy": {
      maxDuration: 30,
      difficulty: "Easy",
    },

    Challenge: {
      difficulty: "Hard",
    },
  };

  let search = "";
  let selectedTag = "All";

  let showFilter = false;
  function toggleFilter() {
    showFilter = !showFilter;
  }

  // Initialize ideas safely for SSR
  let ideas = [...data.ideas];

  // Sort
  let sortBy = null;
  function applySort(sortValue) {
    sortBy = sortValue;

    ideas = [...ideas].sort((a, b) => {
      switch (sortValue) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "date-asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "date-desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "rating-asc":
          return (a.rating ?? 0) - (b.rating ?? 0);
        case "rating-desc":
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return 0;
      }
    });
  }

  //Filter
  const BASE_FILTERS = {
    difficulty: null,
    season: null,
    yard: null,
    subject: null,
    weather: null,
    tags: [],
    categories: [],
    minAge: 0,
    maxAge: 18,
    minDuration: 0,
    maxDuration: 120,
  };
  let filters = { ...BASE_FILTERS };

  function handleApplyFilters(e) {
    filters = e.detail;
    showFilter = false;
  }

  function applyQuickFilter(tab) {
    selectedTag = tab;

    if (tab === "All") {
      filters = { ...BASE_FILTERS };
      return;
    }

    const preset = QUICK_FILTERS[tab];
    if (!preset) return;

    filters = {
      ...BASE_FILTERS,
      ...preset,
    };
  }

  $: filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDifficulty =
      !filters.difficulty ||
      idea.difficulty.toLowerCase() === filters.difficulty.toLowerCase();

    const seasonMap = {
      Spring: "spring",
      Summer: "summer",
      Fall: "autumn",
      Winter: "winter",
    };
    const matchesSeason =
      !filters.season ||
      idea.season.toLowerCase() === "any" ||
      idea.season.toLowerCase() === seasonMap[filters.season];

    const matchesAge =
      idea.max_age >= filters.minAge && idea.min_age <= filters.maxAge;

    const matchesDuration =
      idea.time_minutes >= filters.minDuration &&
      idea.time_minutes <= filters.maxDuration;

    const matchesSubject =
      !filters.subject ||
      (idea.subject &&
        idea.subject.toLowerCase() === filters.subject.toLowerCase());

    const matchesWeather =
      !filters.weather ||
      (idea.weather &&
        idea.weather.toLowerCase() === filters.weather.toLowerCase());

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesSeason &&
      matchesAge &&
      matchesSubject &&
      matchesWeather &&
      matchesDuration
    );
  });

  function handleIdeaClick(idea) {
    console.log("Clicked idea:", idea);
  }
</script>

<section class="px-8 py-6">
  <h1 class="text-3xl font-bold mb-8">IDEAS</h1>

  <!-- Search + Actions Row -->
  <div class="flex items-center gap-3 mb-6">
    <!-- Search -->
    <div class="relative">
      <Search
        class="w-4 h-4 text-[var(--color-primary-dark)] absolute left-3 top-1/2 -translate-y-1/2"
      />
      <input
        bind:value={search}
        placeholder="Search ideas..."
        class="border px-10 py-2 rounded w-80 border-[var(--color-primary-dark)] focus:outline-none"
      />
    </div>

    <!-- AI -->
    <a href="/ai">
      <button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded">
        🫧 Generate with AI
      </button>
    </a>

    <!-- Sort -->
    {#if ideas.length}
      <SortDropDown on:change={(e) => applySort(e.detail)} />
    {/if}

    <!-- Filter -->
    <button
      class="px-4 py-2 rounded border-[var(--color-primary-dark)] border bg-white flex items-center gap-2"
      on:click={toggleFilter}
    >
      <Filter class="w-4 h-4" />
      Filter
    </button>

    <!-- Add Idea -->
    <button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded">
      + Add Idea
    </button>
  </div>

  <!-- Category Tabs -->
  <div class="flex items-center gap-3 mb-8">
    {#each ["All", "Popular", "Quick and Easy", "Challenge"] as tab}
      <button
        class={`px-4 py-2 rounded ${
          selectedTag === tab
            ? "bg-[var(--color-primary)] text-white"
            : "bg-white"
        }`}
        on:click={() => applyQuickFilter(tab)}
      >
        {tab}
      </button>
    {/each}
  </div>

  <!-- Ideas Grid -->
  {#if filteredIdeas.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredIdeas as idea}
        <IdeaCard {idea} />
      {/each}
    </div>
  {:else}
    <p>No ideas found.</p>
  {/if}
</section>

<!-- Dark Background Overlay -->
{#if showFilter}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    on:click={() => (showFilter = false)}
  ></div>
{/if}

<!-- Slide-in Filter Panel -->
<div
  class="fixed top-0 right-0 h-full w-120 bg-white shadow-xl z-50 transform transition-transform duration-300
  {showFilter ? 'translate-x-0' : 'translate-x-full'}"
>
  <div class="p-6 flex justify-between items-center border-b">
    <h2 class="text-xl font-semibold">Filters</h2>
    <button
      class="px-3 py-1 rounded border border-[var(--color-primary-dark)] text-[var(--color-primary-dark)]"
      on:click={() => (showFilter = false)}
    >
      Close
    </button>
  </div>

  <!-- Filter content goes here -->
  <div class="p-6">
    <FilterPanel on:apply={handleApplyFilters} />
  </div>
</div>

<style>
  section {
    font-family: system-ui;
  }
</style>