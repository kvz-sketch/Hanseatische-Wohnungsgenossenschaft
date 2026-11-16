import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ANTEIL_EUR, api, emptyRecord, type Kuendigung, type MemberRecord, type Zeichnung, type Secrets, type SecretsInput } from './api'
import { AR_NAMES, STATUS, inputClass, labelClass } from './format'
import { currentMember } from '../auth/auth'
import { Button, ErrorNote } from './ui'

type ColType = 'text' | 'date' | 'number' | 'ar'
type Col<R> = { key: keyof R & string; label: string; type: ColType; width?: string }

/**
 * Form for a new Antrag (mode "neu") or for editing a member. Secret fields
 * stay empty unless they were revealed; left empty they keep the stored value.
 *
 * The signed Beitrittserklärung is read only for a new Antrag: it fills the
 * form once and is attached to the member. Later changes are made by hand
 * here, so a PDF never overwrites what the team has corrected since.
 */
export function MemberForm({
  mode,
  initial,
  masked,
  revealed,
  focus,
  onSave,
  onCancel,
}: {
  mode: 'neu' | 'edit'
  initial?: MemberRecord
  masked?: Secrets
  revealed?: Secrets | null
  /** Section to open the form at ('anteile', 'zinsen', 'kuendigungen'; 'kuendigung-neu' adds an empty Kündigung). */
  focus?: string
  /** `document`: a dropped PDF, `link`: a DocuSign link; attached to the new Antrag after saving. */
  onSave: (record: MemberRecord, secrets: SecretsInput, document: File | null, link: string) => Promise<void>
  onCancel: () => void
}) {
  const [r, setR] = useState<MemberRecord>(() => {
    const start = structuredClone(initial ?? { ...emptyRecord(), zeichnungen: [blankZeichnung()] })
    if (focus === 'kuendigung-neu') start.kuendigungen.push(blankKuendigung())
    return start
  })
  useEffect(() => {
    const target = focus === 'kuendigung-neu' ? 'kuendigungen' : focus
    if (target) document.getElementById(`form-${target}`)?.scrollIntoView({ block: 'start' })
  }, [focus])
  const [link, setLink] = useState('')
  const [secrets, setSecrets] = useState<Secrets>(revealed ?? { iban: '', steuer_id: '', kirchensteuer: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Approval fields: decided by the Aufsichtsrat; only administrators correct them (inc/crm.php, hansea_crm_protect)
  const admin = !!currentMember()?.admin
  const [doc, setDoc] = useState<File | null>(null)
  const [pdf, setPdf] = useState<{ found: string[]; note?: string } | null>(null)
  const [fromPdf, setFromPdf] = useState<Set<string>>(new Set())
  const hl = (key: string) => (fromPdf.has(key) ? 'border-gold bg-cream' : '')

  /** Reads a dropped Beitrittserklärung (new Antrag only) and fills the form with what it finds. */
  async function readPdf(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Bitte eine PDF-Datei ablegen.')
      return
    }
    setError('')
    setDoc(file)
    try {
      const { pdfLines, parseBeitritt } = await import('./pdfImport')
      const res = parseBeitritt(await pdfLines(file))
      const keys = new Set<string>()
      setR((prev) => {
        const next = { ...prev }
        for (const [k, v] of Object.entries(res.record) as [keyof MemberRecord, never][]) {
          if (k === 'bemerkungen') {
            if (!prev.bemerkungen.includes(String(v))) next.bemerkungen = [prev.bemerkungen, v].filter(Boolean).join('\n')
          } else {
            next[k] = v
            keys.add(k)
          }
        }
        return next
      })
      setSecrets((prev) => ({ ...prev, ...res.secrets }))
      Object.keys(res.secrets).forEach((k) => keys.add(k))
      setFromPdf(keys)
      setPdf({ found: res.found, note: res.record.art ? '' : 'Die Überschrift nennt keine Art der Mitgliedschaft: bitte unter „Mitgliedschaft“ prüfen (Standard: investierend).' })
    } catch {
      setPdf({ found: [], note: 'Der Text des PDFs konnte nicht gelesen werden (z. B. ein eingescanntes Bild). Es wird trotzdem angehängt; bitte die Felder von Hand ausfüllen.' })
    }
  }

  const set = <K extends keyof MemberRecord>(key: K, value: MemberRecord[K]) => setR((prev) => ({ ...prev, [key]: value }))
  const text = (key: keyof MemberRecord & string, label: string, props: { type?: string; className?: string; list?: string } = {}) => (
    <Field label={label} className={props.className}>
      <input
        type={props.type ?? 'text'}
        list={props.list}
        className={`${inputClass} ${hl(key)}`}
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
      await onSave(r, out, doc, link.trim())
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const secretPlaceholder = (k: keyof Secrets) => (masked?.[k] ? `unverändert (${masked[k]})` : '')

  return (
    <form onSubmit={submit} className="grid gap-5">
      <datalist id="ar-names">{AR_NAMES.map((n) => <option key={n} value={n} />)}</datalist>

      {mode === 'neu' && (
        <DropZone
          file={doc}
          onFile={readPdf}
          onRemove={() => { setDoc(null); setPdf(null); setFromPdf(new Set()); setLink('') }}
          link={link}
          onLink={async (url) => {
            setLink(url)
            setError('')
            try {
              await readPdf(await api.docusignPdf(url))
            } catch (e) {
              setPdf({ found: [], note: `Das PDF konnte nicht aus DocuSign geladen werden: ${(e as Error).message} Der Link wird beim Anlegen trotzdem unter „Dokumente“ gespeichert; bitte die Felder von Hand ausfüllen oder das PDF als Datei ablegen.` })
            }
          }}
        >
          {pdf && (
            <div className="mt-3 text-sm text-ink-2">
              {pdf.found.length > 0 && (
                <p className="m-0">
                  <strong>Übernommen:</strong> {pdf.found.join(', ')}. Die Felder sind gelb markiert, bitte prüfen.
                </p>
              )}
              {pdf.note && <p className="mb-0 mt-1">{pdf.note}</p>}
              <p className="mb-0 mt-1 text-xs text-muted">
                Das PDF wird beim Anlegen verschlüsselt unter „Dokumente“ abgelegt und ist auch im Mitgliederbereich des Mitglieds sichtbar.
              </p>
            </div>
          )}
        </DropZone>
      )}

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

      <Section
        title="Mitgliedschaft"
        hint="Ordentliche Mitglieder erhalten keine Zinsen; über sie entscheidet der Vorstand statt des Aufsichtsrats."
      >
        <Field label="Art der Mitgliedschaft">
          <select className={`${inputClass} ${hl('art')}`} value={r.art} onChange={(e) => set('art', e.target.value as MemberRecord['art'])}>
            <option value="i">Investierendes Mitglied</option>
            <option value="o">Ordentliches Mitglied</option>
          </select>
        </Field>
        <Field label="Eintrittsdatum">
          <input
            type="date"
            className={`${inputClass} ${hl('eintritt')}`}
            value={r.eintritt}
            onChange={(e) => set('eintritt', e.target.value)}
            aria-describedby="eintritt-hint"
          />
          <span id="eintritt-hint" className="mt-1 block text-xs text-muted">Leer: Tag der Zulassung</span>
        </Field>
        {mode === 'edit' && !admin && (
          <p className="m-0 self-end text-xs text-muted sm:col-span-2">
            Status, Mitgliedsnummer, Zulassung und Zustimmungen ändert ein Beschluss von Aufsichtsrat bzw. Vorstand (Korrekturen: Administratoren).
          </p>
        )}
        {mode === 'edit' && admin && (
          <>
            {text('nr', 'Mitgliedsnummer', { type: 'number' })}
            <Field label="Status">
              <select className={inputClass} value={r.status} onChange={(e) => set('status', e.target.value as MemberRecord['status'])}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            {text('zulassung_datum', 'Tag der Zulassung', { type: 'date' })}
            <Field label={`Zustimmung ${r.art === 'o' ? 'Vorstand' : 'Aufsichtsrat'}`}>
              <select className={inputClass} value={r.zulassung_status} onChange={(e) => set('zulassung_status', e.target.value as MemberRecord['zulassung_status'])}>
                <option value="offen">offen</option>
                <option value="zugestimmt">zugestimmt</option>
                <option value="abgelehnt">abgelehnt</option>
              </select>
            </Field>
            {text('zulassung_ar', r.art === 'o' ? 'Zustimmender Vorstand' : 'Zustimmender Aufsichtsrat', { list: 'ar-names' })}
          </>
        )}
        {mode === 'edit' && text('kuendbar_zu', 'Kündigung möglich zu', { type: 'date' })}
        {text('empfehler', 'Empfehler')}
      </Section>

      <Rows
        id="form-anteile"
        title="Anteile und Zahlungen"
        hint={`Ein Anteil = ${ANTEIL_EUR.toLocaleString('de-DE')} €. Der Betrag wird beim Eintragen der Anteile vorgeschlagen. Ändern sich die Anteile einer genehmigten Zeile, wird sie beim Speichern automatisch neu vorgelegt. Wird bei einem zugelassenen Mitglied ein Zahlungseingang neu eingetragen, erhält es beim Speichern automatisch die Bestätigung Zahlungseingang per E-Mail${r.art === 'o' ? '' : '; leere Zinsdaten werden dabei ergänzt'}.`}
        rows={r.zeichnungen}
        cols={[
          { key: 'anteile', label: 'Anteile', type: 'number', width: '90px' },
          { key: 'betrag', label: 'Betrag €', type: 'number', width: '120px' },
          { key: 'zahlung', label: 'Zahlungseingang', type: 'date' },
          { key: 'zugelassen', label: 'Zugelassen am', type: 'date' },
          ...arColumns<Zeichnung>(admin),
          // Ordentliche Mitglieder earn no interest
          ...(r.art === 'o'
            ? []
            : ([
                { key: 'zins_ende', label: 'Erstes Ende Verzinsung', type: 'date' },
                { key: 'zins_zahlung', label: 'Erste Zinszahlung bis', type: 'date' },
              ] as Col<Zeichnung>[])),
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
        id="form-kuendigungen"
        title="Kündigungen"
        hint={`Jede Kündigung braucht die Zustimmung ${r.art === 'o' ? 'des Vorstands' : 'aller drei Mitglieder des Aufsichtsrats'}. Wird eine genehmigte oder vorliegende Kündigung geändert (Datum, Anteile, Betrag), wird sie beim Speichern automatisch neu vorgelegt. Das Kündigungsschreiben (PDF oder DocuSign-Link) wird nach dem Speichern auf der Mitgliedsseite hinzugefügt.`}
        rows={r.kuendigungen}
        cols={[
          { key: 'anteile', label: 'Anteile', type: 'number', width: '90px' },
          { key: 'datum', label: 'Kündigung eingegangen', type: 'date' },
          { key: 'zum', label: 'Gekündigt zum', type: 'date' },
          { key: 'betrag', label: 'Betrag €', type: 'number', width: '120px' },
          ...arColumns<Kuendigung>(admin),
        ]}
        blank={blankKuendigung}
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
          <input className={`${inputClass} ${hl('iban')}`} value={secrets.iban} placeholder={secretPlaceholder('iban')} onChange={(e) => setSecrets({ ...secrets, iban: e.target.value })} autoComplete="off" />
        </Field>
        {text('kontoinhaber', 'Kontoinhaber')}
        <Field label="Steuer-ID">
          <input className={`${inputClass} ${hl('steuer_id')}`} value={secrets.steuer_id} placeholder={secretPlaceholder('steuer_id')} onChange={(e) => setSecrets({ ...secrets, steuer_id: e.target.value })} autoComplete="off" />
        </Field>
        <Field label="Kirchensteuer">
          <select className={`${inputClass} ${hl('kirchensteuer')}`} value={secrets.kirchensteuer} onChange={(e) => setSecrets({ ...secrets, kirchensteuer: e.target.value })}>
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
          {admin && (
            <>
              <Field label="Zustimmung Aufsichtsrat">
                <select className={inputClass} value={r.aus_ar_status} onChange={(e) => set('aus_ar_status', e.target.value as MemberRecord['aus_ar_status'])}>
                  <option value="">–</option>
                  <option value="offen">offen</option>
                  <option value="zugestimmt">zugestimmt</option>
                  <option value="abgelehnt">abgelehnt</option>
                </select>
              </Field>
              {text('aus_ar', 'Zustimmender Aufsichtsrat', { list: 'ar-names' })}
            </>
          )}
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

      {(r.art === 'i' || r.zinszahlungen.length > 0) && <Rows
        id="form-zinsen"
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
      />}

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

/** Aufsichtsrat columns of a row table, shown to administrators only. */
function arColumns<R extends Record<string, unknown>>(admin: boolean): Col<R>[] {
  return admin
    ? ([
        { key: 'ar', label: 'Aufsichtsrat', type: 'text' },
        { key: 'ar_status', label: 'Zustimmung', type: 'ar' },
      ] as Col<R>[])
    : []
}

const blankKuendigung = () => ({ datum: '', anteile: null, zum: '', betrag: null, ar: '', ar_status: '' as const, schreiben: '' })

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
  id,
  title,
  hint,
  rows,
  cols,
  blank,
  onChange,
  derive,
  addLabel,
}: {
  id?: string
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
    <fieldset id={id} className="m-0 min-w-0 scroll-mt-4 rounded-card border border-line-soft bg-white px-5 pb-5 pt-4">
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

/** Drop area (or file picker, or a DocuSign link) for the signed Beitrittserklärung. */
function DropZone({
  file,
  onFile,
  onRemove,
  link,
  onLink,
  children,
}: {
  file: File | null
  onFile: (f: File) => void
  onRemove: () => void
  link: string
  onLink: (url: string) => Promise<void>
  children?: ReactNode
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className={`rounded-card border-2 border-dashed px-5 py-5 transition-colors ${over ? 'border-gold bg-cream' : 'border-line bg-white'}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span aria-hidden className="grid h-12 w-10 shrink-0 place-items-center rounded bg-navy-050 text-[11px] font-bold text-ink">PDF</span>
        <div className="min-w-0 flex-1">
          {file || link ? (
            <p className="m-0 break-all text-sm font-semibold">{file ? file.name : `DocuSign-Link: ${link}`}</p>
          ) : (
            <>
              <p className="m-0 text-sm font-semibold">Unterschriebene Beitrittserklärung hier ablegen</p>
              <p className="m-0 text-xs text-muted">Die Angaben werden aus dem DocuSign-PDF übernommen. Oder die Felder unten von Hand ausfüllen.</p>
            </>
          )}
        </div>
        <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {file || link ? (
          <Button variant="quiet" onClick={() => { setUrl(''); onRemove() }}>Entfernen</Button>
        ) : (
          <Button variant="quiet" onClick={() => input.current?.click()}>PDF auswählen</Button>
        )}
      </div>
      {!file && !link && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
          <label className="min-w-[240px] flex-1">
            <span className="sr-only">DocuSign-Link</span>
            <input type="url" className={inputClass} placeholder="oder DocuSign-Link einfügen (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
          </label>
          <Button
            variant="quiet"
            disabled={loading || !/^https:\/\/\S+$/.test(url.trim())}
            onClick={async () => {
              setLoading(true)
              await onLink(url.trim())
              setLoading(false)
            }}
          >
            {loading ? 'Lädt …' : 'Aus DocuSign laden'}
          </Button>
        </div>
      )}
      {children}
    </div>
  )
}
