<script>
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';

  const dispatch = createEventDispatcher();

  // Limits
  const AGE_MIN = 0;
  const AGE_MAX = 12;

  const DURATION_MIN = 0;
  const DURATION_MAX = 120;

  // Current filters
  let selectedDifficulty = null;
  let selectedSeason = null;
  let selectedYard = null;
  let selectedSubject = null;
  let selectedWeather = null;
  let minAge = AGE_MIN;
  let maxAge = AGE_MAX;
  let minDuration = DURATION_MIN;
  let maxDuration = DURATION_MAX;
  let favoritesOnly = false;

  $: if (minAge > maxAge) minAge = maxAge;
  $: if (minDuration > maxDuration) minDuration = maxDuration;

  // Example options
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const yards = ['Indoor', 'Outdoor', 'Both'];
  const subjects = ['Language', 'Math', 'Science', 'Arts'];
  const weathers = ['Sunny', 'Rainy', 'Snowy', 'Cloudy'];
  const tags = ['Listening', 'Creativity', 'Teamwork', 'Problem Solving'];

  function applyFilters() {
    dispatch('apply', {
      difficulty: selectedDifficulty,
      season: selectedSeason,
      subject: selectedSubject,
      weather: selectedWeather,
      minAge,
      maxAge,
      minDuration,
      maxDuration,
      favoritesOnly,
    });
  }

  async function clearFilters() {
    selectedDifficulty = null;
    selectedSeason = null;
    selectedSubject = null;
    selectedWeather = null;
    minAge = AGE_MIN;
    maxAge = AGE_MAX;
    minDuration = DURATION_MIN;
    maxDuration = DURATION_MAX;
    favoritesOnly = false;
    applyFilters();
  }

  function toggleSet(set, value) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }
</script>

<div class="p-6 flex flex-col gap-4">
  <!-- Favourite Toggle-->
  <h3 class="font-semibold mt-4 mb-2">Favorites</h3>
  <div class="flex items-center gap-2 mb-4">
    <input type="checkbox" bind:checked={favoritesOnly} id="favoritesOnly" />
    <label for="favoritesOnly" class="text-sm">Show only favorited ideas</label>
  </div>

  <!-- Difficulty -->
  <h3 class="font-semibold mb-2">Difficulty</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each difficulties as diff}
      <button
        class={`px-3 py-1 rounded border ${selectedDifficulty === diff ? 'bg-[var(--color-primary)] text-white' : 'bg-white'}`}
        on:click={() => (selectedDifficulty = selectedDifficulty === diff ? null : diff)}
        >{diff}</button
      >
    {/each}
  </div>

  <!-- Season -->
  <h3 class="font-semibold mb-2">Season</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each seasons as season}
      <button
        class={`px-3 py-1 rounded border ${selectedSeason === season ? 'bg-[var(--color-primary)] text-white' : 'bg-white'}`}
        on:click={() => (selectedSeason = selectedSeason === season ? null : season)}
        >{season}</button
      >
    {/each}
  </div>

  <!-- Subject -->
  <h3 class="font-semibold mb-2">Subject</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each subjects as sub}
      <button
        class={`px-3 py-1 rounded border ${selectedSubject === sub ? 'bg-[var(--color-primary)] text-white' : 'bg-white'}`}
        on:click={() => (selectedSubject = selectedSubject === sub ? null : sub)}>{sub}</button
      >
    {/each}
  </div>

  <!-- Weather -->
  <h3 class="font-semibold mb-2">Weather</h3>
  <div class="flex flex-wrap gap-2 mb-4">
    {#each weathers as weather}
      <button
        class={`px-3 py-1 rounded border ${selectedWeather === weather ? 'bg-[var(--color-primary)] text-white' : 'bg-white'}`}
        on:click={() => (selectedWeather = selectedWeather === weather ? null : weather)}
        >{weather}</button
      >
    {/each}
  </div>

  <!-- Age Range -->
  <h3 class="font-semibold mt-4 mb-2">Age Range</h3>
  <div class="flex items-center gap-3">
    <input type="range" min={AGE_MIN} max={AGE_MAX} bind:value={minAge} class="w-full" />
    <input type="range" min={AGE_MIN} max={AGE_MAX} bind:value={maxAge} class="w-full" />
  </div>
  <p class="text-sm text-gray-500">{minAge} – {maxAge} years</p>

  <!-- Duration -->
  <h3 class="font-semibold mt-4 mb-2">Duration (minutes)</h3>
  <div class="flex items-center gap-3">
    <input type="range" min={DURATION_MIN} max={DURATION_MAX} bind:value={minDuration} />
    <input type="range" min={DURATION_MIN} max={DURATION_MAX} bind:value={maxDuration} />
  </div>
  <p class="text-sm text-gray-500">
    {minDuration} – {maxDuration} min
  </p>

  <!-- Buttons -->
  <div class="flex gap-2 mt-4">
    <button class="px-4 py-2 bg-gray-200 rounded text-gray-700" on:click={clearFilters}
      >Clear</button
    >
    <button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded" on:click={applyFilters}
      >Apply</button
    >
  </div>
</div>
