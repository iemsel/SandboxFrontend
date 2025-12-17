import { getIdeaById } from '$lib/api/idea.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const raw = await getIdeaById(params.ideaId);

  if (!raw) {
    return { idea: null };
  }

  function parseDuration(raw) {
  if (typeof raw.time_label === 'string') {
    const range = raw.time_label.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) {
      return {
        min: Number(range[1]),
        max: Number(range[2])
      };
    }

    const single = raw.time_label.match(/(\d+)/);
    if (single) {
      const val = Number(single[1]);
      return { min: val, max: val };
    }
  }

  if (raw.time_min != null && raw.time_max != null) {
    return {
      min: raw.time_min,
      max: raw.time_max
    };
  }

  if (raw.time_minutes != null) {
    return {
      min: raw.time_minutes,
      max: raw.time_minutes
    };
  }

  return {
    min: null,
    max: null
  };
}

  const idea = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    duration: parseDuration(raw),
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
