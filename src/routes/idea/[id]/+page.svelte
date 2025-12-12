<script>
  import Nav from "../../lib/components/Nav.svelte";
  import IdeaCard from "../../lib/components/IdeaCard.svelte";

  let search = "";
  let showAI = false;

  // Mock data 
  export let idea = {
    title: "Build a Bird Feeder",
    description:
      "Create a simple bird feeder using recycled materials and watch local birds visit your garden.",
    ageRange: "7-9",
    weather: "sunny",
    duration: "45-60 minutes",
    imageUrl: "https://placehold.co/600x600",
    tools: ["Plastic bottle", "String", "Scissors"],
    instructions: [
      "Clean and dry a plastic bottle",
      "Cut two small holes near the bottom",
      "Insert a wooden spoon",
      "Fill with birdseed"
    ],
    tags: ["Nature", "Recycle"],
    ratings: {
      fun: 4.5,
      learning: 4.2,
      difficulty: 2.0,
      setup: 3.5,
      time: 3.0
    }
  };

  let comments = [
    {
      name: "Jane Doe",
      avatar: "JD",
      rating: 5,
      title: "Amazing activity!",
      text: "My students loved this project.",
      likes: 12,
      dislikes: 0
    },
    {
      name: "Mike Smith",
      avatar: "MS",
      rating: 4,
      title: "Great outside",
      text: "Kids learned a lot.",
      likes: 8,
      dislikes: 1
    }
  ];

  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    // Add a body class to identify this page
    document.body.classList.add('idea-page');
    // Modify the main element
    const main = document.querySelector('main');
    if (main) {
      main.classList.remove('max-w-6xl', 'mx-auto');
      main.classList.add('w-full', 'max-w-none');
    }
  });

  // Clean up when leaving the page
  onDestroy(() => {
    // Remove body class
    document.body.classList.remove('idea-page');
    
    // Restore main element classes
    const main = document.querySelector('main');
    if (main && main.dataset.originalClasses) {
      // Reset to original classes
      main.className = main.dataset.originalClasses;
      // Clean up the data attribute
      delete main.dataset.originalClasses;
    } else if (main) {
      // Fallback: add back the default classes
      main.classList.add('max-w-6xl', 'mx-auto');
      main.classList.remove('w-full', 'max-w-none');
    }
  });
</script>

