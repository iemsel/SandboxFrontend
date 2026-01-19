// src/lib/api/client.js

// Accept either:
// - full URL: https://sandboxbackend-production-2e9f.up.railway.app
// - hostname only: sandboxbackend-production-2e9f.up.railway.app
// Fallback for local dev:
const BASE_URL_RAW = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3010';

function normalizeBaseUrl(url) {
  if (!url) return 'http://localhost:3010';

  // already has protocol
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // hostname only -> assume https in production
  if (url.includes('localhost')) return `http://${url}`;
  return `https://${url}`;
}

const BASE_URL = normalizeBaseUrl(BASE_URL_RAW);

// True when running on Vercel / prod-like environment
const isProductionBase = BASE_URL && !BASE_URL.includes('localhost');

/**
 * Normalize paths so the same frontend code works in:
 * - Local dev (Vite proxy): /api/... endpoints
 * - Production (Railway gateway): /auth, /ideas, /planner, /chat
 *
 * Our gateway routes are:
 *   /auth/*    -> auth-service
 *   /ideas/*   -> ideas-service
 *   /planner/* -> planner-service
 *   /chat/*    -> chat-service (optional)
 */
function normalizePathForEnvironment(path, isProduction) {
  if (!path.startsWith('/')) path = `/${path}`;

  // If someone calls /api/<service>/..., convert to /<service>/... for production
  if (isProduction) {
    // /api/planner/... -> /planner/...
    if (path.startsWith('/api/planner')) return path.replace(/^\/api\/planner/, '/planner');

    // /api/auth/... -> /auth/...
    if (path.startsWith('/api/auth')) return path.replace(/^\/api\/auth/, '/auth');

    // /api/ideas/... -> /ideas/...
    if (path.startsWith('/api/ideas')) return path.replace(/^\/api\/ideas/, '/ideas');

    // /api/chat/... -> /chat/...
    if (path.startsWith('/api/chat')) return path.replace(/^\/api\/chat/, '/chat');

    // Generic: /api/... -> /...
    if (path.startsWith('/api/')) return path.replace(/^\/api/, '');
  }

  // In dev, we *want* the proxy prefix for planner if your code uses /planner/*
  // (matches your earlier setup)
  if (!isProduction) {
    // /planner/... -> /api/planner/... so Vite proxy can forward it
    if (path.startsWith('/planner')) return path.replace(/^\/planner/, '/api/planner');
  }

  return path;
}

/**
 * Wrapper around fetch for browser + SSR.
 * - Browser dev: uses Vite proxy (relative paths)
 * - Browser prod (Vercel): uses absolute Railway gateway URL
 * - SSR: uses absolute Railway gateway URL
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', token, body } = options;

  const isBrowser = typeof window !== 'undefined';
  const isProduction = isProductionBase;

  const normalizedPath = normalizePathForEnvironment(path, isProduction);

  // Build the final URL
  const url = isProduction || !isBrowser
    ? `${BASE_URL}${normalizedPath}`
    : normalizedPath; // dev browser uses relative path (proxy)

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    const text = await res.text();

    if (!res.ok) {
      let errorBody;
      try {
        errorBody = text ? JSON.parse(text) : null;
      } catch {
        errorBody = null;
      }
      const message =
        (errorBody && (errorBody.error || errorBody.message)) ||
        text ||
        `Request failed with ${res.status}`;
      throw new Error(message);
    }

    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('Network/API error:', err);
    throw new Error(
      `Failed to connect to server at ${isProduction ? BASE_URL : 'dev proxy'}. ` +
      `Tried: ${url}.`
    );
  }
}
