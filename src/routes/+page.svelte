<script>
	import Nav from "./lib/components/Nav.svelte";
	import IdeaCard from "./lib/components/IdeaCard.svelte";

	let search = "";
</script>



<section class="px-8 py-6">
	<h1 class="text-3xl font-bold mb-4">IDEAS</h1>

	<!-- Search + Filters -->
	<div class="flex items-center gap-4 mb-6">
		<p>filters and sorts</p>
	</div>

	<!-- Tags -->
	<div class="flex items-center gap-3 mb-8">
		<button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded">All Ideas</button>
    <button class="px-4 py-2 bg-[var(--color-white)] rounded">Popular</button>
		<button class="px-4 py-2 bg-[var(--color-white)] rounded">DIY</button>
		<button class="px-4 py-2 bg-[var(--color-white)] rounded">Competition</button>
		<button class="px-4 py-2 bg-[var(--color-white)] rounded">Group Project</button>
	</div>

	<!-- Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			<IdeaCard />
	</div>
</section>

<style>
	section { font-family: system-ui; }
</style>
