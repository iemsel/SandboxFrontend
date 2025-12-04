<script>
	import Nav from "../../lib/components/Nav.svelte";
	import IdeaCard from "../../lib/components/IdeaCard.svelte";

	let search = "";

  // Mock data placeholders (no logic)
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
</script>

<div class="min-h-screen bg-background w-full">
  <div class="w-full px-4 py-8 max-w-full mx-auto">
    <!-- Back Button -->
    <a href="/" class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
      <span class="h-4 w-4">←</span>
      Back to Ideas
    </a>

    <div class="grid gap-8 lg:grid-cols-[1fr_400px] w-full">
      <!-- LEFT COLUMN -->
      <div class="space-y-8">
        <!-- Title & Meta -->
        <div>
          <h1 class="mb-2 text-4xl font-bold">{idea.title}</h1>
          <p class="mb-4 text-lg text-muted-foreground">{idea.description}</p>

          <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          <button class="px-4 py-2 rounded bg-green-900 text-white">Plan</button>
          <button class="px-4 py-2 rounded border">Find similar</button>
          <button class="px-4 py-2 rounded bg-green-600 text-white">Personalize</button>
          <button class="px-4 py-2 rounded border">Print</button>
        </div>

        <!-- Tools -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Tools & Materials</h2>
          <div class="border rounded p-6">
            <ul class="space-y-2">
              {#each idea.tools as tool}
                <li class="flex items-start gap-3">
                  <span class="h-5 w-5 rounded-full border-2 border-green-800"></span>
                  <span>{tool}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <!-- Instructions -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Instructions</h2>
          <div class="border rounded p-6">
            <ol class="space-y-4">
              {#each idea.instructions as step, i}
                <li class="flex gap-4">
                  <span class="h-8 w-8 flex items-center justify-center rounded-full bg-green-700 text-white font-bold">
                    {i + 1}
                  </span>
                  <span class="pt-1 text-sm">{step}</span>
                </li>
              {/each}
            </ol>
          </div>
        </div>

        <!-- Comments -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Comments</h2>

          <!-- Add Review (design only, no logic) -->
          <div class="border rounded p-6 space-y-4">
            <h3 class="text-lg font-semibold">Add Your Review</h3>
            <div class="space-y-2">
              <input class="w-full border rounded p-2" placeholder="Title" />
              <textarea class="w-full border rounded p-2" placeholder="Write your review..."></textarea>
              <button class="w-full px-4 py-2 bg-green-800 text-white rounded">Submit Review</button>
            </div>
          </div>

          <!-- Existing Comments -->
          {#each comments as c}
            <div class="border rounded p-6">
              <div class="flex gap-4">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                  {c.avatar}
                </div>
                <div class="flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <span class="font-semibold">{c.name}</span>
                    <div class="flex gap-0.5 text-yellow-400">
                      {'★'.repeat(c.rating)}
                    </div>
                  </div>

                  <h4 class="mb-2 font-medium">{c.title}</h4>
                  <p class="mb-3 text-sm text-muted-foreground">{c.text}</p>

                  <div class="flex items-center gap-4 text-sm">
                    👍 {c.likes}
                    👎 {c.dislikes}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="space-y-6">
        <!-- Image -->
        <div class="border rounded overflow-hidden">
          <img src={idea.imageUrl} alt={idea.title} class="w-full h-full object-cover" />
        </div>

        <!-- Ratings -->
        <div class="border rounded p-6 space-y-4">
          <h3 class="text-lg font-semibold">Ratings</h3>

          {#each Object.entries(idea.ratings) as [key, value]}
            <div class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="capitalize">{key}</span>
                <span>{value.toFixed(1)}/5</span>
              </div>
              <div class="flex gap-1 text-yellow-400 text-3xl">
                {'★'.repeat(Math.round(value))}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
	div { font-family: system-ui; }
</style>
