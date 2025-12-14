import { writable } from 'svelte/store';

// Define the initial state
const initialState = {
  isLoggedIn: false,
  user: null, // Holds { id, email, name }
  initial: 'U' // Default initial for the avatar
};

function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Function to initialize state from localStorage
    initialize: (storedUser) => {
        if (storedUser) {
            const initial = storedUser.name ? storedUser.name.charAt(0).toUpperCase() : 'U';
            set({
                isLoggedIn: true,
                user: storedUser,
                initial: initial
            });
        }
    },

    // Function to handle login
    login: (user) => {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      update(() => ({
        isLoggedIn: true,
        user: user,
        initial: initial,
      }));
    },
    
    // Function to handle logout
    logout: () => {
      set(initialState);
    },
  };
}

export const authStore = createAuthStore();