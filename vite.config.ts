import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Third argument '' loads every key (not only VITE_*) so the proxy/port can be
  // configured locally without changing committed files.
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_DEV_SERVER_PORT) || 5173

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port,
    },
    build: {
      // QA/dev builds keep hidden source maps for debugging; production ships none.
      sourcemap: mode === 'production' ? false : 'hidden',
    },
  }
})
