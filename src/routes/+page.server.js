import { listIdeas } from '$lib/api/idea.js'; // match your actual filename

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  let ideas = [];

  try {
    // Fetch ideas from the backend via apiFetch
    ideas = await listIdeas();
  } catch (err) {
    // Log errors but don't break the page
    console.error('Failed to fetch ideas:', err);
    ideas = [];
  }

  return { ideas };
}
