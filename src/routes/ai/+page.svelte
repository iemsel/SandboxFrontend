<script>
  let prompt = "";
  let generating = false;

  function handleGenerate() {
    if (!prompt.trim()) return;

    generating = true;

    // TEMP: mock AI response
    setTimeout(() => {
      console.log("Prompt sent to AI:", prompt);
      generating = false;
    }, 1500);
  }
</script>

<section class="flex flex-col items-center px-6 py-12 text-center">
  <!-- Icon -->
  <div class="mb-6">
    <div class="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl">
      ✨
    </div>
  </div>

  <!-- Title -->
  <h1 class="text-3xl font-bold mb-2">
    Generate Custom Activity Ideas
  </h1>

  <!-- Description -->
  <p class="text-gray-600 max-w-md mb-8">
    Describe what you're looking for, and I'll help you create
    personalized eco-friendly activities for your students.
  </p>

  <!-- Input -->
  <div class="w-full max-w-md flex items-center gap-2 border rounded-xl px-4 py-2 bg-white">
    <input
      type="text"
      placeholder="Describe the activity you're looking for..."
      class="flex-1 outline-none"
      bind:value={prompt}
      disabled={generating}
    />

    <button
      on:click={handleGenerate}
      disabled={generating}
      class="px-4 py-2 rounded bg-[var(--color-primary)] text-white disabled:opacity-50"
    >
      ➤
    </button>
  </div>

  <!-- Disclaimer -->
  <p class="text-xs text-gray-400 mt-4">
    AI can make mistakes. Please verify the generated ideas before using them.
  </p>
</section>
