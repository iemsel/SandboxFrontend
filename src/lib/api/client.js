//eslint-disable prettier/prettier 

const BASE_URL = 'http://localhost:3010';

/**
 * Small wrapper around fetch that:
 * - prepends the gateway base url
 * - adds JSON headers
 * - adds Authorization header if token is provided
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', token, body } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const clone = res.clone();

    let errorBody;
    try {
      errorBody = await res.json();
    } catch {
      // safely read text from cloned response
      errorBody = { error: await clone.text() };
    }

    console.error('API error', res.status, errorBody);
    throw new Error(errorBody.error || `Request failed with ${res.status}`);
  }

  // 204 No Content → no JSON
  if (res.status === 204) return null;

  return res.json();
}