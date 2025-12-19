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

    // Average rating from comments
    avgRating: raw.avg_rating ? Number(raw.avg_rating) : null,
    ratingCount: raw.rating_count || 0,

    subject: raw.subject,
    season: raw.season,
    yard_context: raw.yard_context,
    isFavorited: raw.isFavorited || false
  };

  // Include comments from the API response
  // Comments now include userName from the backend
  const comments = (raw.comments || []).map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    name: comment.userName || 'User', // Use userName from backend, fallback to 'User'
    avatar: comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U',
    rating: comment.rating || 0,
    title: '', // Comments don't have titles in the DB
    text: comment.text,
    likes: comment.likes || 0,
    dislikes: comment.dislikes || 0,
    userReaction: comment.userReaction || null, // User's reaction if logged in
    created_at: comment.created_at
  }));

  return { idea, comments };
}
