/* eslint-disable prettier/prettier */

import { apiFetch } from "./client.js";

// POST /ai/generate
export function generateActivityIdeas(prompt, token) {
  return apiFetch("/ai/generate", {
    method: "POST",
    token,
    body: {
      prompt,
    },
  });
}
