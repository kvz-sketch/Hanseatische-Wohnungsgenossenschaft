// Folds the preview build's JS and CSS into preview.html so it opens as a
// single file without a server.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist-preview'
let html = readFileSync(join(dir, 'preview.html'), 'utf8')

html = html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+)"[^>]*>/g, (_, file) => {
  return `<style>${readFileSync(join(dir, file), 'utf8')}</style>`
})
html = html.replace(/<script type="module"[^>]*src="\/([^"]+)"[^>]*><\/script>/g, (_, file) => {
  const js = readFileSync(join(dir, file), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${js}</script>`
})

if (/(src|href)="\/(assets|media|video)\//.test(html)) throw new Error('preview still references external assets')
writeFileSync(join(dir, 'hansea-invest-vorschau.html'), html)
console.log(`wrote ${dir}/hansea-invest-vorschau.html (${(html.length / 1024).toFixed(0)} KB)`)
