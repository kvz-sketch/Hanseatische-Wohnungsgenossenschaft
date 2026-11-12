// Mitglieder-CRM data: the theme's REST API (inc/crm.php) in the WordPress
// build, a few made-up members in memory everywhere else.

import { IS_WORDPRESS, WordPressError, wp, wpPost, wpUrl } from '../backend'

export type Status = 'antrag' | 'zugelassen' | 'abgelehnt' | 'ausgeschieden'
export type Art = 'i' | 'o'
/** Who decides: the Aufsichtsrat, or the Vorstand for ordentliche Mitglieder. */
export type Gremium = 'ar' | 'vorstand'
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
/** schreiben: ID of the uploaded Kündigungsschreiben; needed before the Kündigung goes to the Aufsichtsrat. */
export type Kuendigung = { datum: string; anteile: number | null; zum: string; betrag: number | null; ar: string; ar_status: ArStatus; schreiben: string }
export type Bonus = { projekt: string; anteile: number | null; betrag: number | null; auszahlung: string }
/** Interest paid out: date, end of the interest period, gross amount, tax withheld. */
export type Zinszahlung = { datum: string; zeitraum: string; betrag: number | null; steuer: number | null }
export type NextInterest = { date: string; amount: number; period: string }

export type MemberRecord = {
  nr: number | null
  status: Status
  /** Investierendes (default) or ordentliches Mitglied: no interest, decisions by the Vorstand. */
  art: Art
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
  /** Eintrittsdatum; empty = the day of the Zulassung. */
  eintritt: string
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
/** sent: something went to the member (an email, or a document in their members' area). */
export type LogEntry = { time: string; user: string; action: string; detail: string; sent?: boolean }
/** A log entry of any member, for the tab "Verlauf". */
export type LogItem = LogEntry & { member: number; name: string }

export type MemberSummary = Totals & {
  id: number
  nr: number | null
  name: string
  firma: string
  ort: string
  email: string
  art: Art
  status: Status
  zulassung_status: string
  zulassung_datum: string
  /** Eintrittsdatum, or the day of the Zulassung while none is entered. */
  eintritt: string
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
  documents: CrmDocument[]
  beschluesse: Beschluss[]
}

export type ActionResult = { member: MemberDetail; message: string }

/**
 * Encrypted file attached to a member, also shown in their members' area.
 * kind: beitritt (signed Beitrittserklärung), kuendigung (Kündigungsschreiben),
 * zustimmung (approval document of the Beschluss `beschluss`), or '' (other).
 */
export type DocKind = '' | 'beitritt' | 'kuendigung' | 'zustimmung'
export type CrmDocument = { id: string; name: string; size: number; time: string; user: string; kind: DocKind; beschluss: string }
export type UploadOptions = { kind?: DocKind; ref?: number; beschluss?: string }

export type BeschlussType = 'zulassung' | 'zeichnung' | 'kuendigung' | 'ausscheiden'
export type Vote = { name: string; fullName: string; vote: '' | 'zugestimmt' | 'abgelehnt'; time: string; note: string }
/** A decision put to the Aufsichtsrat; every member must agree. */
export type Beschluss = {
  id: string
  gremium: Gremium
  type: BeschlussType
  title: string
  /** Row in Anteile/Kündigungen for zeichnung/kuendigung. */
  ref: number
  status: 'offen' | 'zugestimmt' | 'abgelehnt' | 'zurückgezogen'
  created: string
  by: string
  portal: boolean
  closed: string
  votes: Vote[]
  /** The logged-in Aufsichtsrat member can still vote on it. */
  canVote: boolean
}
export type InboxItem = Beschluss & { member: number; name: string; documents: CrmDocument[] }
export type Inbox = { items: InboxItem[]; ar: string[]; size: number; vorstand: string[] }

/** Secret fields to save: null keeps the stored value. */
export type SecretsInput = { [K in keyof Secrets]: string | null }

export const emptyRecord = (): MemberRecord => ({
  nr: null, status: 'antrag', art: 'i', firma: '', anrede: '', vorname: '', nachname: '', strasse: '', plz: '', ort: '',
  land: 'DE', telefon: '', email: '', geburtstag: '', eintritt: '', zulassung_datum: '', zulassung_status: 'offen', zulassung_ar: '',
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
      portal: (id: number) => wpPost<ActionResult>(`crm/members/${id}/portal`, {}),
      vorlegen: (id: number, body: { type: BeschlussType; ref?: number; portal?: boolean }) => wpPost<ActionResult>(`crm/members/${id}/beschluss`, body),
      vote: (id: number, bid: string, body: { vote: 'zugestimmt' | 'abgelehnt'; note: string }) => wpPost<ActionResult>(`crm/members/${id}/beschluss/${bid}/vote`, body),
      cancel: (id: number, bid: string) => wpPost<ActionResult>(`crm/members/${id}/beschluss/${bid}/cancel`, {}),
      inbox: () => wpGet<Inbox>('crm/beschluesse'),
      log: () => wpGet<LogItem[]>('crm/log'),
      upload: async (id: number, file: File, opts: UploadOptions = {}) => {
        const { restUrl, nonce } = wp()
        const body = new FormData()
        body.append('file', file)
        for (const [k, v] of Object.entries(opts)) if (v !== undefined) body.append(k, String(v))
        const res = await fetch(`${restUrl}hansea/v1/crm/members/${id}/documents`, { method: 'POST', credentials: 'same-origin', headers: { 'X-WP-Nonce': nonce }, body })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new WordPressError(data?.message ?? 'Das Dokument konnte nicht hochgeladen werden.', res.status)
        return data as MemberDetail
      },
      documentUrl: (id: number, doc: string) => wpUrl(`crm/members/${id}/documents/${doc}`),
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
  // A one-page PDF standing in for uploaded letters in the demo
  const demoPdf = (title: string) => URL.createObjectURL(new Blob([`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>>endobj 4 0 obj<</Length ${title.length + 40}>>stream\nBT /F1 18 Tf 60 760 Td (${title}) Tj ET\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF`], { type: 'application/pdf' }))
  type Row = { record: MemberRecord; secrets: Secrets; log: LogEntry[]; portal: Portal; updated: string; docs: (CrmDocument & { url: string })[]; beschluesse: Beschluss[] }
  const VOLL: Record<string, string> = { Bartlau: 'Rainer Bartlau', Dobuch: 'Sophia Dobuch', Kogan: 'Vadim Kogan', Gerlach: 'Stephan Gerlach' }
  // Demo: the three Aufsichtsrat members (or the Vorstand) vote one after another from this browser.
  const AR = ['Bartlau', 'Dobuch', 'Kogan']
  const VORSTAND = ['Gerlach']
  const voters = (g: Gremium) => (g === 'vorstand' ? VORSTAND : AR)
  const rows = new Map<number, Row>()
  let nextId = 1
  const add = (patch: Partial<MemberRecord>, secrets: Partial<Secrets> = {}, portal: Portal = { status: 'keiner' }) => {
    rows.set(nextId++, {
      record: { ...emptyRecord(), ...patch },
      secrets: { iban: '', steuer_id: '', kirchensteuer: '', ...secrets },
      log: [{ time: '2026-10-20T09:00:00Z', user: 'System', action: 'Import aus der Google-Tabelle', detail: '' }],
      portal,
      updated: '2026-10-20T09:00:00Z',
      docs: [],
      beschluesse: [],
    })
  }
  add({ nr: 1, status: 'zugelassen', zulassung_status: 'zugestimmt', art: 'o', eintritt: '2024-07-01', vorname: 'Erika', nachname: 'Beispiel', firma: 'Beispiel Verwaltung GmbH', strasse: 'Musterweg 1', plz: '20095', ort: 'Hamburg', email: 'erika@example.org', zulassung_datum: '2024-07-30', zeichnungen: [zeichnung('2024-07-30', 1, '')] })
  add({ nr: 2, status: 'zugelassen', zulassung_status: 'zugestimmt', zulassung_ar: 'Muster', anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', strasse: 'Hauptstraße 5', plz: '50667', ort: 'Köln', email: 'max@example.org', telefon: '+49 221 000000', zulassung_datum: '2025-03-04', empfehler: 'Website', kuendbar_zu: '2025-12-31', freistellung: 1000, kontoinhaber: 'Max Mustermann', bundesland: 'NRW', zeichnungen: [zeichnung('2025-03-04', 5, '2025-03-06'), zeichnung('2026-03-13', 2, '2026-03-16')], kuendigungen: [{ datum: '2026-06-24', anteile: 2, zum: '2027-03-31', betrag: 20000, ar: 'Muster', ar_status: 'zugestimmt', schreiben: '' }], bonus: [{ projekt: 'Eilbek', anteile: 2, betrag: 600, auszahlung: '2027-09-30' }], zinszahlungen: [{ datum: '2026-07-14', zeitraum: '2026-06-30', betrag: 875, steuer: 0 }, { datum: '2026-10-14', zeitraum: '2026-09-30', betrag: 1225, steuer: 0 }] }, { iban: 'DE02120300000000202051', steuer_id: '12 345 678 901', kirchensteuer: 'nein' }, { status: 'eingeladen', email: 'max@example.org', invited: '2026-04-01T09:00:00Z' })
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
  const log = (r: Row, action: string, detail = '', sent = false) => { r.log.unshift({ time: new Date().toISOString(), user: 'Vorschau', action, detail, ...(sent ? { sent } : {}) }); r.updated = new Date().toISOString() }
  const detail = (id: number): MemberDetail => {
    const r = row(id)
    return { id, record: structuredClone(r.record), masked: { iban: mask(r.secrets.iban), steuer_id: mask(r.secrets.steuer_id, 3), kirchensteuer: r.secrets.kirchensteuer ? '••••' : '' }, portal: r.portal, totals: totals(r.record), next: r.record.status === 'zugelassen' && r.record.art === 'i' && totals(r.record).kapital > 0 && !r.record.zinszahlungen.some((z) => z.zeitraum === '2026-12-31') ? { date: '2027-01-15', amount: totals(r.record).kapital * ZINS / 4, period: '2026-12-31' } : null, log: [...r.log], documents: r.docs.map(({ url: _url, ...d }) => d), beschluesse: r.beschluesse.map(publicB) }
  }
  const publicB = (b: Beschluss): Beschluss => ({ ...b, votes: b.votes.map((v) => ({ ...v })), canVote: b.status === 'offen' })
  const addDoc = (r: Row, name: string, url: string, kind: DocKind = '', beschluss = '') => {
    const doc = { id: Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32), name, size: 0, time: new Date().toISOString(), user: 'Vorschau', kind, beschluss, url }
    r.docs.push(doc)
    return doc
  }
  const eintritt = (r: MemberRecord) => r.eintritt || r.zulassung_datum
  const TYPES: Record<BeschlussType, string> = { zulassung: 'Aufnahme als Mitglied', zeichnung: 'Weitere Geschäftsanteile', kuendigung: 'Kündigung von Geschäftsanteilen', ausscheiden: 'Ausscheiden' }
  const applyB = (id: number, b: Beschluss) => {
    const r = row(id)
    const ok = b.status === 'zugestimmt'
    const names = voters(b.gremium).join(', ')
    const agreed = voters(b.gremium).length === 1 ? 'Zugestimmt' : 'Alle haben zugestimmt'
    if (b.type === 'zulassung') {
      Object.assign(r.record, { zulassung_status: b.status, zulassung_ar: names, zulassung_datum: today(), status: ok ? 'zugelassen' : 'abgelehnt' })
      if (ok) {
        r.record.nr = r.record.nr ?? Math.max(0, ...[...rows.values()].map((x) => x.record.nr ?? 0)) + 1
        r.record.zeichnungen = r.record.zeichnungen.map((z) => (z.zugelassen ? z : { ...z, zugelassen: today(), ar: names, ar_status: 'zugestimmt' }))
        return `${agreed}: Mitglied Nr. ${r.record.nr} ist zugelassen. ${b.portal ? openPortal(id) : 'Kein Portal-Zugang angelegt.'}`
      }
    } else if (b.type === 'ausscheiden') {
      Object.assign(r.record, { aus_ar_status: b.status, aus_ar: names }, ok ? { status: 'ausgeschieden' } : {})
    } else {
      const list = b.type === 'zeichnung' ? r.record.zeichnungen : r.record.kuendigungen
      if (list[b.ref]) Object.assign(list[b.ref], { ar_status: b.status, ar: names })
    }
    return ok ? `${agreed}, der Beschluss ist gefasst.` : 'Der Beschluss ist abgelehnt.'
  }
  const setSecrets = (r: Row, s: SecretsInput) => { for (const k of ['iban', 'steuer_id', 'kirchensteuer'] as const) if (s[k] !== null) r.secrets[k] = s[k] ?? '' }
  const openPortal = (id: number) => {
    const r = row(id)
    if (!r.record.email) throw new Error('Für den Portal-Zugang fehlt eine gültige E-Mail-Adresse.')
    r.portal = { status: 'eingeladen', email: r.record.email, invited: new Date().toISOString() }
    log(r, `E-Mail: Hanseatische Invest eG – Bestätigung Mitgliedschaft Nr. ${r.record.nr}`, `An ${r.record.email}: Mitgliedsnummer ${r.record.nr}, Zahlungsdaten und Zugang zum Mitgliederbereich`, true)
    return `Portal-Zugang eingerichtet. Die Bestätigungsmail mit Mitgliedsnummer, Zahlungsdaten und Zugangsdaten ist an ${r.record.email} unterwegs. (Vorschau: es wird nichts gesendet.)`
  }
  // The open Antrag comes with its signed Beitrittserklärung, as if dropped in when it was created
  addDoc(row(4), 'Beitrittserklaerung_Petra_Antrag.pdf', demoPdf('Beitrittserklaerung (Beispiel) - Petra Antrag'), 'beitritt')
  const wait = <T,>(fn: () => T) => new Promise<T>((ok, fail) => setTimeout(() => { try { ok(fn()) } catch (e) { fail(e) } }, 150))

  return {
    list: () => wait(() => [...rows].map(([id, r]): MemberSummary => ({
      id, nr: r.record.nr, name: name(r.record), firma: r.record.firma, ort: r.record.ort, email: r.record.email, art: r.record.art, status: r.record.status,
      zulassung_status: r.record.zulassung_status, zulassung_datum: r.record.zulassung_datum, eintritt: eintritt(r.record), empfehler: r.record.empfehler, bonus: r.record.bonus,
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
    update: (id: number, record: MemberRecord, secrets: SecretsInput) => wait(() => {
      const r = row(id)
      if (record.art !== r.record.art && r.beschluesse.some((b) => b.status === 'offen')) throw new Error('Die Art der Mitgliedschaft lässt sich erst ändern, wenn keine Vorlage mehr offen ist. Bitte die Vorlage zurückziehen oder die Entscheidung abwarten.')
      const next = structuredClone(record)
      // Any change to an approved Kündigung needs the approval again
      r.record.kuendigungen.forEach((was, i) => {
        const now = next.kuendigungen[i]
        if (now && was.ar_status === 'zugestimmt' && (['datum', 'anteile', 'zum', 'betrag'] as const).some((k) => now[k] !== was[k])) {
          Object.assign(now, { ar_status: '', ar: '' })
          log(r, 'Kündigung geändert', `Zeile ${i + 1}: die Zustimmung muss neu eingeholt werden`)
        }
      })
      r.record = next
      setSecrets(r, secrets)
      log(r, 'Geändert')
      return detail(id)
    }),
    reveal: (id: number) => wait(() => { const r = row(id); log(r, 'Bank- und Steuerdaten angezeigt'); return { ...r.secrets } }),
    portal: (id: number) => wait(() => ({ message: openPortal(id), member: detail(id) })),
    vorlegen: (id: number, body: { type: BeschlussType; ref?: number; portal?: boolean }) => wait(() => {
      const r = row(id)
      const ref = body.ref ?? 0
      if (r.beschluesse.some((b) => b.status === 'offen' && b.type === body.type && b.ref === ref)) throw new Error('Dazu liegt schon ein offener Beschluss vor.')
      if (body.type === 'kuendigung' && !r.record.kuendigungen[ref]?.schreiben) throw new Error('Bitte zuerst das ausgefüllte Kündigungsschreiben zu dieser Kündigung hochladen.')
      const gremium: Gremium = r.record.art === 'o' ? 'vorstand' : 'ar'
      const b: Beschluss = { id: Math.random().toString(16).slice(2, 18).padEnd(16, '0'), gremium, type: body.type, ref, title: `${TYPES[body.type]}: ${name(r.record)}`, status: 'offen', created: new Date().toISOString(), by: 'Vorschau', portal: !!body.portal, closed: '', votes: voters(gremium).map((n) => ({ name: n, fullName: VOLL[n] ?? n, vote: '', time: '', note: '' })), canVote: true }
      r.beschluesse.push(b)
      if (body.type === 'zulassung') r.record.zulassung_status = 'offen'
      else if (body.type === 'ausscheiden') r.record.aus_ar_status = 'offen'
      else (body.type === 'zeichnung' ? r.record.zeichnungen : r.record.kuendigungen)[ref].ar_status = 'offen'
      const label = gremium === 'vorstand' ? 'Vorstand' : 'Aufsichtsrat'
      log(r, `Dem ${label} vorgelegt`, b.title)
      return { member: detail(id), message: `Dem ${label} vorgelegt. ${voters(gremium).join(', ')} ${voters(gremium).length === 1 ? 'wurde' : 'wurden'} per E-Mail benachrichtigt. (Vorschau: es wird nichts gesendet.)` }
    }),
    vote: (id: number, bid: string, body: { vote: 'zugestimmt' | 'abgelehnt'; note: string }) => wait(() => {
      const r = row(id)
      const b = r.beschluesse.find((x) => x.id === bid)
      const slot = b?.votes.find((v) => !v.vote)
      if (!b || b.status !== 'offen' || !slot) throw new Error('Über diesen Beschluss ist schon entschieden.')
      Object.assign(slot, { vote: body.vote, time: new Date().toISOString(), note: body.note })
      log(r, `${b.gremium === 'vorstand' ? 'Vorstand' : 'Aufsichtsrat'}: ${body.vote === 'zugestimmt' ? 'Zustimmung' : 'Ablehnung'}`, `${b.title} (${slot.name})`)
      if (body.vote === 'abgelehnt') b.status = 'abgelehnt'
      else if (b.votes.every((v) => v.vote === 'zugestimmt')) b.status = 'zugestimmt'
      if (b.status !== 'offen') b.closed = new Date().toISOString()
      const done = b.status !== 'offen' ? ` ${applyB(id, b)}` : ` ${b.votes.filter((v) => v.vote).length} von ${b.votes.length} Stimmen liegen vor.`
      return { member: detail(id), message: `Stimme von ${slot.name} gespeichert (Vorschau).${done}` }
    }),
    cancel: (id: number, bid: string) => wait(() => {
      const r = row(id)
      const b = r.beschluesse.find((x) => x.id === bid)
      if (b) b.status = 'zurückgezogen'
      log(r, 'Vorlage zurückgezogen', b?.title)
      return { member: detail(id), message: 'Vorlage zurückgezogen.' }
    }),
    inbox: () => wait((): Inbox => ({
      items: [...rows].flatMap(([id, r]) => r.beschluesse.filter((b) => b.status === 'offen').map((b) => ({ ...publicB(b), member: id, name: name(r.record), documents: r.docs.map(({ url: _url, ...d }) => d) }))),
      ar: AR,
      size: 3,
      vorstand: VORSTAND,
    })),
    upload: (id: number, file: File, opts: UploadOptions = {}) => wait(() => {
      const r = row(id)
      if (opts.kind === 'zustimmung' && r.docs.some((d) => d.beschluss === opts.beschluss)) throw new Error('Das Dokument zu dieser Zustimmung liegt schon vor.')
      const doc = addDoc(r, file.name, URL.createObjectURL(file), opts.kind ?? '', opts.beschluss ?? '')
      if (opts.kind === 'kuendigung' && r.record.kuendigungen[opts.ref ?? -1]) {
        r.record.kuendigungen[opts.ref!].schreiben = doc.id
        log(r, 'Kündigungsschreiben hochgeladen', `${file.name} (Kündigung Zeile ${opts.ref! + 1}, im Mitgliederbereich sichtbar)`, true)
      } else log(r, opts.kind === 'zustimmung' ? 'Zustimmungsdokument abgelegt' : 'Dokument hochgeladen', `${file.name} (im Mitgliederbereich sichtbar)`, true)
      return detail(id)
    }),
    log: () => wait((): LogItem[] => [...rows].flatMap(([id, r]) => r.log.map((l) => ({ ...l, member: id, name: name(r.record) }))).sort((a, b) => b.time.localeCompare(a.time))),
    documentUrl: (id: number, doc: string) => rows.get(id)?.docs.find((d) => d.id === doc)?.url ?? '#',
  }
}
