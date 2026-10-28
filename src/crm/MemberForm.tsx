import { useState, type FormEvent, type ReactNode } from 'react'
import { ANTEIL_EUR, emptyRecord, type MemberRecord, type Secrets, type SecretsInput } from './api'
import { AR_NAMES, STATUS, inputClass, labelClass } from './format'
import { Button, ErrorNote } from './ui'

type ColType = 'text' | 'date' | 'number' | 'ar'
type Col<R> = { key: keyof R & string; label: string; type: ColType; width?: string }

/**
 * Form for a new Antrag (mode "neu") or for editing a member. Secret fields
 * stay empty unless they were revealed; left empty they keep the stored value.
 */
export function MemberForm({
  mode,
  initial,
  masked,
  revealed,
  onSave,
  onCancel,
}: {
  mode: 'neu' | 'edit'
  initial?: MemberRecord
  masked?: Secrets
  revealed?: Secrets | null
  onSave: (record: MemberRecord, secrets: SecretsInput) => Promise<void>
  onCancel: () => void
}) {
  const [r, setR] = useState<MemberRecord>(() => structuredClone(initial ?? { ...emptyRecord(), zeichnungen: [blankZeichnung()] }))
  const [secrets, setSecrets] = useState<Secrets>(revealed ?? { iban: '', steuer_id: '', kirchensteuer: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof MemberRecord>(key: K, value: MemberRecord[K]) => setR((prev) => ({ ...prev, [key]: value }))
  const text = (key: keyof MemberRecord & string, label: string, props: { type?: string; className?: string; list?: string } = {}) => (
    <Field label={label} className={props.className}>
      <input
        type={props.type ?? 'text'}
        list={props.list}
        className={inputClass}
        value={(r[key] as string | number | null) ?? ''}
        onChange={(e) => set(key, (key === 'nr' || key === 'freistellung' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value) as never)}
      />
    </Field>
  )

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!r.nachname.trim() && !r.firma.trim()) {
      setError('Bitte mindestens Nachname oder Firma angeben.')
      return
    }
    setBusy(true)
    setError('')
    // Revealed or typed values are sent; untouched empty fields keep what is stored.
    const out: SecretsInput = { iban: null, steuer_id: null, kirchensteuer: null }
    for (const k of ['iban', 'steuer_id', 'kirchensteuer'] as const) {
      if (revealed ? secrets[k] !== revealed[k] : secrets[k] !== '') out[k] = secrets[k]
    }
    try {
      await onSave(r, out)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const secretPlaceholder = (k: keyof Secrets) => (masked?.[k] ? `unverändert (${masked[k]})` : '')

  return (
    <form onSubmit={submit} className="grid gap-5">
      <datalist id="ar-names">{AR_NAMES.map((n) => <option key={n} value={n} />)}</datalist>

      <Section title="Person und Kontakt">
        <Field label="Anrede">
          <select className={inputClass} value={r.anrede} onChange={(e) => set('anrede', e.target.value)}>
            {['', 'Frau', 'Herr', 'Herr und Frau', 'Divers'].map((a) => <option key={a} value={a}>{a || '–'}</option>)}
            {!['', 'Frau', 'Herr', 'Herr und Frau', 'Divers'].includes(r.anrede) && <option value={r.anrede}>{r.anrede}</option>}
          </select>
        </Field>
        {text('vorname', 'Vorname')}
        {text('nachname', 'Nachname')}
        {text('firma', 'Firma / juristische Person', { className: 'sm:col-span-2' })}
        {text('geburtstag', 'Geburtstag', { type: 'date' })}
        {text('strasse', 'Straße und Hausnummer', { className: 'sm:col-span-2' })}
        {text('plz', 'PLZ')}
        {text('ort', 'Ort')}
        {text('land', 'Land')}
        {text('telefon', 'Telefon', { type: 'tel' })}
        {text('email', 'E-Mail (wird der Portal-Login)', { type: 'email', className: 'sm:col-span-2' })}
      </Section>

      <Section title="Mitgliedschaft">
        <Field label="Art">
          <select className={inputClass} value={r.art} onChange={(e) => set('art', e.target.value as MemberRecord['art'])}>
            <option value="i">investierend</option>
            <option value="o">ordentlich</option>
          </select>
        </Field>
        {mode === 'edit' && (
          <>
            {text('nr', 'Mitgliedsnummer', { type: 'number' })}
            <Field label="Status">
              <select className={inputClass} value={r.status} onChange={(e) => set('status', e.target.value as MemberRecord['status'])}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            {text('zulassung_datum', 'Tag der Zulassung', { type: 'date' })}
            <Field label="Zustimmung Aufsichtsrat">
              <select className={inputClass} value={r.zulassung_status} onChange={(e) => set('zulassung_status', e.target.value as MemberRecord['zulassung_status'])}>
                <option value="offen">offen</option>
                <option value="zugestimmt">zugestimmt</option>
                <option value="abgelehnt">abgelehnt</option>
              </select>
            </Field>
            {text('zulassung_ar', 'Zustimmender Aufsichtsrat', { list: 'ar-names' })}
            {text('kuendbar_zu', 'Kündigung möglich zu', { type: 'date' })}
          </>
        )}
        {text('empfehler', 'Empfehler')}
      </Section>

      <Rows
        title="Anteile und Zahlungen"
        hint={`Ein Anteil = ${ANTEIL_EUR.toLocaleString('de-DE')} €. Der Betrag wird beim Eintragen der Anteile vorgeschlagen.`}
        rows={r.zeichnungen}
        cols={[
          { key: 'anteile', label: 'Anteile', type: 'number', width: '90px' },
          { key: 'betrag', label: 'Betrag €', type: 'number', width: '120px' },
          { key: 'zahlung', label: 'Zahlungseingang', type: 'date' },
          { key: 'zugelassen', label: 'Zugelassen am', type: 'date' },
          { key: 'ar', label: 'Aufsichtsrat', type: 'text' },
          { key: 'ar_status', label: 'Zustimmung', type: 'ar' },
          { key: 'zins_ende', label: 'Erstes Ende Verzinsung', type: 'date' },
          { key: 'zins_zahlung', label: 'Erste Zinszahlung bis', type: 'date' },
        ]}
        blank={blankZeichnung}
        onChange={(rows) => set('zeichnungen', rows)}
        derive={(row, key, prev) =>
          key === 'anteile' && (prev.betrag === null || prev.betrag === (prev.anteile ?? 0) * ANTEIL_EUR)
            ? { ...row, betrag: row.anteile === null ? null : row.anteile * ANTEIL_EUR }
            : row
        }
        addLabel="Zeichnung hinzufügen"
      />

      <Rows
        title="Kündigungen"
        rows={r.kuendigungen}
        cols={[
          { key: 'anteile', label: 'Anteile', type: 'number', width: '90px' },
          { key: 'datum', label: 'Kündigung eingegangen', type: 'date' },
          { key: 'zum', label: 'Gekündigt zum', type: 'date' },
          { key: 'betrag', label: 'Betrag €', type: 'number', width: '120px' },
          { key: 'ar', label: 'Aufsichtsrat', type: 'text' },
          { key: 'ar_status', label: 'Zustimmung', type: 'ar' },
        ]}
        blank={() => ({ datum: '', anteile: null, zum: '', betrag: null, ar: '', ar_status: '' as const })}
        onChange={(rows) => set('kuendigungen', rows)}
        derive={(row, key, prev) =>
          key === 'anteile' && (prev.betrag === null || prev.betrag === (prev.anteile ?? 0) * ANTEIL_EUR)
            ? { ...row, betrag: row.anteile === null ? null : row.anteile * ANTEIL_EUR }
            : row
        }
        addLabel="Kündigung hinzufügen"
      />

      <Section title="Bank und Steuer" hint="IBAN, Steuer-ID und Kirchensteuer werden verschlüsselt gespeichert.">
        <Field label="IBAN" className="sm:col-span-2">
          <input className={inputClass} value={secrets.iban} placeholder={secretPlaceholder('iban')} onChange={(e) => setSecrets({ ...secrets, iban: e.target.value })} autoComplete="off" />
        </Field>
        {text('kontoinhaber', 'Kontoinhaber')}
        <Field label="Steuer-ID">
          <input className={inputClass} value={secrets.steuer_id} placeholder={secretPlaceholder('steuer_id')} onChange={(e) => setSecrets({ ...secrets, steuer_id: e.target.value })} autoComplete="off" />
        </Field>
        <Field label="Kirchensteuer">
          <select className={inputClass} value={secrets.kirchensteuer} onChange={(e) => setSecrets({ ...secrets, kirchensteuer: e.target.value })}>
            <option value="">{masked?.kirchensteuer && !revealed ? 'unverändert' : '–'}</option>
            <option value="ja">ja</option>
            <option value="nein">nein</option>
          </select>
        </Field>
        {text('bundesland', 'Bundesland')}
        {text('freistellung', 'Freistellungsauftrag €', { type: 'number' })}
      </Section>

      {mode === 'edit' && (
        <Section title="Ausscheiden">
          {text('aus_eintragung', 'Tag der Eintragung', { type: 'date' })}
          {text('aus_datum', 'Tag des Ausscheidens', { type: 'date' })}
          <Field label="Zustimmung Aufsichtsrat">
            <select className={inputClass} value={r.aus_ar_status} onChange={(e) => set('aus_ar_status', e.target.value as MemberRecord['aus_ar_status'])}>
              <option value="">–</option>
              <option value="offen">offen</option>
              <option value="zugestimmt">zugestimmt</option>
              <option value="abgelehnt">abgelehnt</option>
            </select>
          </Field>
          {text('aus_ar', 'Zustimmender Aufsichtsrat', { list: 'ar-names' })}
          {text('aus_grund', 'Grund', { className: 'sm:col-span-2' })}
        </Section>
      )}

      <Rows
        title="Zeichnungsbonus"
        rows={r.bonus}
        cols={[
          { key: 'projekt', label: 'Projekt', type: 'text' },
          { key: 'anteile', label: 'Anteile', type: 'number', width: '90px' },
          { key: 'betrag', label: 'Betrag €', type: 'number', width: '120px' },
          { key: 'auszahlung', label: 'Auszahlung am', type: 'date' },
        ]}
        blank={() => ({ projekt: 'Eilbek', anteile: null, betrag: null, auszahlung: '' })}
        onChange={(rows) => set('bonus', rows)}
        derive={(row, key) => (key === 'anteile' && row.anteile !== null ? { ...row, betrag: row.anteile * 300 } : row)}
        addLabel="Bonus hinzufügen"
      />

      <Rows
        title="Zinszahlungen"
        hint="Ausgezahlte Zinsen. Der Zeitraum ist das Ende der Zinsperiode, z. B. 31.12.2026 für das vierte Quartal."
        rows={r.zinszahlungen}
        cols={[
          { key: 'datum', label: 'Ausgezahlt am', type: 'date' },
          { key: 'zeitraum', label: 'Zeitraum bis', type: 'date' },
          { key: 'betrag', label: 'Brutto €', type: 'number', width: '120px' },
          { key: 'steuer', label: 'Steuer einbehalten €', type: 'number', width: '140px' },
        ]}
        blank={() => ({ datum: '', zeitraum: '', betrag: null, steuer: null })}
        onChange={(rows) => set('zinszahlungen', rows)}
        addLabel="Zinszahlung hinzufügen"
      />

      <Section title="Bemerkungen">
        <Field label="Bemerkungen" className="sm:col-span-full">
          <textarea className={`${inputClass} h-auto min-h-[110px] py-2`} value={r.bemerkungen} onChange={(e) => set('bemerkungen', e.target.value)} />
        </Field>
      </Section>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-line-soft bg-section/95 px-5 py-4 backdrop-blur">
        <Button type="submit" disabled={busy}>{busy ? 'Speichert …' : mode === 'neu' ? 'Antrag anlegen' : 'Speichern'}</Button>
        <Button variant="quiet" onClick={onCancel} disabled={busy}>Abbrechen</Button>
      </div>
    </form>
  )
}

const blankZeichnung = () => ({ zugelassen: '', anteile: 1, ar: '', ar_status: '' as const, zahlung: '', betrag: ANTEIL_EUR, zins_ende: '', zins_zahlung: '' })

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 rounded-card border border-line-soft bg-white px-5 pb-5 pt-4">
      <legend className="sr-only">{title}</legend>
      <h2 className="m-0 text-[15px] font-semibold" aria-hidden>{title}</h2>
      {hint && <p className="mb-0 mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </fieldset>
  )
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

function Rows<R extends Record<string, unknown>>({
  title,
  hint,
  rows,
  cols,
  blank,
  onChange,
  derive,
  addLabel,
}: {
  title: string
  hint?: string
  rows: R[]
  cols: Col<R>[]
  blank: () => R
  onChange: (rows: R[]) => void
  derive?: (row: R, key: keyof R, prev: R) => R
  addLabel: string
}) {
  const update = (i: number, key: keyof R, raw: string, type: ColType) => {
    const value = type === 'number' ? (raw === '' ? null : Number(raw.replace(',', '.'))) : raw
    const next = { ...rows[i], [key]: value } as R
    onChange(rows.map((row, n) => (n === i ? (derive ? derive(next, key, rows[i]) : next) : row)))
  }
  return (
    <fieldset className="m-0 min-w-0 rounded-card border border-line-soft bg-white px-5 pb-5 pt-4">
      <legend className="sr-only">{title}</legend>
      <h2 className="m-0 text-[15px] font-semibold" aria-hidden>{title}</h2>
      {hint && <p className="mb-0 mt-1 text-xs text-muted">{hint}</p>}
      <div className="-mx-5 mt-3 overflow-x-auto px-5">
        {rows.length > 0 && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                {cols.map((c) => <th key={c.key} className="px-1 pb-1 font-medium first:pl-0" style={{ minWidth: c.width ?? '140px' }}>{c.label}</th>)}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c.key} className="px-1 py-1 first:pl-0">
                      {c.type === 'ar' ? (
                        <select aria-label={c.label} className={inputClass} value={String(row[c.key] ?? '')} onChange={(e) => update(i, c.key, e.target.value, c.type)}>
                          <option value="">–</option>
                          <option value="offen">offen</option>
                          <option value="zugestimmt">zugestimmt</option>
                          <option value="abgelehnt">abgelehnt</option>
                        </select>
                      ) : (
                        <input
                          aria-label={c.label}
                          type={c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text'}
                          step={c.type === 'number' ? 'any' : undefined}
                          list={c.key === 'ar' ? 'ar-names' : undefined}
                          className={inputClass}
                          value={String(row[c.key] ?? '')}
                          onChange={(e) => update(i, c.key, e.target.value, c.type)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="py-1 pl-1">
                    <button
                      type="button"
                      aria-label="Zeile entfernen"
                      className="size-10 cursor-pointer rounded-control border border-line bg-white text-muted hover:border-coral hover:text-coral-600"
                      onClick={() => onChange(rows.filter((_, n) => n !== i))}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Button variant="quiet" className="mt-3" onClick={() => onChange([...rows, blank()])}>+ {addLabel}</Button>
    </fieldset>
  )
}
