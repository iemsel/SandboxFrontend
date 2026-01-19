import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const API_GATEAWAY_URL = process.env.VITE_PUBLIC_API_URL || 'http://localhost:3010';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: true,
    allowedHosts: ['.railway.app'], // ✅ allow Railway host(s)
    proxy: {
      '/auth': {
        target: API_GATEAWAY_URL,
        changeOrigin: true,
      },
      '/ideas': {
        target: API_GATEAWAY_URL,
        changeOrigin: true,
      },
      '/api/planner': {
        target: API_GATEAWAY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/planner/, '/planner'),
      },
    },
  },
});
