<script>
	export let user = "U";
</script>

<nav class="w-full text-white px-6 py-4 flex items-center justify-between
      bg-[linear-gradient(to_right,var(--color-primary),var(--color-primary-light))]">
	<div class="flex items-center gap-2 text-xl font-semibold">
		<span>🌿</span>
		<span>Green Clues</span>
	</div>

	<ul class="flex items-center gap-6">
		<li><a href="/" class="hover:underline">Home</a></li>
		<li><a href="/dashboard" class="hover:underline">Dashboard</a></li>
		<li><a href="/about" class="hover:underline">About</a></li>
		<li class="bg-white text-green-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">
			{user}
		</li>
	</ul>
</nav>

<style>
	nav { font-family: system-ui; }
</style>
