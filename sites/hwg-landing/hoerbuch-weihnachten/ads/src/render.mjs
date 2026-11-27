// Renders the ad previews made by creatives.py (preview/*.html) to ../png/.
// Run from the repository root:
//   python3 sites/hwg-landing/hoerbuch-weihnachten/ads/src/creatives.py <canvas project dir>
//   node sites/hwg-landing/hoerbuch-weihnachten/ads/src/render.mjs
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readdirSync } from 'node:fs'
import path from 'node:path'

// Global Playwright install (require() resolves it, ESM import does not).
const { chromium } = createRequire(import.meta.url)('playwright')

const here = path.dirname(fileURLToPath(import.meta.url))
const previews = path.join(here, 'preview')
const out = path.join(here, '..', 'png')

const browser = await chromium.launch()
for (const file of readdirSync(previews).filter((f) => f.endsWith('.html')).sort()) {
  const [w, h] = file.match(/(\d+)x(\d+)\.html$/).slice(1).map(Number)
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(path.join(previews, file)).href, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(out, file.replace(/\.html$/, '.png')) })
  await page.close()
  console.log(file.replace(/\.html$/, '.png'))
}
await browser.close()
