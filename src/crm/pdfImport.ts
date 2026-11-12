// Reads a signed Beitrittserklärung (DocuSign PDF) in the browser; the text
// never leaves the browser. Parsing is in pdfParse.ts.

import type { PdfLine } from './pdfParse'

export { parseBeitritt, type PdfResult } from './pdfParse'

/** Text of the PDF as lines in reading order, with the x position of every piece. */
export async function pdfLines(file: File): Promise<PdfLine[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs') // legacy build: runs in every current browser
  const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const lines: PdfLine[] = []
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent()
    lines.push(...toLines(content.items.flatMap((i) => ('str' in i ? [{ x: i.transform[4], y: i.transform[5], s: i.str }] : []))))
  }
  return lines
}

/** Groups text pieces on the same baseline (within 3 pt) into lines, top to bottom. */
export function toLines(items: { x: number; y: number; s: string }[]): PdfLine[] {
  const rows = new Map<number, { x: number; s: string }[]>()
  for (const { x, y, s } of items) {
    if (!s.trim()) continue
    const key = Math.round(y / 3) * 3
    rows.set(key, [...(rows.get(key) ?? []), { x, s: s.trim() }])
  }
  return [...rows.keys()]
    .sort((a, b) => b - a)
    .map((key) => {
      const parts = rows.get(key)!.sort((a, b) => a.x - b.x)
      return { x: parts[0].x, items: parts, text: parts.map((p) => p.s).join(' ').replace(/\s+/g, ' ').trim() }
    })
}
