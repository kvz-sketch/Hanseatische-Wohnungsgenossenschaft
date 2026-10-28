// Mitglieder-CRM data: the theme's REST API (inc/crm.php) in the WordPress
// build, a few made-up members in memory everywhere else.

import { IS_WORDPRESS, WordPressError, wpPost, wpUrl } from '../backend'

export type Status = 'antrag' | 'zugelassen' | 'abgelehnt' | 'ausgeschieden'
export type ArStatus = '' | 'offen' | 'zugestimmt' | 'abgelehnt'

export type Zeichnung = {
  zugelassen: string
  anteile: number | null
  ar: string
  ar_status: ArStatus
  zahlung: string
  betrag: number | null
  zins_ende: string
  zins_zahlung: string
}
export type Kuendigung = { datum: string; anteile: number | null; zum: string; betrag: number | null; ar: string; ar_status: ArStatus }
export type Bonus = { projekt: string; anteile: number | null; betrag: number | null; auszahlung: string }
/** Interest paid out: date, end of the interest period, gross amount, tax withheld. */
export type Zinszahlung = { datum: string; zeitraum: string; betrag: number | null; steuer: number | null }
export type NextInterest = { date: string; amount: number; period: string }

export type MemberRecord = {
  nr: number | null
  status: Status
  art: 'i' | 'o'
  firma: string
  anrede: string
  vorname: string
  nachname: string
  strasse: string
  plz: string
  ort: string
  land: string
  telefon: string
  email: string
  geburtstag: string
  zulassung_datum: string
  zulassung_status: 'offen' | 'zugestimmt' | 'abgelehnt'
  zulassung_ar: string
  bundesland: string
  freistellung: number | null
  kontoinhaber: string
  kuendbar_zu: string
  empfehler: string
  bemerkungen: string
  aus_eintragung: string
  aus_grund: string
  aus_datum: string
  aus_ar_status: ArStatus
  aus_ar: string
  zeichnungen: Zeichnung[]
  kuendigungen: Kuendigung[]
  bonus: Bonus[]
  zinszahlungen: Zinszahlung[]
}

export type Secrets = { iban: string; steuer_id: string; kirchensteuer: string }
export type Totals = { anteile: number; kapital: number; gekuendigt: number; aktiv: number }
export type Portal = { status: 'keiner' | 'angelegt' | 'eingeladen'; email?: string; invited?: string | null }
export type LogEntry = { time: string; user: string; action: string; detail: string }

export type MemberSummary = Totals & {
  id: number
  nr: number | null
  name: string
  firma: string
  ort: string
  email: string
  art: 'i' | 'o'
  status: Status
  zulassung_status: string
  zulassung_datum: string
  empfehler: string
  bonus: Bonus[]
  portal: Portal['status']
  updated: string
}

export type MemberDetail = {
  id: number
  record: MemberRecord
  masked: Secrets
  portal: Portal
  totals: Totals
  /** Calculated next interest payment (7 % target), null when none is due. */
  next: NextInterest | null
  log: LogEntry[]
}

export type ActionResult = { member: MemberDetail; message: string }

/** Secret fields to save: null keeps the stored value. */
export type SecretsInput = { [K in keyof Secrets]: string | null }

export const emptyRecord = (): MemberRecord => ({
  nr: null, status: 'antrag', art: 'i', firma: '', anrede: '', vorname: '', nachname: '', strasse: '', plz: '', ort: '',
  land: 'DE', telefon: '', email: '', geburtstag: '', zulassung_datum: '', zulassung_status: 'offen', zulassung_ar: '',
  bundesland: '', freistellung: null, kontoinhaber: '', kuendbar_zu: '', empfehler: '', bemerkungen: '', aus_eintragung: '',
  aus_grund: '', aus_datum: '', aus_ar_status: '', aus_ar: '', zeichnungen: [], kuendigungen: [], bonus: [], zinszahlungen: [],
})

/** Interest the Genossenschaft pays on paid-in capital, p.a. */
export const ZINS = 0.07
/** Price of one Geschäftsanteil. */
export const ANTEIL_EUR = 10000