<!-- MAIN CONTENT WRAPPER THAT SLIDES LEFT -->
<div class="flex min-h-screen">
  <!-- Main Content Area - adds right margin when AI panel opens -->
  <div class="flex-1 transition-all duration-300 {showAI ? 'mr-[480px]' : 'mr-0'}">
    <div class="w-full px-4 py-8 max-w-7xl mx-auto">

      <!-- Back Button -->
      <a href="/" class="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <span class="h-4 w-4">←</span>
        Back to Ideas
      </a>

      <div class="grid gap-8 lg:grid-cols-[1fr_400px] w-full">

        <!-- LEFT COLUMN -->
        <div class="space-y-8">

          <!-- Title & Meta -->
          <div>
            <h1 class="mb-2 text-4xl font-bold text-[var(--color-text-primary)]">{idea.title}</h1>
            <p class="mb-4 text-lg text-gray-600">{idea.description}</p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>Age {idea.ageRange}</span>
              <span>•</span>
              <span>☀️ {idea.weather}</span>
              <span>•</span>
              <span class="flex items-center gap-1">
                ⏱ {idea.duration}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button class="px-4 py-2 rounded bg-[var(--color-primary)] cursor-pointer text-white font-medium hover:bg-[var(--color-primary)] transition-colors">
              Plan
            </button>
            <button class="px-4 py-2 rounded border border-[var(--color-border)] cursor-pointer font-medium hover:bg-[var(--color-border-light)] transition-colors">
              Find similar
            </button>
            <button
              class="px-4 py-2 rounded bg-[var(--color-primary)] text-white cursor-pointer font-medium hover:bg-[var(--color-primary)] transition-colors"
              on:click={() => showAI = true}
            >
              Personalize
            </button>
            <button on:click={() => window.print()} class="px-4 py-2 rounded border border-[var(--color-border)] cursor-pointer font-medium hover:bg-[var(--color-border-light)] transition-colors">
              Print
            </button>
          </div>

          <!-- Tools -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Tools & Materials</h2>
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
              <ul class="space-y-3">
                {#each idea.tools as tool}
                  <li class="flex items-start gap-3">
                    <span class="mt-1 h-5 w-5 rounded-full border-2 border-[var(--color-primary)] bg-white"></span>
                    <span class="text-gray-700">{tool}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Instructions -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Instructions</h2>
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
              <ol class="space-y-6">
                {#each idea.instructions as step, i}
                  <li class="flex gap-4">
                    <span class="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span class="pt-1 text-gray-700">{step}</span>
                  </li>
                {/each}
              </ol>
            </div>
          </div>

          <!-- Comments -->
          <div class="space-y-4 comments-section">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Comments</h2>

            <!-- Add Review -->
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white space-y-4">
              <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">Add Your Review</h3>
              <div class="space-y-4">
                <input class="w-full border border-[var(--color-border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" placeholder="Title" />
                <textarea class="w-full border border-[var(--color-border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" placeholder="Write your review..." rows="4"></textarea>
                <button class="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)] transition-colors">
                  Submit Review
                </button>
              </div>
            </div>

            <!-- Existing Comments -->
            {#each comments as c}
              <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
                <div class="flex gap-4">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center font-bold text-white">
                    {c.avatar}
                  </div>
                  <div class="flex-1">
                    <div class="mb-1 flex items-center gap-2">
                      <span class="font-semibold text-gray-900">{c.name}</span>
                      <div class="flex gap-0.5">
                        {#each Array(c.rating) as _, i}
                          <span class="text-yellow-400">★</span>
                        {/each}
                        {#each Array(5 - c.rating) as _, i}
                          <span class="text-gray-300">★</span>
                        {/each}
                      </div>
                    </div>

                    <h4 class="mb-2 font-medium text-gray-900">{c.title}</h4>
                    <p class="mb-3 text-sm text-gray-600">{c.text}</p>

                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span>👍 {c.likes}</span>
                      <span>👎 {c.dislikes}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="space-y-6">
          <div class="border border-[var(--color-border)] rounded-lg overflow-hidden bg-white">
            <img src={idea.imageUrl} alt={idea.title} class="w-full h-96 object-cover" />
          </div>

          <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white space-y-6 ratings-panel">
            <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">Ratings</h3>
            {#each Object.entries(idea.ratings) as [key, value]}
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="capitalize text-gray-700">{key}</span>
                  <span class="text-gray-600 font-medium">{value.toFixed(1)}/5</span>
                </div>
                <div class="flex gap-1">
                  {#each Array(Math.round(value)) as _, i}
                    <span class="text-2xl text-yellow-400">★</span>
                  {/each}
                  {#each Array(5 - Math.round(value)) as _, i}
                    <span class="text-2xl text-gray-300">★</span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI DRAWER -->
  {#if showAI}
    <div
      class="
        fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-[var(--color-border)] z-50
        w-[480px] transition-all duration-300 ease-out
        flex flex-col
      "
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-xl text-white">✨</span>
          </div>
          <h2 class="text-xl font-semibold text-white">Personalize Activity</h2>
        </div>
        <button 
          class="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          on:click={() => showAI = false}
        >
          <span class="text-white text-lg">×</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="space-y-3">
          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">I don't have the right tool</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">The weather is different</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">It's too time consuming</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">I'm working with a different age group</span>
          </button>
        </div>

        <div class="pt-6 border-t border-[var(--color-border)] sticky top-[100vh]">
          <div class="relative">
            <input 
              placeholder="Ask anything..." 
              class="w-full border border-[var(--color-border)] rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
            <span class="absolute left-4 top-4 text-gray-400">💬</span>
            <button class="absolute right-4 top-4 h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
              <span class="text-white text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>


<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #f1f8f4;
    margin: 0;
    overflow-x: hidden;
  }
  
  /* Smooth transitions */
  * {
    transition-property: color, background-color, border-color, transform, margin;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }
  
  /* Ensure proper stacking */
  .z-50 {
    z-index: 50;
  }
  
  .z-40 {
    z-index: 40;
  }
</style>
