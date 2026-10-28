import type { MemberSummary, Status } from './api'

const eurFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 })
const numFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

export const eur = (n: number | null | undefined) => (n === null || n === undefined ? '–' : eurFmt.format(n))
export const num = (n: number | null | undefined) => (n === null || n === undefined ? '–' : numFmt.format(n))

/** "2026-03-04" → "04.03.2026". */
export const date = (iso: string | null | undefined) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}.${m[2]}.${m[1]}` : '–'
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const STATUS: Record<Status, { label: string; className: string }> = {
  antrag: { label: 'Antrag offen', className: 'bg-gold-100 text-gold-700' },
  zugelassen: { label: 'Zugelassen', className: 'bg-green-tint text-green' },
  abgelehnt: { label: 'Abgelehnt', className: 'bg-coral-100 text-coral-600' },
  ausgeschieden: { label: 'Ausgeschieden', className: 'bg-navy-050 text-muted' },
}

/** Cancellation state of an admitted member, or null. */
export function kuendigungLabel(t: Pick<MemberSummary, 'gekuendigt' | 'anteile'>) {
  if (t.gekuendigt <= 0) return null
  return t.gekuendigt >= t.anteile ? 'Gekündigt' : 'Teilgekündigt'
}

export const PORTAL: Record<MemberSummary['portal'], string> = {
  keiner: 'Kein Zugang',
  angelegt: 'Angelegt',
  eingeladen: 'Eingeladen',
}

/** Aufsichtsrat members who approved earlier decisions, as suggestions. */
export const AR_NAMES = ['Bartlau', 'Kogan', 'Pistorius']

export const go = (hash: string) => {
  location.hash = hash
}

export const inputClass = 'h-10 w-full rounded-control border border-line bg-white px-3 text-sm focus:border-ink'
export const labelClass = 'mb-1 block text-xs font-medium text-muted'
