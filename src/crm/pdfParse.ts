// Picks the member's details out of the text of a signed Beitrittserklärung.
// Pure functions (no browser APIs) so they can be tested against real PDFs.
//
// Tuned to the Hanseatische Invest eG DocuSign form: labels on the left
// ("Name:", "Vorname:", "PLZ/Ort:"), the filled-in value either on the same
// line or on the line just above the label (DocuSign places field text
// slightly higher), checkboxes as an "X" just before "Ja"/"Nein". Also reads
// "Label: value" layouts like our own template (inc/beitritt-dokument.php).

import type { MemberRecord, Secrets } from './api'

export type PdfItem = { x: number; s: string }
export type PdfLine = { x: number; text: string; items: PdfItem[] }

export type PdfResult = {
  record: Partial<MemberRecord>
  secrets: Partial<Secrets>
  /** German labels of the fields that were found, for the summary. */
  found: string[]
}

/** Our own accounts: they appear in the form (where to pay) and are never the member's. */
const OWN_IBANS = ['DE83241510051210544001']
const SHARE_EUR = 10000

const WORDS: Record<string, number> = { ein: 1, einen: 1, eins: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10 }

type Key =
  | 'anrede' | 'vorname' | 'nachname' | 'name_komma' | 'name' | 'firma' | 'geburtstag' | 'strasse' | 'plzort' | 'plz' | 'ortdatum'
  | 'ort' | 'anschrift' | 'land' | 'telefon' | 'email' | 'steuer_id' | 'kirchensteuer' | 'bundesland' | 'kontoinhaber'
  | 'freistellung' | 'anteile' | 'gesamt' | 'iban' | 'mitgliedsnummer'

// Order matters: the first label that matches a line wins.
const LABELS: { re: RegExp; key: Key }[] = [
  { re: /^anrede\b/i, key: 'anrede' },
  { re: /^(vorname\(n\)|vornamen?)\b/i, key: 'vorname' },
  { re: /^(nachname|familienname|zuname)\b/i, key: 'nachname' },
  { re: /^name,\s*vorname\b/i, key: 'name_komma' },
  { re: /^name der genossenschaft/i, key: 'firma' }, // not the member: consumed and ignored below
  { re: /^(vor-?\s*und\s*(zu|nach)name|name)\b/i, key: 'name' },
  { re: /^(firma(\s*\/\s*bezeichnung)?|unternehmen)\b/i, key: 'firma' },
  { re: /^(geburtsdatum|geburtstag|geboren am)\b/i, key: 'geburtstag' },
  { re: /^stra(ß|ss)e\b/i, key: 'strasse' },
  { re: /^(plz|postleitzahl)\s*[,/]\s*ort\b/i, key: 'plzort' },
  { re: /^(plz|postleitzahl)\b/i, key: 'plz' },
  { re: /^ort\s*,\s*datum\b/i, key: 'ortdatum' },
  { re: /^(ort|wohnort)\b/i, key: 'ort' },
  { re: /^(anschrift|adresse|wohnanschrift)\b/i, key: 'anschrift' },
  { re: /^land\b/i, key: 'land' },
  { re: /^(telefonnummer|telefon|tel\.|mobil)\b/i, key: 'telefon' },
  { re: /^(e-?mail-?adresse|e-?mail)\b/i, key: 'email' },
  { re: /^(steuer-?\s*id|steuer-?identifikationsnummer|steuerliche identifikationsnummer)\b/i, key: 'steuer_id' },
  { re: /^kirchensteuer(pflicht|pflichtig)?\b/i, key: 'kirchensteuer' },
  { re: /^bundesland\b/i, key: 'bundesland' },
  { re: /^(kontoempfänger|kontoinhaber(in)?)\b/i, key: 'kontoinhaber' },
  { re: /^freistellungsauftrag liegt bei/i, key: 'freistellung' },
  { re: /^anzahl\s+(der\s+)?(geschäfts)?anteile\b/i, key: 'anteile' },
  { re: /^gesamtsumme\b/i, key: 'gesamt' },
  { re: /^iban\b/i, key: 'iban' },
  { re: /^ihre mitgliedsnummer\b/i, key: 'mitgliedsnummer' },
]

const labelOf = (line: PdfLine) => LABELS.find((l) => l.re.test(line.text))

