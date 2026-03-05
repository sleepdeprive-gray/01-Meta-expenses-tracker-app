import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      host: '127.0.0.1',
      protocol: 'http',
    },
  },
  plugins: [
    laravel({
      input: ['resources/js/main.jsx'],
      refresh: true,
    }),
    react(),
  ],
})
