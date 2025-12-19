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
    instructions: raw.instructions_json
      ? JSON.parse(raw.instructions_json)
      : [],

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

  return { idea };
}
