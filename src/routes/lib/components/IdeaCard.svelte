<script>
  export let idea;
</script>

<a href={`/idea/${idea.id}`}>  
  <div
    class="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
  >
    <!-- Image -->
    {#if idea.image_url}
      <div class="relative">
        <img
          src={idea.image_url}
          alt={idea.title}
          class="w-full h-40 object-cover rounded-xl"
        />
        <!-- Subject badge -->
        <span
          class="absolute top-3 left-3 bg-[var(--color-primary)] text-white text-xs px-3 py-1 rounded-full capitalize"
        >
          {idea.subject}
        </span>
      </div>
    {/if}

    <!-- Title & Description -->
    <div class="flex flex-col gap-1">
      <h3 class="font-semibold text-lg leading-tight">
        {idea.title}
      </h3>
      <p class="text-gray-600 text-sm line-clamp-3">
        {idea.description}
      </p>
    </div>

    <!-- Tags -->
    {#if idea.tags?.length}
      <div class="flex flex-wrap gap-2">
        {#each idea.tags as tag}
          <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            #{tag}
          </span>
        {/each}
      </div>
    {/if}

    <!-- Meta info -->
    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-auto">
      <span>⏱ {idea.time_label ?? `${idea.time_minutes} min`}</span>
      <span>🎯 {idea.difficulty}</span>
      <span>👧 {idea.min_age}–{idea.max_age} yrs</span>
      <span>🌦 {idea.weather}</span>
    </div>

    <!-- Footer pills -->
    <div class="flex justify-between items-center pt-2 border-t text-xs">
      <span class="bg-gray-100 px-3 py-1 rounded-full capitalize">
        {idea.yard_context}
      </span>
      <span class="bg-gray-100 px-3 py-1 rounded-full capitalize">
        {idea.season}
      </span>
    </div>
  </div>
</a>