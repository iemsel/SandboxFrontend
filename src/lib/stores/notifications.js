import { writable } from "svelte/store";

// Single notification store
export const notification = writable(null);

/**
 * Set a new notification
 * type: 'success' | 'error' | 'info'
 * message: string
 * duration: ms (optional, default 3000)
 */
export function notify({ type = 'info', message = '', duration = 3000 }) {
  notification.set({ type, message, duration });
}
