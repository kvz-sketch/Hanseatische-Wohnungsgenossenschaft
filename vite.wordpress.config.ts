import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Builds the pages into the WordPress theme (wordpress/hansea-invest/dist).
// The theme reads .vite/manifest.json to find each page's script and styles,
// and renders window.HANSEA (REST URL, nonce, logged-in member) before them.
const THEME = 'hansea-invest'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `/wp-content/themes/${THEME}/dist/`,
  define: { 'import.meta.env.VITE_BACKEND': JSON.stringify('wordpress') },
  build: {
    outDir: `wordpress/${THEME}/dist`,
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'src/main.tsx'),
        login: resolve(import.meta.dirname, 'src/login.tsx'),
        mitglieder: resolve(import.meta.dirname, 'src/mitglieder.tsx'),
      },
    },
  },
})
