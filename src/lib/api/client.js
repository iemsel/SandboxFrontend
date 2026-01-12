const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3010';

/**
 * Wrapper around fetch for browser + SSR.
 * In browser: uses `/api/...` so Vite proxy works.
 * In SSR: uses absolute URL.
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', token, body } = options;

  const isBrowser = typeof window !== 'undefined';

  // Browser uses /api prefix for proxy
  let url;
  if (isBrowser) {
    // Ensure paths starting with /planner go through proxy
    url = path.startsWith('/planner') ? path.replace(/^\/planner/, '/api/planner') : path;
  } else {
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