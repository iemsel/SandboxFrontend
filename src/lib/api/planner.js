/* eslint-disable prettier/prettier */
import { apiFetch } from '$lib/api/client.js'; // make sure path matches your project structure

const API_PREFIX = '/planner'; // matches your vite proxy

// GET /planner/plans?date=YYYY-MM-DD
export function listPlans({ date } = {}, token) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`${API_PREFIX}/plans${query}`, { token });
}

// POST /planner/plans
export function createPlan({ title, date, class_name, notes }, token) {
  return apiFetch(`${API_PREFIX}/plans`, {
    method: 'POST',
    token,
    body: { title, date, class_name, notes },
  });
}

// GET /planner/plans/:id
export function getPlan(id, token) {
  return apiFetch(`${API_PREFIX}/plans/${id}`, { token });
}

// POST /planner/plans/:id/items
export function addPlanItem(
  planId,
  { idea_id, custom_title, custom_description, start_time, end_time, location },
  token
) {
  return apiFetch(`${API_PREFIX}/plans/${planId}/items`, {
    method: 'POST',
    token,
    body: { idea_id, custom_title, custom_description, start_time, end_time, location },
  });
}
