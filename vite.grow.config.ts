import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Hansea Grow (hanseagrow.de) — a separate site that shares the GIG design
// tokens and UI components from src/. Builds to dist-grow/, deployed on its
// own domain. Each page keeps the URL it had on the old site.
const root = resolve(import.meta.dirname, 'sites/hansea-grow')

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(import.meta.dirname, 'dist-grow'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        mitgliederportal: resolve(root, 'mitgliederportal/index.html'),
        impressum: resolve(root, 'impressum/index.html'),
        datenschutz: resolve(root, 'datenschutz/index.html'),
      },
    },
  },
})
