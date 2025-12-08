<script>
	export let data;
	import Nav from "./lib/components/Nav.svelte";
	import IdeaCard from "./lib/components/IdeaCard.svelte";
	import {
		Search,
		Filter,
		ChevronDown,
		Heart,
		Clock,
		Star
	} from "@lucide/svelte";

	let search = "";
	let selectedTag = "All";

	let showFilter = false;

	function toggleFilter() {
		showFilter = !showFilter;
	}
</script>


<section class="px-8 py-6">
	<h1 class="text-3xl font-bold mb-8">IDEAS</h1>
    <!-- Search + Actions Row -->
    <div class="flex items-center gap-3 mb-6">
		
		<!-- Search -->
		<div class="relative">
			<Search class="w-4 h-4 text-[var(--color-primary-dark)] absolute left-3 top-1/2 -translate-y-1/2" />
			<input
				bind:value={search}
				placeholder="Search ideas..."
				class="border px-10 py-2 rounded w-80 border-[var(--color-primary-dark)] focus:outline-none"
			/>
		</div>

		<!-- AI -->
		<button class="px-4 py-2 bg-[var(--color-primary)] text-white rounded">
			🫧 Generate with AI
		</button>

		<!-- Sort -->
		<button
			class="px-4 py-2 rounded border-[var(--color-primary-dark)] border bg-white flex items-center gap-2"
		>
			Name
			<ChevronDown class="w-4 h-4" />
		</button>

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
        {#each ["All", "Popular", "DIY", "Competition", "Group Project"] as tab}
            <button
                class={`px-4 py-2 rounded ${
                    selectedTag === tab
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-white"
                }`}
                on:click={() => (selectedTag = tab)}
            >
                {tab}
            </button>
        {/each}
    </div>

    <!-- Ideas Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each data.ideas as idea}
            <IdeaCard {idea} />
        {/each}
    </div>
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
		<p class="opacity-50">Put your filters here…</p>
	</div>
</div>

<style>
    section { font-family: system-ui; }
</style>