<script>
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Gemini API error:", err);
        throw new Error(err.error?.message ?? "Gemini API failed");
      }

      const data = await res.json();

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from AI.";

      messages = [...messages, { role: "assistant", content: aiText }];
    } catch (error) {
      console.error("AI ERROR:", error);
      messages = [
        ...messages,
        { role: "assistant", content: "AI error: " + error.message }
      ];
    }

    loading = false;
    prompt = "";
  }
</script>




<!-- Page container -->
<section class="min-h-screen bg-gradient-to-b from-white to-green-50">
  <div class="max-w-3xl mx-auto px-6 py-10 flex flex-col">

    <!-- Title -->
    <div class="text-center mb-10">
      <div class="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-2xl">
        ✨
      </div>
      <h1 class="text-3xl font-bold mb-2">Generate Custom Activity Ideas</h1>
      <p class="text-gray-600">
        Describe what you're looking for, and I'll help you create personalized
        eco-friendly activities for your students.
      </p>
    </div>

    <!-- Conversation -->
    <div class="flex flex-col gap-4 flex-1 mb-8">
      {#each messages as msg}
        <div
          class={`max-w-[80%] p-4 rounded-xl ${
            msg.role === "user"
              ? "self-end bg-[var(--color-primary)] text-white"
              : "self-start bg-white border shadow-sm"
          }`}
        >
          <p>{msg.content}</p>

          <!-- Render generated ideas -->
          {#if msg.ideas}
            <div class="mt-4 space-y-3">
              {#each msg.ideas as idea}
                <div class="border rounded-lg p-3 bg-gray-50">
                  <h4 class="font-semibold">{idea.title}</h4>
                  <p class="text-sm text-gray-600">{idea.description}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {idea.difficulty} · {idea.time_minutes} min · {idea.subject}
                  </p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      {#if loading}
        <div class="self-start bg-white border p-4 rounded-xl text-gray-500">
          Generating ideas…
        </div>
      {/if}
    </div>

    <!-- Input bar -->
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
        AI can make mistakes. Please verify the generated ideas before using them.
      </p>
    </div>

  </div>
</section>
