import { listIdeas } from '$lib/api/idea.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
  const token = cookies.get('token');
  let savedIdeas = [];

  if (!token) {
    return { savedIdeas: [] };
  }

  try {
    // Fetch saved ideas with favorites_only filter (only ideas the user has favorited)
    savedIdeas = await listIdeas({ favorites_only: 'true' }, token);
  } catch (err) {
    // Log errors but don't break the page
    console.error('Failed to fetch saved ideas:', err);
    savedIdeas = [];
  }

  return { savedIdeas };
}