/** Raw value for each label: rest of the label line, else the value line above, else the one below. */
function readLabels(lines: PdfLine[]) {
  const raw: Partial<Record<Key, { value: string; line: PdfLine }>> = {}
  const used = new Set<number>()
  // A value-only line: no label, and it starts well right of the label column.
  const valueLine = (i: number, labelX: number) => {
    const l = lines[i]
    return l && !used.has(i) && !labelOf(l) && l.x > labelX + 60 ? l : null
  }
  lines.forEach((line, i) => {
    const label = labelOf(line)
    if (!label || raw[label.key]) return
    const m = label.re.exec(line.text)!
    let value = line.text.slice(m[0].length).replace(/^[\s:*.\-–()A-Za-zäöüÄÖÜ]*?:\s*/, '').replace(/^[\s:*]+/, '').trim()
    if (label.key === 'kirchensteuer' || label.key === 'freistellung' || label.key === 'gesamt') value = line.text // read in full below
    if (!value || label.key === 'gesamt') {
      const near = valueLine(i - 1, line.x) ? i - 1 : valueLine(i + 1, line.x) ? i + 1 : -1
      if (near >= 0) {
        used.add(near)
        value = label.key === 'gesamt' ? lines[near].text : value || lines[near].text
      }
    }
    if (value) raw[label.key] = { value, line }
  })
  return raw
}

