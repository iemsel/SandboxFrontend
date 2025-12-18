import { getIdeaById } from '$lib/api/idea.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const raw = await getIdeaById(params.id);

  if (!raw) {
    return { idea: null };
  }

  const idea = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    duration: raw.time_label ?? `${raw.time_minutes} min`,
    weather: raw.weather,
    difficulty: raw.difficulty,
    ageRange: `${raw.min_age}–${raw.max_age}`,
    imageUrl: raw.image_url,

    // normalize
    tools: raw.materials ? raw.materials.split(',').map(s => s.trim()) : [],
    instructions: raw.instructions
      ? raw.instructions
      : (raw.instructions_json ? JSON.parse(raw.instructions_json) : []),

    tags: raw.tags ?? [],

    // ratings (not in db rn)
    ratings: {
      fun: null,
      learning: null,
      difficulty: null,
      setup: null,
      time: null
    },

    subject: raw.subject,
    season: raw.season,
    yard_context: raw.yard_context
  };

  // Include comments from the API response
  // Comments only have user_id, not user info, so we'll use generic names
  const comments = (raw.comments || []).map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    name: 'User', // Generic name since we don't have user info
    avatar: 'U',
    rating: comment.rating || 0,
    title: '', // Comments don't have titles in the DB
    text: comment.text,
    likes: 0, // Not in DB yet
    dislikes: 0, // Not in DB yet
    created_at: comment.created_at
  }));

  return { idea, comments };
}
