/* eslint-disable prettier/prettier */

import { authStore } from '$lib/api/authStore.js';

export function register({ email, name, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { email, name, password },
  });
}

export function login({ email, password }) {
  // returns: { token, user: { id, email, name } }
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function me(token) {
  return apiFetch('/auth/me', { token });
}
