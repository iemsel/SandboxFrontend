const BASE_URL_RAW = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3010';

// Normalize BASE_URL to always have a protocol
// If it's a production URL without protocol, assume https://
function normalizeBaseUrl(url) {
  if (!url) return 'http://localhost:3010';
  
  // If it already has a protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's localhost, use http://
  if (url.includes('localhost')) {
    return `http://${url}`;
  }
  
  // Otherwise, assume https:// for production URLs
  return `https://${url}`;
}

const BASE_URL = normalizeBaseUrl(BASE_URL_RAW);

/**
 * Wrapper around fetch for browser + SSR.
 * In browser: uses `/api/...` so Vite proxy works in dev, or absolute URL in production.
 * In SSR: uses absolute URL.
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', token, body } = options;

  const isBrowser = typeof window !== 'undefined';
  const isProduction = BASE_URL && !BASE_URL.includes('localhost');

  // Browser: use absolute URL in production (Vercel), relative paths in dev (Vite proxy)
  let url;
  if (isBrowser) {
    if (isProduction) {
      // Production: use absolute URL
      url = `${BASE_URL}${path}`;
    } else {
      // Development: use relative paths for Vite proxy
      url = path.startsWith('/planner') ? path.replace(/^\/planner/, '/api/planner') : path;
    }
  } else {
    // SSR: always use absolute URL
    url = `${BASE_URL}${path}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      let errorBody;
      try { errorBody = JSON.parse(text); } catch { errorBody = { error: text || `Request failed with ${res.status}` }; }
      throw new Error(errorBody.error || `Request failed with ${res.status}`);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  } catch (err) {
    console.error('Network error:', err);
    const errorUrl = isBrowser ? url : BASE_URL;
    throw new Error(`Failed to connect to server at ${errorUrl}. Please check if the backend is running.`);
  }
}
