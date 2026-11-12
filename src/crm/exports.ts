// Exports of the Mitgliederliste (tab "Export"), as PDF (pdf-lib) and Excel
// (.xlsx written by hand, zipped with fflate). One column definition drives
// both, so the two files always have the same layout:
//
//   Nr. | Tag der Zulassung | Firma / jur. Person | Anrede | Vorname | Name |
//   Straße | Plz | Ort | Geburtsdatum | IBAN | Steuer-ID | Telefon | Email |
//   Weitere Geschäftsanteile (Tag der Zulassung, Zahl weiterer Anteile) |
//   Ausscheiden (Tag der Eintragung, Grund, Tag des Ausscheidens) |
//   Bemerkungen (o = ord. / i = inv., Sonstiges)
//
// A member with several further subscriptions gets one line per subscription
// inside the two "Weitere Geschäftsanteile" cells.

import type { PDFFont } from 'pdf-lib'
import type { ExportRow } from './api'

export const GENOSSENSCHAFT = 'Hanseatische Invest eG'

type Column = { group?: string; label: string; width: number; value: (r: ExportRow) => string; center?: boolean }

const d = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}.${m[2]}.${m[1]}` : ''
}
const n = (v: number | null) => (v === null || v === undefined ? '' : v.toLocaleString('de-DE'))
const iban = (v: string) => v.replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ')

/** The columns of the Mitgliederliste; width in PDF points (A3 landscape, scaled to fit). */
export const MITGLIEDERLISTE: Column[] = [
  { label: 'Nr.', width: 24, value: (r) => (r.nr ?? '').toString(), center: true },
  { label: 'Tag der Zulassung', width: 50, value: (r) => d(r.zulassung) },
  { label: 'Firma / jur. Person', width: 74, value: (r) => r.firma },
  { label: 'Anrede', width: 36, value: (r) => r.anrede },
  { label: 'Vorname', width: 58, value: (r) => r.vorname },
  { label: 'Name', width: 62, value: (r) => r.nachname },
  { label: 'Straße', width: 80, value: (r) => r.strasse },
  { label: 'Plz', width: 30, value: (r) => r.plz },
  { label: 'Ort', width: 56, value: (r) => r.ort },
  { label: 'Geburts-\ndatum', width: 52, value: (r) => d(r.geburtstag) },
  { label: 'IBAN', width: 128, value: (r) => iban(r.iban) },
  { label: 'Steuer-ID', width: 66, value: (r) => r.steuer_id },
  { label: 'Telefon', width: 72, value: (r) => r.telefon },
  { label: 'Email', width: 100, value: (r) => r.email },
  { group: 'Weitere Geschäftsanteile', label: 'Tag der Zulassung', width: 56, value: (r) => r.weitere.map((w) => d(w.zugelassen) || '–').join('\n') },
  { group: 'Weitere Geschäftsanteile', label: 'Zahl weiterer Anteile', width: 48, value: (r) => r.weitere.map((w) => n(w.anteile)).join('\n'), center: true },
  { group: 'Ausscheiden', label: 'Tag der Eintragung', width: 50, value: (r) => d(r.aus_eintragung) },
  { group: 'Ausscheiden', label: 'Grund des Aus-\nscheidens', width: 70, value: (r) => r.aus_grund },
  { group: 'Ausscheiden', label: 'Tag des Aus-\nscheidens', width: 56, value: (r) => d(r.aus_datum) },
  { group: 'Bemerkungen', label: 'o = ord.\ni = inv.', width: 40, value: (r) => r.art, center: true },
  { group: 'Bemerkungen', label: 'Sonstiges', width: 110, value: (r) => r.bemerkungen },
]

/** Group headings over neighbouring columns: [label, first column, last column]. */
function groups(cols: Column[]) {
  const out: [string, number, number][] = []
  cols.forEach((c, i) => {
    if (!c.group) return
    const last = out[out.length - 1]
    if (last && last[0] === c.group && last[2] === i - 1) last[2] = i
    else out.push([c.group, i, i])
  })
  return out
}

const stamp = (created: string) => new Date(created).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' })

export function download(data: Uint8Array, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/* ------------------------------------------------------------------------
 * PDF: A3 landscape, header repeated on every page
 * --------------------------------------------------------------------- */

/** "01.01.2026 – 31.12.2026" and the file name part "2026" (whole calendar year) or "2026-01-01_2026-06-30". */
export const periodLabel = (von: string, bis: string) => `${d(von)} – ${d(bis)}`
const periodFile = (von: string, bis: string) => (von.slice(5) === '01-01' && bis.slice(5) === '12-31' && von.slice(0, 4) === bis.slice(0, 4) ? von.slice(0, 4) : `${von}_${bis}`)

export type ExportPeriod = { von: string; bis: string }

export async function mitgliederlistePdf(rows: ExportRow[], created: string, period: ExportPeriod) {
  const lib = await import('pdf-lib')
  const pdf = await lib.PDFDocument.create()
  pdf.setTitle(`Mitgliederliste der ${GENOSSENSCHAFT}`)
  const font = await pdf.embedFont(lib.StandardFonts.Helvetica)
  const bold = await pdf.embedFont(lib.StandardFonts.HelveticaBold)
  const [W, H] = [1190.55, 841.89] // A3 landscape
  const M = 24
  const cols = MITGLIEDERLISTE
  const scale = (W - 2 * M) / cols.reduce((s, c) => s + c.width, 0)
  const widths = cols.map((c) => c.width * scale)
  const xs = widths.map((_, i) => M + widths.slice(0, i).reduce((s, w) => s + w, 0))
  const size = 7
  const line = size * 1.25
  const pad = 3
  const grey = lib.rgb(0.9, 0.91, 0.93)
  const border = lib.rgb(0.62, 0.64, 0.7)
  const ink = lib.rgb(0.08, 0.1, 0.27)

  /** Characters the standard font can't draw become their base letter or "?". */
  const safe = (f: PDFFont, text: string) =>
    [...text]
      .map((ch) => {
        for (const c of [ch, ch.normalize('NFD').replace(/[̀-ͯ]/g, ''), '?']) {
          try {
            f.widthOfTextAtSize(c, size)
            return c
          } catch {
            // next candidate
          }
        }
        return '?'
      })
      .join('')
  /** Lines of a cell: explicit line breaks, then wrapped at the column width (long words are cut). */
  const wrap = (f: PDFFont, text: string, width: number) => {
    const out: string[] = []
    for (const para of text.split('\n').map((t) => safe(f, t))) {
      let cur = ''
      for (const word of para.split(/\s+/)) {
        let w = word
        while (f.widthOfTextAtSize(w, size) > width) {
          let k = w.length - 1
          while (k > 1 && f.widthOfTextAtSize(w.slice(0, k), size) > width) k--
          if (cur) {
            out.push(cur)
            cur = ''
          }
          out.push(w.slice(0, k))
          w = w.slice(k)
        }
        const next = cur ? `${cur} ${w}` : w
        if (f.widthOfTextAtSize(next, size) > width && cur) {
          out.push(cur)
          cur = w
        } else cur = next
      }
      out.push(cur)
    }
    return out
  }

  let page = pdf.addPage([W, H])
  let y = 0
  let pageNo = 0
  const box = (x: number, top: number, w: number, h: number, fill?: typeof grey) =>
    page.drawRectangle({ x, y: top - h, width: w, height: h, borderColor: border, borderWidth: 0.5, color: fill })
  const cellText = (lines: string[], i: number, top: number, f: PDFFont, center = false) =>
    lines.forEach((l, k) => {
      const tw = f.widthOfTextAtSize(l, size)
      const x = center ? xs[i] + (widths[i] - tw) / 2 : xs[i] + pad
      page.drawText(l, { x, y: top - pad - size - k * line + 1.5, size, font: f, color: ink })
    })

  const header = () => {
    pageNo++
    y = H - M
    page.drawText(safe(bold, `Mitgliederliste der ${GENOSSENSCHAFT} · Zeitraum ${periodLabel(period.von, period.bis)}`), { x: M, y: y - 14, size: 14, font: bold, color: ink })
    page.drawText(safe(font, `Stand: ${stamp(created)} · Seite ${pageNo}`), { x: W - M - 160, y: y - 12, size: 8, font, color: ink })
    y -= 26
    const g = groups(cols)
    const groupH = line + 2 * pad
    const labelH = Math.max(...cols.map((c, i) => wrap(bold, c.label, widths[i] - 2 * pad).length)) * line + 2 * pad
    // Group row: merged cells over grouped columns, empty grey cells elsewhere
    cols.forEach((c, i) => {
      if (!c.group) box(xs[i], y, widths[i], groupH + labelH, grey)
    })
    for (const [label, a, b] of g) {
      const w = xs[b] + widths[b] - xs[a]
      box(xs[a], y, w, groupH, grey)
      const tw = bold.widthOfTextAtSize(safe(bold, label), size)
      page.drawText(safe(bold, label), { x: xs[a] + (w - tw) / 2, y: y - pad - size + 1.5, size, font: bold, color: ink })
    }
    cols.forEach((c, i) => {
      const top = c.group ? y - groupH : y - groupH // labels under the group row; ungrouped cells span both rows
      if (c.group) box(xs[i], top, widths[i], labelH, grey)
      cellText(wrap(bold, c.label, widths[i] - 2 * pad), i, top, bold, true)
    })
    y -= groupH + labelH
  }

  header()
  if (rows.length === 0) page.drawText('Keine Mitglieder.', { x: M, y: y - 16, size: 9, font, color: ink })
  for (const r of rows) {
    const cells = cols.map((c, i) => wrap(font, c.value(r) ?? '', widths[i] - 2 * pad))
    const h = Math.max(1, ...cells.map((c) => c.length)) * line + 2 * pad
    if (y - h < M) {
      page = pdf.addPage([W, H])
      header()
    }
    cells.forEach((lines, i) => {
      box(xs[i], y, widths[i], h)
      cellText(lines, i, y, font, cols[i].center)
    })
    y -= h
  }
  download(await pdf.save(), `Mitgliederliste-${periodFile(period.von, period.bis)}.pdf`, 'application/pdf')
}

/* ------------------------------------------------------------------------
 * Excel (.xlsx): title row, group row, label row, one row per member
 * --------------------------------------------------------------------- */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const colName = (i: number) => {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

export async function mitgliederlisteXlsx(rows: ExportRow[], created: string, period: ExportPeriod) {
  const { zipSync, strToU8 } = await import('fflate')
  const cols = MITGLIEDERLISTE
  const last = colName(cols.length - 1)
  // Styles: 0 default, 1 title, 2 header (grey, bold, centred, wrapped, border), 3 body (wrapped, border, top), 4 body centred, 5 small note
  const cell = (ref: string, value: string, style: number) =>
    value === '' ? `<c r="${ref}" s="${style}"/>` : `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`
  const g = groups(cols)
  const sheetRows: string[] = []
  sheetRows.push(`<row r="1" ht="24" customHeight="1">${cell('A1', `Mitgliederliste der ${GENOSSENSCHAFT} · Zeitraum ${periodLabel(period.von, period.bis)}`, 1)}${cell(colName(cols.length - 3) + '1', `Stand: ${stamp(created)}`, 5)}</row>`)
  // Row 2: groups; row 3: labels. Ungrouped columns span rows 2-3.
  sheetRows.push(
    `<row r="2" ht="18" customHeight="1">${cols
      .map((c, i) => {
        const grp = g.find(([, a]) => a === i)
        return cell(`${colName(i)}2`, c.group ? (grp ? grp[0] : '') : c.label, 2)
      })
      .join('')}</row>`,
  )
  sheetRows.push(`<row r="3" ht="42" customHeight="1">${cols.map((c, i) => cell(`${colName(i)}3`, c.group ? c.label : '', 2)).join('')}</row>`)
  rows.forEach((r, k) => {
    const n = k + 4
    const lines = Math.max(1, ...cols.map((c) => c.value(r).split('\n').length))
    sheetRows.push(`<row r="${n}"${lines > 1 ? ` ht="${lines * 15}" customHeight="1"` : ''}>${cols.map((c, i) => cell(`${colName(i)}${n}`, c.value(r) ?? '', c.center ? 4 : 3)).join('')}</row>`)
  })
  const merges = [
    `A1:${colName(cols.length - 4)}1`,
    ...cols.flatMap((c, i) => (c.group ? [] : [`${colName(i)}2:${colName(i)}3`])),
    ...g.filter(([, a, b]) => b > a).map(([, a, b]) => `${colName(a)}2:${colName(b)}2`),
  ]
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
<dimension ref="A1:${last}${rows.length + 3}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.round((c.width / 5.2) * 10) / 10}" customWidth="1"/>`).join('')}</cols>
<sheetData>${sheetRows.join('')}</sheetData>
<autoFilter ref="A3:${last}${Math.max(rows.length + 3, 4)}"/>
<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>
<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
<pageSetup paperSize="8" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
<headerFooter><oddFooter>&amp;LMitgliederliste der ${esc(GENOSSENSCHAFT)}&amp;RSeite &amp;P von &amp;N</oddFooter></headerFooter>
</worksheet>`
  const border = '<border><left style="thin"><color rgb="FF9EA3B3"/></left><right style="thin"><color rgb="FF9EA3B3"/></right><top style="thin"><color rgb="FF9EA3B3"/></top><bottom style="thin"><color rgb="FF9EA3B3"/></bottom><diagonal/></border>'
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font><font><b/><sz val="10"/><name val="Calibri"/></font><font><sz val="9"/><color rgb="FF6B7080"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6E8EC"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${border}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="6">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Standard" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
  const files = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    'xl/workbook.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Mitgliederliste" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">Mitgliederliste!$A$3:$${last}$${Math.max(rows.length + 3, 4)}</definedName><definedName name="_xlnm.Print_Titles" localSheetId="0">Mitgliederliste!$1:$3</definedName></definedNames></workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    'xl/worksheets/sheet1.xml': strToU8(sheet),
    'xl/styles.xml': strToU8(styles),
  }
  download(zipSync(files, { level: 6 }), `Mitgliederliste-${periodFile(period.von, period.bis)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}
