import { getIdeaById } from '$lib/api/idea.js';

function normalizeInstructions(raw) {
  // Prefer `raw.instructions` if present, otherwise fall back to `raw.instructions_json`
  const value = raw?.instructions ?? raw?.instructions_json;

  // Already an array -> perfect
  if (Array.isArray(value)) return value;

  // Null/undefined -> empty
  if (value == null) return [];

  // If it’s a string, it might be:
  // 1) JSON: '["Step 1","Step 2"]'
  // 2) Plain text: 'Show a simple example...'
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Try JSON parse
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      // If parsed but not array, wrap it
      return parsed != null ? [String(parsed)] : [];
    } catch {
      // Not JSON -> treat as a single instruction line
      return trimmed ? [trimmed] : [];
    }
  }

  // Anything else (object/number/etc) -> stringify and wrap
  return [String(value)];
}

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
    min_age: raw.min_age,
    max_age: raw.max_age,
    time_minutes: raw.time_minutes,
    time_label: raw.time_label,
    imageUrl: raw.image_url,

    // normalize
    tools: raw.materials ? raw.materials.split(',').map((s) => s.trim()).filter(Boolean) : [],
    instructions: normalizeInstructions(raw),

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
  const comments = (raw.comments || []).map((comment) => ({
    id: comment.id,
    user_id: comment.user_id,
    name: comment.userName || 'User',
    avatar: comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U',
    rating: comment.rating || 0,
    title: '',
    text: comment.text,
    likes: comment.likes || 0,
    dislikes: comment.dislikes || 0,
    userReaction: comment.userReaction || null,
    created_at: comment.created_at
  }));

  return { idea, comments };
}
