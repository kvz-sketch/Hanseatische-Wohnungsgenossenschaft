// Approval documents, made in the browser with pdf-lib once a Beschluss is
// approved, and stored with the member (kind "zustimmung"):
// - Aufnahme: the signed Beitrittserklärung with its section "Rückmeldung der
//   Genossenschaft" filled in (ticked boxes, name, date and time of every
//   approval, Mitgliedsnummer; formFill.ts). Older forms without that section
//   get an added page listing the approvals instead. The original DocuSign file
//   stays as it is next to it: changing it would break its digital signature.
// - Kündigung: a confirmation for the member with the details of the
//   Kündigung and every approval.
// The server accepts one document per Beschluss, so running this twice (two
// browsers, a reload) never adds a second one.

import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib'
import { api, linkOnly, type Beschluss, type CrmDocument, type MemberDetail } from './api'
import { berlin, fillAcceptance, findAcceptance } from './formFill'

const NAVY = { r: 0.078, g: 0.102, b: 0.275 }
const MUTED = { r: 0.42, g: 0.44, b: 0.5 }
const A4: [number, number] = [595.28, 841.89]
const LEFT = 64
const WIDTH = A4[0] - 2 * LEFT

const running = new Set<string>()

/** pdf-lib's bytes as a plain ArrayBuffer-backed array (what File accepts). */
const pdfBytes = (bytes: Uint8Array) => new Uint8Array(bytes)

const dmy = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  if (iso.length > 10) {
    // Time stamps (UTC) in German local time
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })
  }
  return `${m[3]}.${m[2]}.${m[1]}`
}
const euro = (n: number | null) => (n === null ? '–' : `${n.toLocaleString('de-DE', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`)
const units = (n: number | null) => `${(n ?? 0).toLocaleString('de-DE')} ${n === 1 ? 'Geschäftsanteil' : 'Geschäftsanteile'}`
const memberName = (m: MemberDetail) => `${m.record.vorname} ${m.record.nachname}`.trim() || m.record.firma || 'Mitglied'
const gremiumLabel = (b: Beschluss) => (b.gremium === 'vorstand' ? 'Vorstand' : 'Aufsichtsrat')

/**
 * Approval documents (and the Kündigung email) start with this release:
 * decisions taken before it get none, so existing members aren't sent
 * documents for approvals of the past. Same date in inc/crm.php.
 */
export const APPROVAL_DOCS_SINCE = '2026-11-12T02:30:00Z'

/** Approved Beschlüsse of the member that still lack their document. */
export function missingApprovalDocs(m: MemberDetail) {
  return m.beschluesse.filter(
    (b) =>
      b.status === 'zugestimmt' &&
      (b.type === 'zulassung' || b.type === 'kuendigung') &&
      (!b.closed || new Date(b.closed) >= new Date(APPROVAL_DOCS_SINCE)) &&
      !m.documents.some((d) => d.beschluss === b.id),
  )
}

/**
 * Makes and uploads the missing approval documents. Returns the member as
 * the server has it afterwards, or null when nothing was missing.
 */
export async function ensureApprovalDocs(id: number, m: MemberDetail): Promise<MemberDetail | null> {
  let latest: MemberDetail | null = null
  for (const b of missingApprovalDocs(m)) {
    if (running.has(b.id)) continue
    running.add(b.id)
    try {
      const file = b.type === 'zulassung' ? await admissionPdf(id, latest ?? m, b) : await cancellationPdf(latest ?? m, b)
      if (file) latest = await api.upload(id, file, { kind: 'zustimmung', beschluss: b.id })
    } catch {
      // Already there (another browser was faster) or not possible now: tried again on the next visit
    } finally {
      running.delete(b.id)
    }
  }
  return latest
}

/* ------------------------------------------------------------------------ */

type Writer = {
  pdf: PDFDocument
  page: PDFPage
  y: number
  font: PDFFont
  bold: PDFFont
}

async function writer(pdf: PDFDocument): Promise<Writer> {
  const { StandardFonts } = await import('pdf-lib')
  return { pdf, page: pdf.addPage(A4), y: A4[1] - 72, font: await pdf.embedFont(StandardFonts.Helvetica), bold: await pdf.embedFont(StandardFonts.HelveticaBold) }
}

/** Replaces characters the standard PDF fonts can't draw (e.g. "ł" → "l", others → "?"). */
function safe(font: PDFFont, text: string) {
  return [...text]
    .map((c) => {
      for (const candidate of [c, c.normalize('NFD').replace(/[̀-ͯ]/g, ''), '?']) {
        try {
          font.widthOfTextAtSize(candidate, 10)
          return candidate
        } catch {
          // try the next candidate
        }
      }
      return '?'
    })
    .join('')
}

