const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3010';

/**
 * Small wrapper around fetch that:
 * - uses relative paths in browser (goes through Vite proxy)
 * - uses absolute URL in server-side rendering
 * - adds JSON headers
 * - adds Authorization header if token is provided
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', token, body } = options;
  // In browser, use relative path to go through Vite proxy
  // In SSR, use absolute URL
  const isBrowser = typeof window !== 'undefined';
  const url = isBrowser ? path : `${BASE_URL}${path}`;

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
      // Read response as text first (can only read body once)
      const text = await res.text();
      let errorBody;
      try {
        errorBody = JSON.parse(text);
      } catch {
        // Not JSON, use text as error message
        errorBody = { error: text || `Request failed with ${res.status}` };
      }
      console.error('API error', res.status, errorBody);
      throw new Error(errorBody.error || `Request failed with ${res.status}`);
    }

    // 204 No Content → no JSON
    if (res.status === 204) return null;

    // Read response as text first, then parse JSON
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      // If it's not JSON, return the text
      return text;
    }
  } catch (err) {
    // Re-throw if it's already our custom error
    if (err.message && !err.message.includes('fetch') && !err.message.includes('connect')) {
      throw err;
    }
    // Otherwise it's a network error
    console.error('Network error:', err);
    const errorUrl = isBrowser ? path : BASE_URL;
    throw new Error(`Failed to connect to server at ${errorUrl}. Please check if the backend is running.`);
  }
}