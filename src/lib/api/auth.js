/* eslint-disable prettier/prettier */

import { authStore } from '$lib/api/authStore.js';

export async function register({ email, name, password }) {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    //Throws the specific message from the backend)
    throw new Error(data.error || 'Registation failed');
  }
  return data;
  // }).then(res => {
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   return res.json();
  // });
}

export async function login({ email, password }) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    //Throws "invalid credentials" instead of developer messages
    throw new Error(data.error || 'Invalid credentials');
  }
  return data;
  // }).then(res => {
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   return res.json();
  // });
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  authStore.logout();
}

export async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem('token');
  const res = await fetch('/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return handleResponse(res, 'Password change failed');
}

export async function resetPasswordRequest(email, newPassword) {
  const res = await fetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  
const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      return data;
  } else {
      const text = await res.text();
      console.error("Server returned non-JSON:", text);
      throw new Error(`Server Error: Route not found or Server crashed (HTTP ${res.status})`);
  }
}

async function handleResponse(res, fallbackError) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || fallbackError);
    return data;
  } else {
    const text = await res.text();
    // This will now tell you if it's a 404, 500, or 504 error
    throw new Error(`Server Error (HTTP ${res.status})`);
  }
}

export function getStoredUser() {
  const userJSON = localStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
}

export function me(token) {
  return apiFetch('/auth/me', { token });
}
