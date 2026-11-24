// Renders every ad concept in every format to ../png/.
// Run from the repository root: node sites/hwg-landing/hoerbuch-weihnachten/ads/src/render.mjs
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

// Global Playwright install (require() resolves it, ESM import does not).
const { chromium } = createRequire(import.meta.url)('playwright')

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(here, '..', 'png')
const template = pathToFileURL(path.join(here, 'ad.html')).href

const concepts = { a: 'geschenk', b: 'autor', c: 'zwischen-den-jahren' }
const formats = {
  square: [1080, 1080],   // Meta/Instagram feed 1:1
  portrait: [1080, 1350], // Meta/Instagram feed 4:5
  story: [1080, 1920],    // Stories / Reels 9:16
  land: [1200, 674],      // Taboola / link ads ~16:9
}

const browser = await chromium.launch()
for (const [c, name] of Object.entries(concepts)) {
  for (const [f, [w, h]] of Object.entries(formats)) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    await page.goto(`${template}?c=${c}&f=${f}`)
    await page.evaluate(() => document.fonts.ready)
    const file = path.join(out, `${c}-${name}-${w}x${h}.png`)
    await page.screenshot({ path: file })
    await page.close()
    console.log(path.basename(file))
  }
}
await browser.close()
