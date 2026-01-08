import { listPlans } from '$lib/api/planner.js'; 

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const token = locals.token;

  if (!token) {
    console.log('[dashboard] no token');
    return { plans: [] };
  }

  try {
    // fetch all plans for this user
    const rawPlans = await listPlans({}, token);

    // Normalize plans similar to what you do in planner page
    const plans = rawPlans.map((p) => ({
      id: p.id,
      title: p.title,
      class_name: p.class_name,
      date: p.date,
      notes: p.notes,
      owner_id: p.owner_idy
    }));

    console.log('[dashboard] normalized plans:', plans);

    return { plans };
  } catch (err) {
    console.error('[dashboard] failed to fetch plans:', err);
    return { plans: [] };
  }
}