async function text(w: Writer, value: string, opts: { size?: number; bold?: boolean; color?: typeof NAVY; gap?: number; x?: number } = {}) {
  const { rgb } = await import('pdf-lib')
  const font = opts.bold ? w.bold : w.font
  const size = opts.size ?? 11
  const x = opts.x ?? LEFT
  const words = safe(font, value).split(/\s+/)
  let line = ''
  const lines: string[] = []
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > WIDTH - (x - LEFT) && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  for (const l of lines) {
    if (w.y < 80) {
      w.page = w.pdf.addPage(A4)
      w.y = A4[1] - 72
    }
    const c = opts.color ?? NAVY
    w.page.drawText(l, { x, y: w.y, size, font, color: rgb(c.r, c.g, c.b) })
    w.y -= size * 1.45
  }
  w.y -= opts.gap ?? 0
}

/** A ticked box and "Zugestimmt: Name, Aufsichtsrat, Datum" for every vote. */
async function approvals(w: Writer, b: Beschluss) {
  const { rgb } = await import('pdf-lib')
  const navy = rgb(NAVY.r, NAVY.g, NAVY.b)
  for (const v of b.votes) {
    if (w.y < 110) {
      w.page = w.pdf.addPage(A4)
      w.y = A4[1] - 72
    }
    const box = { x: LEFT, y: w.y - 2, size: 11 }
    w.page.drawRectangle({ x: box.x, y: box.y, width: box.size, height: box.size, borderColor: navy, borderWidth: 1 })
    if (v.vote === 'zugestimmt') {
      w.page.drawLine({ start: { x: box.x + 2, y: box.y + 5.5 }, end: { x: box.x + 4.5, y: box.y + 2.5 }, thickness: 1.4, color: navy })
      w.page.drawLine({ start: { x: box.x + 4.5, y: box.y + 2.5 }, end: { x: box.x + 9.5, y: box.y + 9 }, thickness: 1.4, color: navy })
    }
    const label = v.vote === 'zugestimmt' ? 'Zugestimmt' : v.vote === 'abgelehnt' ? 'Abgelehnt' : 'Keine Stimme'
    await text(w, `${label}: ${v.fullName || v.name}, ${gremiumLabel(b)}${v.time ? `, ${berlin(v.time)}` : ''}`, { x: LEFT + 20 })
    if (v.note) await text(w, `Anmerkung: ${v.note}`, { x: LEFT + 20, size: 9.5, color: MUTED })
    w.y -= 6
  }
}

async function footer(w: Writer, note: string) {
  w.y = Math.min(w.y, 110)
  await text(w, note, { size: 8.5, color: MUTED })
}

/** The Beitrittserklärung: marked as such when the Antrag was created, else the oldest PDF from before the Beschluss. */
function beitrittserklaerung(m: MemberDetail, b: Beschluss): CrmDocument | undefined {
  const files = m.documents.filter((d) => !linkOnly(d)) // a DocuSign link without the PDF can't be filled in
  return files.find((d) => d.kind === 'beitritt') ?? files.filter((d) => !d.kind && d.time <= b.created).sort((x, y) => x.time.localeCompare(y.time))[0]
}

async function admissionPdf(id: number, m: MemberDetail, b: Beschluss): Promise<File> {
  const lib = await import('pdf-lib')
  const { PDFDocument } = lib
  const original = beitrittserklaerung(m, b)
  const name = memberName(m)
  const gremium = b.gremium === 'vorstand' ? 'Vorstands' : 'Aufsichtsrats'
  const fileName = `Beitrittserklärung ${name} mit Zustimmung des ${gremium}.pdf`
  let pdf: PDFDocument | null = null
  let bytes: Uint8Array | null = null
  if (original) {
    try {
      const res = await fetch(api.documentUrl(id, original.id), { credentials: 'same-origin' })
      if (res.ok) {
        bytes = new Uint8Array(await res.arrayBuffer())
        pdf = await PDFDocument.load(bytes)
      }
    } catch {
      pdf = null // e.g. a protected PDF: the approval page stands on its own
    }
  }

  // Form F1: fill in "Rückmeldung der Genossenschaft" on the form itself
  if (pdf && bytes) {
    try {
      const { pdfItems } = await import('./pdfImport')
      const found = findAcceptance(await pdfItems(bytes))
      const approvals = b.votes.filter((v) => v.vote === 'zugestimmt').map((v) => ({ name: v.fullName || v.name, time: v.time }))
      if (found && (await fillAcceptance(lib, pdf, found, { gremium: b.gremium, art: m.record.art, nr: m.record.nr, approvals, safe }))) {
        return new File([pdfBytes(await pdf.save())], fileName, { type: 'application/pdf' })
      }
    } catch {
      // fall back to the added page below
    }
  }

  const merged = !!pdf
  pdf ??= await PDFDocument.create()
  const w = await writer(pdf)
  await text(w, 'Hanseatische Invest eG', { size: 9, color: MUTED, gap: 18 })
  await text(w, `Zustimmung des ${b.gremium === 'vorstand' ? 'Vorstands' : 'Aufsichtsrats'}`, { size: 20, bold: true, gap: 4 })
  await text(w, `zur Beitrittserklärung von ${name}${m.record.firma && m.record.vorname ? `, ${m.record.firma}` : ''}`, { size: 12, gap: 18 })
  await text(w, `Mitgliedsnummer: ${m.record.nr ?? '–'}`)
  await text(w, `Aufnahme beschlossen am: ${dmy(b.closed)}`)
  await text(w, `Art der Mitgliedschaft: ${m.record.art === 'o' ? 'Ordentliches Mitglied' : 'Investierendes Mitglied'}`, { gap: 18 })
  await text(w, b.gremium === 'vorstand' ? 'Der Vorstand hat der Aufnahme zugestimmt:' : `Alle ${b.votes.length} Mitglieder des Aufsichtsrats haben der Aufnahme zugestimmt:`, { bold: true, gap: 8 })
  await approvals(w, b)
  await footer(
    w,
    `Erstellt am ${dmy(new Date().toISOString())} in der Mitgliederliste der Hanseatische Invest eG.${merged ? ' Die vorangehenden Seiten sind die unterschriebene Beitrittserklärung; das Original liegt unverändert unter den Dokumenten.' : ''}`,
  )
  return new File([pdfBytes(await pdf.save())], fileName, { type: 'application/pdf' })
}

