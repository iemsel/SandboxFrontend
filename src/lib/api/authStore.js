import { writable } from 'svelte/store';

const initialState = {
  isLoggedIn: false,
  user: null,
  initial: 'U', // Default initial for the avatar
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
          initial: initial,
        });
      }
    },

    login: (user) => {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      update(() => ({
        isLoggedIn: true,
        user: user,
        initial: initial,
      }));
    },

    logout: () => {
      set(initialState);
    },
  };
}

export const authStore = createAuthStore();
