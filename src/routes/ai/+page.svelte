<script>
  import Toast from "../lib/components/Toast.svelte";
  import { marked } from "marked";

  let prompt = "";
  let messages = [];
  let loading = false;

  let showToast = false;
  let toastMessage = "";
  let toastType = "success";


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
      //extracts the tile of the ideea as the main title idea once saved
      function extractTitle(rawText) {

      const headingMatch = rawText.match(/^#{1,3}\s*(.+)$/m);
      if (headingMatch) {
        return headingMatch[1].trim().slice(0, 80);
      }

      const sentences = rawText
        .replace(/[#*_]/g, "")
        .split(/[.!?]\s/)
        .map(s => s.trim())
        .filter(s =>
          s.length > 10 &&
          s.length < 80 &&
          !s.toLowerCase().startsWith("here's") &&
          !s.toLowerCase().startsWith("this activity") &&
          !s.toLowerCase().startsWith("below is")
        );

      if (sentences.length > 0) {
        return sentences[0];
      }

      return "AI Generated Activity";
    }

    //strips down the markdowns of the title of the idea once saved
    function extractTitleFromMarkdown(text = "") {
      const headingMatch = text.match(/^#{1,6}\s+(.*)$/m);
      if (headingMatch) return headingMatch[1].trim();

      return text
        .replace(/[#*_>`~-]/g, "")
        .split("\n")[0]
        .slice(0, 80)
        .trim();
    }

    //strips down the markdowns of the idea card once saved
    function stripMarkdown(text = "") {
      return text
        .replace(/[#*_>`~-]/g, "")
        .replace(/\n+/g, " ")
        .trim();
    }

    //Automatically Generated filters through specific text once saved
    function parseIdeaMetadata(rawText) {
      const text = rawText.toLowerCase();

      // Difficulty
      let difficulty = "Medium";
      if (text.includes("easy")) difficulty = "Easy";
      if (text.includes("hard")) difficulty = "Hard";

      // Season
      let season = null;
      if (text.includes("spring")) season = "Spring";
      else if (text.includes("summer")) season = "Summer";
      else if (text.includes("fall") || text.includes("autumn")) season = "Fall";
      else if (text.includes("winter")) season = "Winter";

      // Subject
      let subject = null;
      if (text.includes("math")) subject = "Math";
      else if (text.includes("science")) subject = "Science";
      else if (text.includes("art")) subject = "Arts";
      else if (text.includes("language") || text.includes("reading"))
        subject = "Language";

      // Weather
      let weather = null;
      if (text.includes("sunny")) weather = "Sunny";
      else if (text.includes("rain")) weather = "Rainy";
      else if (text.includes("snow")) weather = "Snowy";
      else if (text.includes("cloud")) weather = "Cloudy";

      // Indoor / Outdoor → yard (optional)
      let yard = null;
      if (text.includes("indoor")) yard = "Indoor";
      else if (text.includes("outdoor")) yard = "Outdoor";

      // Age
      const ageMatch = text.match(/(\d+)\s*[-–to]+\s*(\d+)/);
      let minAge = 0;
      let maxAge = 18;

      if (ageMatch) {
        minAge = parseInt(ageMatch[1]);
        maxAge = parseInt(ageMatch[2]);
      }

      return {
        difficulty,
        season,
        subject,
        weather,
        yard,
        min_age: minAge,
        max_age: maxAge
      };
    }

    //generate the time of the idea once saved
    function extractTime(rawText) {
      // Try to find explicit time
      const match = rawText.match(/(\d+)\s*(minutes|minute|min)/i);
      if (match) return parseInt(match[1]);

      // Fallback heuristic
      if (rawText.includes("quick") || rawText.includes("short")) return 15;
      if (rawText.includes("lesson") || rawText.includes("activity")) return 30;
      if (rawText.includes("project")) return 45;

      return 30; // safe default
    }

    //Saves the generated idea in the home page
    function saveIdea(rawText) {
      const stored = JSON.parse(localStorage.getItem("ideas") || "[]");

      const cleanTitle = extractTitle(rawText);
      const cleanDescription = stripMarkdown(rawText);

      const meta = parseIdeaMetadata(rawText);
      const timeMinutes = extractTime(rawText);

      const idea = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        description: cleanDescription,

        difficulty: meta.difficulty,
        season: meta.season ?? "any",
        subject: meta.subject ?? "general",
        weather: meta.weather ?? "any",
        yard_context: meta.yard ?? "any",

        min_age: meta.min_age,
        max_age: meta.max_age,

        time_minutes: timeMinutes,
        time_label: `${timeMinutes} min`,

        tags: [],
        categories: [],
        created_at: new Date().toISOString(),
        rating: null,
        source: "ai"
      };

  localStorage.setItem("ideas", JSON.stringify([idea, ...stored]));

  toastMessage = "Idea saved successfully!";
  toastType = "success";
  showToast = true;
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

    <!-- Saved Notification/Toast -->
      <Toast
        bind:visible={showToast}
        message={toastMessage}
        type={toastType}
      />

  </div>
</section>
