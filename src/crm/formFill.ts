// Fills in "Rückmeldung der Genossenschaft" on the signed Beitrittserklärung
// (form F1, Nov 2026) once the Aufsichtsrat or the Vorstand has approved:
//
//   Wir bestätigen hiermit den Beitritt als ☐ordentliches / ☐ investierendes Mitglied:
//   ☐ Zustimmung durch den Vorstand der Genossenschaft erfolgt.     <Name> <Datum> <Zeit>
//   ☐ Zustimmung durch den Aufsichtsrat der Genossenschaft erfolgt. <Name> <Datum> <Zeit>   (three times)
//   Ihre Mitgliedsnummer lautet. ______________
//
// The boxes are ticked and the placeholders replaced by name, date and time of
// each approval. Positions come from the PDF's own text (pdf.js), so this
// works as long as the form keeps these sentences. Pure functions: the pdf-lib
// module is passed in (it is loaded only when needed) and node tests can run them.

import type { PDFDocument, PDFFont } from 'pdf-lib'

/** A piece of text on a page: baseline position and width in PDF points. */
export type PosItem = { page: number; x: number; y: number; w: number; s: string }
type Spot = { page: number; x: number; y: number; w: number }

export type Acceptance = {
  /** The boxes in "Wir bestätigen hiermit den Beitritt als ☐ordentliches / ☐ investierendes Mitglied". */
  art: { o: Spot | null; i: Spot | null }
  /** Approval lines in the order of the form. */
  lines: { gremium: 'vorstand' | 'ar'; box: Spot; slot: Spot }[]
  /** Start of the blank after "Ihre Mitgliedsnummer lautet." */
  nr: Spot | null
}

/** Items on the same baseline (within 2 pt), left to right, grouped per page. */
function lines(items: PosItem[]) {
  const out: PosItem[][] = []
  for (const it of [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)) {
    const last = out[out.length - 1]
    if (last && last[0].page === it.page && Math.abs(last[0].y - it.y) <= 2) last.push(it)
    else out.push([it])
  }
  return out.map((l) => l.sort((a, b) => a.x - b.x))
}

const text = (l: PosItem[]) => l.map((i) => i.s).join('').replace(/\s+/g, ' ')
const isBox = (s: string) => /^[☐□]$/.test(s.trim())

/** Finds the Rückmeldung section; null when the PDF doesn't have it (older form). */
export function findAcceptance(items: PosItem[]): Acceptance | null {
  const all = lines(items)
  const result: Acceptance = { art: { o: null, i: null }, lines: [], nr: null }
  for (const l of all) {
    const t = text(l)
    const spot = (i: PosItem): Spot => ({ page: i.page, x: i.x, y: i.y, w: i.w })
    if (/wir bestätigen hiermit den beitritt als/i.test(t)) {
      const boxes = l.filter((i) => isBox(i.s))
      const word = (re: RegExp) => l.find((i) => re.test(i.s))
      const o = word(/ordentlich/i)
      const inv = word(/investierend/i)
      result.art.o = boxes[0] ? spot(boxes[0]) : o ? { ...spot(o), x: o.x - 11, w: 9 } : null
      result.art.i = boxes[1] ? spot(boxes[1]) : inv ? { ...spot(inv), x: inv.x - 11, w: 9 } : null
    }
    const m = /zustimmung durch den (vorstand|aufsichtsrat) der genossenschaft erfolgt/i.exec(t)
    if (m) {
      const start = l.find((i) => /zustimmung/i.test(i.s))!
      const box = l.find((i) => isBox(i.s) && i.x < start.x) ?? { ...start, x: start.x - 12, w: 9 }
      const placeholder = l.find((i) => /<\s*name\s*>/i.test(i.s))
      const end = l.filter((i) => i.s.trim()).slice(-1)[0]
      result.lines.push({
        gremium: /vorstand/i.test(m[1]) ? 'vorstand' : 'ar',
        box: spot(box),
        // Replace the placeholder; without one, write after the sentence
        slot: placeholder ? spot(placeholder) : { page: end.page, x: end.x + end.w + 12, y: end.y, w: 0 },
      })
    }
    if (/ihre mitgliedsnummer lautet/i.test(t)) {
      const it = l.find((i) => /_/.test(i.s)) ?? l[l.length - 1]
      const at = it.s.indexOf('_')
      result.nr = { page: it.page, x: at > 0 ? it.x + (it.w * at) / it.s.length : it.x, y: it.y, w: 0 }
    }
  }
  return result.lines.length > 0 ? result : null
}

export type Approval = { name: string; time: string }

type PdfLib = typeof import('pdf-lib')

/** "15.11.2026 14:32 Uhr" in German time. */
export function berlin(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })
  return `${date} ${time} Uhr`
}

/**
 * Ticks the boxes and writes the approvals into the form. Returns false (and
 * draws nothing) when the form lacks enough lines for this Gremium.
 */
export async function fillAcceptance(
  lib: PdfLib,
  pdf: PDFDocument,
  found: Acceptance,
  opts: { gremium: 'vorstand' | 'ar'; art: 'o' | 'i'; nr: number | null; approvals: Approval[]; safe: (font: PDFFont, s: string) => string },
): Promise<boolean> {
  const slots = found.lines.filter((l) => l.gremium === opts.gremium)
  if (slots.length < opts.approvals.length || opts.approvals.length === 0) return false
  const pages = pdf.getPages()
  const font = await pdf.embedFont(lib.StandardFonts.Helvetica)
  const bold = await pdf.embedFont(lib.StandardFonts.HelveticaBold)
  const navy = lib.rgb(0.078, 0.102, 0.275)
  const white = lib.rgb(1, 1, 1)

  const tick = (s: Spot) => {
    const p = pages[s.page - 1]
    if (!p) return
    // A check mark inside the box (the box glyph sits on the baseline, about 9 pt wide)
    p.drawLine({ start: { x: s.x + 1.6, y: s.y + 3.4 }, end: { x: s.x + 3.9, y: s.y + 0.6 }, thickness: 1.5, color: navy })
    p.drawLine({ start: { x: s.x + 3.9, y: s.y + 0.6 }, end: { x: s.x + 8.4, y: s.y + 7.6 }, thickness: 1.5, color: navy })
  }

  const art = opts.art === 'o' ? found.art.o : found.art.i
  if (art) tick(art)
  opts.approvals.forEach((a, n) => {
    const line = slots[n]
    const p = pages[line.slot.page - 1]
    if (!p) return
    tick(line.box)
    const value = opts.safe(font, `${a.name}   ${berlin(a.time)}`)
    if (line.slot.w > 0) p.drawRectangle({ x: line.slot.x - 1, y: line.slot.y - 3, width: line.slot.w + 2, height: 12.5, color: white })
    p.drawText(value, { x: line.slot.x, y: line.slot.y, size: 10, font, color: navy })
  })
  if (found.nr && opts.nr) {
    pages[found.nr.page - 1]?.drawText(String(opts.nr), { x: found.nr.x + 6, y: found.nr.y + 1.5, size: 11, font: bold, color: navy })
  }
  return true
}
