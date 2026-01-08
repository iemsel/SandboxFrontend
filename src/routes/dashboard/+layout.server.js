import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ cookies }) {
  const token = cookies.get('token');

  // If no token is found in cookies, redirect to login
  if (!token) {
    throw redirect(307, '/login');
  }

  // If there is a token, the dashboard is allowed to load
  return {};
}