async function cancellationPdf(m: MemberDetail, b: Beschluss): Promise<File | null> {
  const k = m.record.kuendigungen[b.ref]
  if (!k) return null
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const w = await writer(pdf)
  const r = m.record
  const name = memberName(m)
  await text(w, 'Hanseatische Invest eG · Langenhorner Chaussee 155 · 22415 Hamburg', { size: 8.5, color: MUTED, gap: 14 })
  for (const line of [r.firma && r.vorname ? r.firma : '', name, r.strasse, `${r.plz} ${r.ort}`.trim()].filter(Boolean)) await text(w, line)
  w.y -= 24
  await text(w, `Hamburg, ${dmy(b.closed || new Date().toISOString())}`, { gap: 20 })
  await text(w, 'Bestätigung Ihrer Kündigung', { size: 18, bold: true, gap: 4 })
  await text(w, `Mitgliedsnummer ${r.nr ?? '–'}`, { color: MUTED, gap: 16 })
  const hello = r.anrede === 'Herr' && r.nachname ? `Sehr geehrter Herr ${r.nachname},` : r.anrede === 'Frau' && r.nachname ? `Sehr geehrte Frau ${r.nachname},` : 'Sehr geehrte Damen und Herren,'
  await text(w, hello, { gap: 6 })
  await text(
    w,
    b.gremium === 'vorstand'
      ? 'der Vorstand hat Ihrer Kündigung zugestimmt. Hiermit bestätigen wir Ihre Kündigung mit folgenden Angaben:'
      : `alle ${b.votes.length === 3 ? 'drei' : b.votes.length} Mitglieder des Aufsichtsrats haben Ihrer Kündigung zugestimmt. Hiermit bestätigen wir Ihre Kündigung mit folgenden Angaben:`,
    { gap: 10 },
  )
  const rows: [string, string][] = [
    ['Gekündigte Anteile', units(k.anteile)],
    ['Betrag', euro(k.betrag)],
    ['Kündigung eingegangen am', dmy(k.datum) || '–'],
    ['Gekündigt zum', dmy(k.zum) || '–'],
    ['Zustimmung beschlossen am', dmy(b.closed) || '–'],
  ]
  for (const [label, value] of rows) {
    const y = w.y
    await text(w, label, { color: MUTED })
    w.y = y
    await text(w, value, { x: LEFT + 190, bold: true })
  }
  w.y -= 12
  await text(w, `Zustimmung ${b.gremium === 'vorstand' ? 'des Vorstands' : 'des Aufsichtsrats'}:`, { bold: true, gap: 8 })
  await approvals(w, b)
  w.y -= 10
  await text(w, 'Bei Fragen erreichen Sie uns unter mitgliederservice@hanseainvest.de.', { gap: 14 })
  await text(w, 'Mit freundlichen Grüßen')
  await text(w, 'Hanseatische Invest eG', { gap: 10 })
  await footer(w, `Erstellt am ${dmy(new Date().toISOString())} in der Mitgliederliste der Hanseatische Invest eG.`)
  return new File([pdfBytes(await pdf.save())], `Bestätigung der Kündigung zum ${dmy(k.zum) || 'Termin'}.pdf`, { type: 'application/pdf' })
}
