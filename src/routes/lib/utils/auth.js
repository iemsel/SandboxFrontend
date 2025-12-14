// A simple constant for your API base URL. 
const API_BASE_URL = '/auth'; 

import { authStore } from "../stores/authStore.js";


/**
 * Calls the backend login endpoint and stores the token/user data.
 * ... (loginUser function remains the same) ...
 */
export async function loginUser(email, password) {
// ... (Your existing loginUser function code) ...
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed due to server error.');
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      authStore.login(data.user);
    }

    return data;

  } catch (error) {
    throw error;
  }
}


// /**
//  * Calls the backend registration endpoint.
//  * @param {string} email 
//  * @param {string} name 
//  * @param {string} password 
//  * @returns {Promise<object>} The registered user object.
//  */
// export async function registerUser(email, name, password) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, name, password }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       // The backend returns a 409 for existing email or 400 for missing fields
//       throw new Error(data.error || 'Registration failed due to server error.');
//     }

//     return data; // Returns the { id, email, name } object

//   } catch (error) {
//     throw error;
//   }
// }

/**
 * Calls the backend registration endpoint.
 * @param {string} email 
 * @param {string} name 
 * @param {string} password 
 * @returns {Promise<object>} The registered user object.
 */
export async function registerUser(email, name, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
    });

    // 1. Read the response body ONCE as text.
    const responseText = await response.text();
    let data = {};

    try {
        // 2. Attempt to parse the text as JSON.
        data = JSON.parse(responseText);
    } catch (e) {
        if (!response.ok) {
            // Throw a specific error using the non-JSON text itself.
            throw new Error(`Server returned non-JSON error data (HTTP ${response.status}). Response: "${responseText.substring(0, 50)}..."`);
        }
    }


    if (!response.ok) {
      const errorMessage = data.error 
                         ? data.error 
                         : 'Registration failed due to server error (no specific error message).';
                         
      throw new Error(errorMessage);
    }

    return data; // Returns the { id, email, name } object

  } catch (error) {
    throw error;
  }
}


/**
 * Removes the token and user data from local storage and updates the store.
 * ... (logoutUser function remains the same) ...
 */
export function logoutUser() {
// ... (Your existing logoutUser function code) ...
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  authStore.logout();
}

/**
 * Retrieves the token from local storage.
 * ... (getAuthToken function remains the same) ...
 */
export function getAuthToken() {
// ... (Your existing getAuthToken function code) ...
  return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
}

/**
 * Retrieves the user object from local storage.
 * ... (getStoredUser function remains the same) ...
 */
export function getStoredUser() {
// ... (Your existing getStoredUser function code) ...
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  return userJson ? JSON.parse(userJson) : null;
}