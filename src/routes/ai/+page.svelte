<script>
  import { marked } from "marked";

  let prompt = "";
  let messages = [];
  let loading = false;

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  async function handleSend() {
    if (!prompt.trim()) return;

    messages = [...messages, { role: "user", content: prompt }];
    loading = true;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const data = await res.json();

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from AI.";

      messages = [
        ...messages,
        {
          role: "assistant",
          content: marked.parse(rawText),
          raw: rawText
        }
      ];
    } catch (error) {
      messages = [
        ...messages,
        {
          role: "assistant",
          content: "AI error: " + error.message
        }
      ];
    }

    loading = false;
    prompt = "";
  }

    function saveIdea(rawText) {
      const stored = JSON.parse(localStorage.getItem("ideas") || "[]");

      const difficulty = rawText.includes("easy") ? "easy" :
                        rawText.includes("hard") ? "hard" : "medium";
      const season = rawText.match(/spring|summer|fall|autumn|winter/i)?.[0] || "any";
      const minAge = rawText.match(/\b\d+\b/) ? parseInt(rawText.match(/\b\d+\b/)[0]) : 0;
      const maxAge = 18;
      const subject = "general";
      const weather = rawText.includes("indoor") ? "indoor" :
                      rawText.includes("outdoor") ? "outdoor" : "any";

      const idea = {
        id: crypto.randomUUID(),
        title: rawText.slice(0, 50),
        description: rawText,
        difficulty,
        season,
        min_age: minAge,
        max_age: maxAge,
        subject,
        weather,
        tags: [],
        categories: [],
        created_at: new Date().toISOString(),
        rating: null,
        source: "ai"
      };

      localStorage.setItem("ideas", JSON.stringify([idea, ...stored]));
      alert("Idea saved!");
    }

</script>

<!-- Page -->
<section class="min-h-screen bg-gradient-to-b from-white to-green-50">
  <div class="max-w-3xl mx-auto px-6 py-10 flex flex-col">

    <!-- Header -->
    <div class="text-center mb-10">
      <div class="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-2xl">
        ✨
      </div>
      <h1 class="text-3xl font-bold mb-2">Generate Activity Ideas</h1>
      <p class="text-gray-600">
        Describe what you need and save AI-generated ideas for later.
      </p>
    </div>

    <!-- Conversation -->
    <div class="flex flex-col gap-4 flex-1 mb-8">
      {#each messages as msg}
        <div
          class={`max-w-[80%] p-4 rounded-xl ${
            msg.role === "user"
              ? "self-end bg-[var(--color-primary)] text-white"
              : "self-start bg-white border shadow-sm text-black"
          }`}
        >
          {#if msg.role === "assistant"}
            <div class="prose prose-sm max-w-none">
              {@html msg.content}
            </div>

            <button
              class="mt-3 text-sm text-[var(--color-primary)] underline"
              on:click={() => saveIdea(msg.raw)}
            >
              Save idea
            </button>
          {:else}
            <p>{msg.content}</p>
          {/if}
        </div>
      {/each}

      {#if loading}
        <div class="self-start bg-white border p-4 rounded-xl text-gray-500">
          Generating ideas…
        </div>
      {/if}
    </div>

    <!-- Input -->
    <div class="sticky bottom-0 bg-white pt-4">
      <div class="flex items-center gap-3 border rounded-xl px-4 py-3 shadow-sm">
        <input
          bind:value={prompt}
          placeholder="Describe the activity you're looking for..."
          class="flex-1 focus:outline-none"
          on:keydown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          on:click={handleSend}
          class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          ➤
        </button>
      </div>

      <p class="text-xs text-gray-400 text-center mt-3">
        AI can make mistakes. Please review ideas before saving.
      </p>
    </div>

  </div>
</section>