async function wpGet<T>(route: string): Promise<T> {
  const res = await fetch(wpUrl(route), { credentials: 'same-origin' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new WordPressError(data?.message ?? 'Die Daten konnten nicht geladen werden.', res.status)
  return data as T
}

export const api = IS_WORDPRESS
  ? {
      list: () => wpGet<MemberSummary[]>('crm/members'),
      get: (id: number) => wpGet<MemberDetail>(`crm/members/${id}`),
      create: (record: MemberRecord, secrets: SecretsInput) => wpPost<MemberDetail>('crm/members', { record, secrets }),
      update: (id: number, record: MemberRecord, secrets: SecretsInput) => wpPost<MemberDetail>(`crm/members/${id}`, { record, secrets }),
      reveal: (id: number) => wpPost<Secrets>(`crm/members/${id}/reveal`, {}),
      approve: (id: number, body: { ar: string; datum: string; portal: boolean }) => wpPost<ActionResult>(`crm/members/${id}/approve`, body),
      reject: (id: number, body: { ar: string; datum: string; grund: string }) => wpPost<ActionResult>(`crm/members/${id}/reject`, body),
      portal: (id: number) => wpPost<ActionResult>(`crm/members/${id}/portal`, {}),
    }
  : demoApi()

/* ------------------------------------------------------------------------
 * Demo: made-up members, kept in memory for this visit
 * --------------------------------------------------------------------- */

function demoApi() {
  const today = () => new Date().toISOString().slice(0, 10)
  const zeichnung = (zugelassen: string, anteile: number, zahlung: string): Zeichnung => ({
    zugelassen, anteile, ar: 'Muster', ar_status: 'zugestimmt', zahlung, betrag: zahlung ? anteile * ANTEIL_EUR : null, zins_ende: '', zins_zahlung: '',
  })
  type Row = { record: MemberRecord; secrets: Secrets; log: LogEntry[]; portal: Portal; updated: string }
  const rows = new Map<number, Row>()
  let nextId = 1
  const add = (patch: Partial<MemberRecord>, secrets: Partial<Secrets> = {}, portal: Portal = { status: 'keiner' }) => {
    rows.set(nextId++, {
      record: { ...emptyRecord(), ...patch },
      secrets: { iban: '', steuer_id: '', kirchensteuer: '', ...secrets },
      log: [{ time: '2026-10-20T09:00:00Z', user: 'System', action: 'Import aus der Google-Tabelle', detail: '' }],
      portal,
      updated: '2026-10-20T09:00:00Z',
    })
  }
  add({ nr: 1, status: 'zugelassen', zulassung_status: 'zugestimmt', art: 'o', vorname: 'Erika', nachname: 'Beispiel', firma: 'Beispiel Verwaltung GmbH', strasse: 'Musterweg 1', plz: '20095', ort: 'Hamburg', email: 'erika@example.org', zulassung_datum: '2024-07-30', zeichnungen: [zeichnung('2024-07-30', 1, '')] })
  add({ nr: 2, status: 'zugelassen', zulassung_status: 'zugestimmt', zulassung_ar: 'Muster', anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', strasse: 'Hauptstraße 5', plz: '50667', ort: 'Köln', email: 'max@example.org', telefon: '+49 221 000000', zulassung_datum: '2025-03-04', empfehler: 'Website', kuendbar_zu: '2025-12-31', freistellung: 1000, kontoinhaber: 'Max Mustermann', bundesland: 'NRW', zeichnungen: [zeichnung('2025-03-04', 5, '2025-03-06'), zeichnung('2026-03-13', 2, '2026-03-16')], kuendigungen: [{ datum: '2026-06-24', anteile: 2, zum: '2027-03-31', betrag: 20000, ar: 'Muster', ar_status: 'zugestimmt' }], bonus: [{ projekt: 'Eilbek', anteile: 2, betrag: 600, auszahlung: '2027-09-30' }], zinszahlungen: [{ datum: '2026-07-14', zeitraum: '2026-06-30', betrag: 875, steuer: 0 }, { datum: '2026-10-14', zeitraum: '2026-09-30', betrag: 1225, steuer: 0 }] }, { iban: 'DE02120300000000202051', steuer_id: '12 345 678 901', kirchensteuer: 'nein' }, { status: 'eingeladen', email: 'max@example.org', invited: '2026-04-01T09:00:00Z' })
  add({ nr: 3, status: 'ausgeschieden', zulassung_status: 'zugestimmt', anrede: 'Frau', vorname: 'Anna', nachname: 'Probe', ort: 'Berlin', zulassung_datum: '2026-03-10', aus_eintragung: '2026-05-05', aus_datum: '2026-05-05', aus_grund: 'Beitritt zurückgezogen', aus_ar_status: 'zugestimmt', aus_ar: 'Muster' })
  add({ anrede: 'Frau', vorname: 'Petra', nachname: 'Antrag', strasse: 'Am Hafen 3', plz: '22415', ort: 'Hamburg', email: 'petra@example.org', empfehler: 'Veranstaltung', zeichnungen: [zeichnung('', 3, '')] })

  const mask = (v: string, n = 4) => { const s = v.replace(/\s+/g, ''); return !s ? '' : s.length <= n ? '••••' : `•••• ${s.slice(-n)}` }
  const totals = (r: MemberRecord): Totals => {
    const anteile = r.zeichnungen.reduce((s, z) => s + (z.anteile ?? 0), 0)
    const ausgezahlt = r.kuendigungen.filter((k) => k.zum && k.zum <= today()).reduce((s, k) => s + (k.anteile ?? 0), 0)
    return { anteile, kapital: r.zeichnungen.reduce((s, z) => s + (z.betrag ?? 0), 0), gekuendigt: r.kuendigungen.reduce((s, k) => s + (k.anteile ?? 0), 0), aktiv: Math.max(0, anteile - ausgezahlt) }
  }
  const name = (r: MemberRecord) => `${r.vorname} ${r.nachname}`.trim() || r.firma || 'Ohne Namen'
  const row = (id: number) => { const r = rows.get(id); if (!r) throw new Error('Mitglied nicht gefunden.'); return r }
  const log = (r: Row, action: string, detail = '') => { r.log.unshift({ time: new Date().toISOString(), user: 'Vorschau', action, detail }); r.updated = new Date().toISOString() }
  const detail = (id: number): MemberDetail => {
    const r = row(id)
    return { id, record: structuredClone(r.record), masked: { iban: mask(r.secrets.iban), steuer_id: mask(r.secrets.steuer_id, 3), kirchensteuer: r.secrets.kirchensteuer ? '••••' : '' }, portal: r.portal, totals: totals(r.record), next: r.record.status === 'zugelassen' && totals(r.record).kapital > 0 && !r.record.zinszahlungen.some((z) => z.zeitraum === '2026-12-31') ? { date: '2027-01-15', amount: totals(r.record).kapital * ZINS / 4, period: '2026-12-31' } : null, log: [...r.log] }
  }
  const setSecrets = (r: Row, s: SecretsInput) => { for (const k of ['iban', 'steuer_id', 'kirchensteuer'] as const) if (s[k] !== null) r.secrets[k] = s[k] ?? '' }
  const openPortal = (id: number) => {
    const r = row(id)
    if (!r.record.email) throw new Error('Für den Portal-Zugang fehlt eine gültige E-Mail-Adresse.')
    r.portal = { status: 'eingeladen', email: r.record.email, invited: new Date().toISOString() }
    log(r, 'Portal-Zugang eingerichtet', `Willkommensmail an ${r.record.email}`)
    return `Portal-Zugang eingerichtet. Die Willkommensmail ist an ${r.record.email} unterwegs. (Vorschau: es wird nichts gesendet.)`
  }
  const wait = <T,>(fn: () => T) => new Promise<T>((ok, fail) => setTimeout(() => { try { ok(fn()) } catch (e) { fail(e) } }, 150))

  return {
    list: () => wait(() => [...rows].map(([id, r]): MemberSummary => ({
      id, nr: r.record.nr, name: name(r.record), firma: r.record.firma, ort: r.record.ort, email: r.record.email, art: r.record.art, status: r.record.status,
      zulassung_status: r.record.zulassung_status, zulassung_datum: r.record.zulassung_datum, empfehler: r.record.empfehler, bonus: r.record.bonus,
      portal: r.portal.status, updated: r.updated, ...totals(r.record),
    }))),
    get: (id: number) => wait(() => detail(id)),
    create: (record: MemberRecord, secrets: SecretsInput) => wait(() => {
      const id = nextId
      add({ ...record, status: 'antrag', zulassung_status: 'offen', nr: null })
      const r = row(id)
      setSecrets(r, secrets)
      r.log = []
      log(r, 'Antrag angelegt')
      return detail(id)
    }),
    update: (id: number, record: MemberRecord, secrets: SecretsInput) => wait(() => { const r = row(id); r.record = structuredClone(record); setSecrets(r, secrets); log(r, 'Geändert'); return detail(id) }),
    reveal: (id: number) => wait(() => { const r = row(id); log(r, 'Bank- und Steuerdaten angezeigt'); return { ...r.secrets } }),
    approve: (id: number, body: { ar: string; datum: string; portal: boolean }) => wait(() => {
      const r = row(id)
      const nr = r.record.nr ?? Math.max(0, ...[...rows.values()].map((x) => x.record.nr ?? 0)) + 1
      Object.assign(r.record, { status: 'zugelassen', zulassung_status: 'zugestimmt', zulassung_ar: body.ar, zulassung_datum: body.datum || today(), nr })
      r.record.zeichnungen = r.record.zeichnungen.map((z) => (z.zugelassen ? z : { ...z, zugelassen: body.datum || today(), ar: body.ar, ar_status: 'zugestimmt' }))
      log(r, 'Zugelassen', `Mitgliedsnummer ${nr}, Zustimmung Aufsichtsrat: ${body.ar}`)
      const portal = body.portal ? openPortal(id) : 'Kein Portal-Zugang angelegt.'
      return { member: detail(id), message: `Zugelassen als Mitglied Nr. ${nr}. ${portal}` }
    }),
    reject: (id: number, body: { ar: string; datum: string; grund: string }) => wait(() => {
      const r = row(id)
      Object.assign(r.record, { status: 'abgelehnt', zulassung_status: 'abgelehnt', zulassung_ar: body.ar, zulassung_datum: body.datum || today() })
      log(r, 'Abgelehnt', body.grund)
      return { member: detail(id), message: 'Antrag abgelehnt.' }
    }),
    portal: (id: number) => wait(() => ({ message: openPortal(id), member: detail(id) })),
  }
}
