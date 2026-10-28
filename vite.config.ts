import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Multi-page build: GIG homepage at /, Hansea Invest campaign page
      // (Taboola landing page) at /hansea-invest/ and its advertorial article
      // at /hansea-invest/ratgeber/.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        hanseaInvest: resolve(import.meta.dirname, 'hansea-invest/index.html'),
        hanseaInvestRatgeber: resolve(import.meta.dirname, 'hansea-invest/ratgeber/index.html'),
      },
    },
  },
})
