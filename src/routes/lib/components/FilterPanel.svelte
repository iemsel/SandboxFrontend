<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // Current filters
  let selectedDifficulty = null;
  let selectedSeason = null;
  let selectedYard = null;
  let selectedSubject = null;
  let selectedWeather = null;
  let minAge = 0;
  let maxAge = 18;

  // Example options 
  const difficulties = ["Easy", "Medium", "Hard"];
  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const yards = ["Indoor", "Outdoor", "Both"];
  const subjects = ["Language", "Math", "Science", "Arts"];
  const weathers = ["Sunny", "Rainy", "Snowy", "Cloudy"];
  const tags = ["Listening", "Creativity", "Teamwork", "Problem Solving"];
 

  function applyFilters() {
    dispatch("apply", {
      difficulty: selectedDifficulty,
      season: selectedSeason,
      subject: selectedSubject,
      weather: selectedWeather,
      minAge,
      maxAge
    });
  }

  function clearFilters() {
    selectedDifficulty = null;
    selectedSeason = null;
    selectedSubject = null;
    selectedWeather = null;
    selectedTags.clear();
    selectedCategories.clear();
    minAge = 0;
    maxAge = 18;
    applyFilters();
  }

  function toggleSet(set, value) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }
</script>

<div class="p-6 flex flex-col gap-4">
  <!-- Difficulty -->
  <h3 class="font-semibold mb-2">Difficulty</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each difficulties as diff}
      <button
        class={`px-3 py-1 rounded border ${selectedDifficulty === diff ? "bg-[var(--color-primary)] text-white" : "bg-white"}`}
        on:click={() => selectedDifficulty = selectedDifficulty === diff ? null : diff}
      >{diff}</button>
    {/each}
  </div>

  <!-- Season -->
  <h3 class="font-semibold mb-2">Season</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each seasons as season}
      <button
        class={`px-3 py-1 rounded border ${selectedSeason === season ? "bg-[var(--color-primary)] text-white" : "bg-white"}`}
        on:click={() => selectedSeason = selectedSeason === season ? null : season}
      >{season}</button>
    {/each}
  </div>

  <!-- Subject -->
  <h3 class="font-semibold mb-2">Subject</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each subjects as sub}
      <button
        class={`px-3 py-1 rounded border ${selectedSubject === sub ? "bg-[var(--color-primary)] text-white" : "bg-white"}`}
        on:click={() => selectedSubject = selectedSubject === sub ? null : sub}
      >{sub}</button>
    {/each}
  </div>

  <!-- Weather -->
  <h3 class="font-semibold mb-2">Weather</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each weathers as weather}
      <button
        class={`px-3 py-1 rounded border ${selectedWeather === weather ? "bg-[var(--color-primary)] text-white" : "bg-white"}`}
        on:click={() => selectedWeather = selectedWeather === weather ? null : weather}
      >{weather}</button>
    {/each}
  </div>

  <!-- Age Range -->
  <h3 class="font-semibold mt-4 mb-2">Age Range</h3>
  <div class="flex items-center gap-3">
    <input type="range" min="0" max="12" bind:value={minAge} class="w-full" />
    <input type="range" min="0" max="12" bind:value={maxAge} class="w-full" />
  </div>
  <p class="text-sm text-gray-500">{minAge} – {maxAge} years</p>

  <!-- Buttons -->
  <div class="flex gap-2 mt-4">
    <button class="px-4 py-2 bg-gray-200 rounded text-gray-700" on:click={clearFilters}>Clear</button>
    <button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded" on:click={applyFilters}>Apply</button>
  </div>
</div>