const isoDate = (d: string) => {
  const m = /(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/.exec(d)
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
}
const euro = (s: string) => {
  const m = /(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?/.exec(s)
  return m ? Number(m[1].replace(/\./g, '') + (m[2] ? `.${m[2]}` : '')) : null
}

/** "X" before "Ja"/"Nein" on a checkbox line: the option right after the X. */
function checked(line: PdfLine): 'ja' | 'nein' | '' {
  const x = line.items.find((i) => i.s.trim().toUpperCase() === 'X')
  if (!x) return /\bja\b/i.test(line.text) && !/\bnein\b/i.test(line.text) ? 'ja' : /\bnein\b/i.test(line.text) && !/\bja\b/i.test(line.text) ? 'nein' : ''
  const next = line.items.filter((i) => i.x > x.x && /^(ja|nein)$/i.test(i.s.trim())).sort((a, b) => a.x - b.x)[0]
  return next ? (next.s.trim().toLowerCase() as 'ja' | 'nein') : ''
}

export function parseBeitritt(lines: PdfLine[]): PdfResult {
  const raw = readLabels(lines)
  const v = (k: Key) => raw[k]?.value.trim() ?? ''
  const text = lines.map((l) => l.text).join('\n')
  const r: Partial<MemberRecord> = {}
  const s: Partial<Secrets> = {}
  const found = new Set<string>()
  const set = <K extends keyof MemberRecord>(key: K, value: MemberRecord[K] | undefined, label: string) => {
    if (value === undefined || value === null || value === '' || r[key] !== undefined) return
    r[key] = value
    found.add(label)
  }

  // Names: "Name, Vorname", separate fields, or "Name: Vorname Nachname"
  if (v('name_komma')) {
    const [last, first] = v('name_komma').split(',').map((x) => x.trim())
    set('nachname', last, 'Nachname')
    set('vorname', first, 'Vorname')
  }
  set('vorname', v('vorname'), 'Vorname')
  set('nachname', v('nachname'), 'Nachname')
  if (v('name') && !r.nachname) {
    const parts = v('name').replace(/^(Herr und Frau|Herr|Frau)\s+/i, '').split(/\s+/)
    const last = parts.pop()
    if (r.vorname || parts.length === 0) set('nachname', last, 'Nachname')
    else {
      set('nachname', last, 'Nachname')
      set('vorname', parts.join(' '), 'Vorname')
    }
  }
  set('anrede', /\b(Herr und Frau|Herr|Frau|Divers)\b/.exec(v('anrede') || v('name'))?.[1], 'Anrede')
  const firma = raw.firma && !/^name der genossenschaft/i.test(raw.firma.line.text) ? v('firma') : ''
  set('firma', firma, 'Firma')
  set('geburtstag', isoDate(v('geburtstag')), 'Geburtstag')

  // Address
  const anschrift = v('anschrift')
  const combined = /^(.*?),\s*(\d{4,5})\s+(.+)$/.exec(anschrift)
  set('strasse', v('strasse') || (combined ? combined[1].trim() : anschrift), 'Straße')
  const plzOrt = /(\d{4,5})\s+(.+)/.exec(v('plzort'))
  set('plz', plzOrt?.[1] ?? v('plz').match(/\d{4,5}/)?.[0] ?? combined?.[2], 'PLZ')
  set('ort', plzOrt?.[2].trim() ?? (v('ort') || combined?.[3]?.trim()), 'Ort')
  const land = v('land')
  set('land', land ? (/deutschland|germany/i.test(land) ? 'DE' : land) : undefined, 'Land')

  set('telefon', v('telefon').replace(/[^\d+ /()-]/g, '').trim(), 'Telefon')
  set('email', (v('email') || text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0], 'E-Mail')
  set('bundesland', v('bundesland'), 'Bundesland')
  set('kontoinhaber', v('kontoinhaber'), 'Kontoinhaber')

  // Freistellungsauftrag: an amount after "EUR", or 0 when none is given / "Keine Freistellung" is ticked
  if (raw.freistellung) {
    const after = raw.freistellung.value.split(/EUR/i)[1] ?? ''
    const amount = euro(after)
    const none = /\bnein\b/i.test(after) || lines.some((l) => /keine freistellung/i.test(l.text) && l.items.some((i) => i.s.trim().toUpperCase() === 'X'))
    set('freistellung', amount ?? (none ? 0 : undefined), 'Freistellungsauftrag')
  }

  // Bank and tax (encrypted fields)
  const ibans = [...text.matchAll(/\b([A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,3})?)\b/g)].map((m) => m[1].replace(/\s+/g, ''))
  const iban = [v('iban').replace(/\s+/g, ''), ...ibans].find((i) => /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(i) && !OWN_IBANS.includes(i))
  if (iban) {
    s.iban = iban
    found.add('IBAN')
  }
  const stid = v('steuer_id').match(/\d[\d /]{8,}\d/)?.[0]
  if (stid) {
    s.steuer_id = stid.trim()
    found.add('Steuer-ID')
  }
  if (raw.kirchensteuer) {
    const ks = checked(raw.kirchensteuer.line)
    if (ks) {
      s.kirchensteuer = ks
      found.add('Kirchensteuer')
    }
  }

  // Shares: "einen (1) Anteil", "3", "drei Anteile" or "mit 3 Geschäftsanteilen"
  const a = v('anteile')
  const units =
    Number(/\((\d+(?:,\d+)?)\)/.exec(a)?.[1]?.replace(',', '.') ?? /\b(\d+(?:,\d+)?)\b/.exec(a)?.[1]?.replace(',', '.') ?? NaN) ||
    WORDS[(/^([a-zäöü]+)/i.exec(a)?.[1] ?? '').toLowerCase()] ||
    Number(/\bmit\s+(\d+)\s+(Geschäfts)?anteil/i.exec(text)?.[1] ?? NaN)
  const total = raw.gesamt ? euro(raw.gesamt.value.replace(/gesamtsumme:?\s*(eur)?/i, '')) : null
  if (units > 0) {
    r.zeichnungen = [{ zugelassen: '', anteile: units, ar: '', ar_status: '', zahlung: '', betrag: total && total > 0 ? total : units * SHARE_EUR, zins_ende: '', zins_zahlung: '' }]
    found.add('Anteile')
  }

  // For the record: DocuSign envelope, place and date of signing, number if already assigned
  const envelope = /docusign\s+envelope\s+id:?\s*([0-9A-F-]{20,})/i.exec(text)?.[1]
  const signed = v('ortdatum')
  const nr = v('mitgliedsnummer')
  const note = [
    envelope && `DocuSign-Umschlag ${envelope}`,
    signed && `unterschrieben in ${signed.replace(/(\d{1,2}\.\d{1,2}\.\d{4})/, 'am $1').replace(/\s+am/, ' am')}`,
    nr && `Mitgliedsnummer im Dokument: ${nr}`,
  ].filter(Boolean)
  if (note.length) {
    r.bemerkungen = `Beitrittserklärung (PDF): ${note.join(', ')}`
    if (envelope) found.add('DocuSign-Umschlag')
  }

  return { record: r, secrets: s, found: [...found] }
}
