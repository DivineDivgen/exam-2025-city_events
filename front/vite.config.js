import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  preview: {
    port: 80,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  server: {
    port: 80,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:80",
    watch: {
      usePolling: true,
    },
  },
  base: '/',
  build: {
    manifest: true, // For integration with Nginx
  },
})
