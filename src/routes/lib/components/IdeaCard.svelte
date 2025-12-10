<script>
  export let idea;
</script>
<div class="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200">
	<div class="relative">
		
		<span class="absolute top-2 right-15 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded">
			{idea.subject}
		</span>

		<button class="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
			❤️
		</button>
	</div>

	<h3 class="font-semibold text-lg">{idea.title}</h3>
	<p class="text-gray-600 text-sm">{idea.description}</p>

	<div class="flex items-center justify-between mt-auto text-sm text-gray-500">
    <div class="flex items-center gap-4">
      <span>⏱ {idea.time_minutes} min</span>
      <span>👧 {idea.difficulty}</span>
      <span>⭐ {idea.rating ?? 0}</span>
    </div>
    <!-- Difficulty Pill -->
    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
      {idea.level ?? "Easy"}
    </span>
  </div>
</div>