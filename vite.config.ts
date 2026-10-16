import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Publishes src/data/performance-report.json as /data/performance-report.json,
// which the Performance Marketing Report fetches at runtime. The daily refresh
// replaces just that file on the server — see docs/performance-report-refresh.md.
function publishReportData(): Plugin {
  return {
    name: 'publish-report-data',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'data/performance-report.json',
        source: readFileSync(new URL('./src/data/performance-report.json', import.meta.url), 'utf8'),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), publishReportData()],
  // Local dev: run the PHP API with `php -S 127.0.0.1:8099 -t public` next to `npm run dev`.
  server: { proxy: { '/api': 'http://127.0.0.1:8099' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:8099' } },
})
