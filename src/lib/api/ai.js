export async function generateActivityIdeas(prompt) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDxTT6R-WYjLIqKYPhwTD6Uq19WBawMrl0`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    console.error("Gemini error:", error);
    throw new Error("AI request failed");
  }

  const data = await res.json();

  return {
    text:
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response from AI",
  };
}
