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

  // Use relative path in browser, absolute in SSR
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

    // 204 No Content → no JSON
    if (res.status === 204) return null;

    // Read response safely
    const clone = res.clone();
    const text = await res.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text; 
      }
    }

    if (!res.ok) {
      const errorBody = typeof data === 'string' ? { error: data } : data;
      console.error('API error', res.status, errorBody);
      throw new Error(errorBody?.error || `Request failed with ${res.status}`);
    }

    return data;
  } catch (err) {
    // Network errors
    if (err.message && !err.message.includes('fetch') && !err.message.includes('connect')) {
      throw err; // custom API errors
    }
    console.error('Network error:', err);
    const errorUrl = isBrowser ? path : BASE_URL;
    throw new Error(`Failed to connect to server at ${errorUrl}. Please check if the backend is running.`);
  }
}
