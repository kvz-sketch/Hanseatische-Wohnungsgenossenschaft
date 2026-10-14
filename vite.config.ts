import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Multi-page build: each page is its own index.html, so the site runs on any
// static host without rewrite rules.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        projekte: resolve(import.meta.dirname, 'projekte/index.html'),
      },
    },
  },
})
