import { useEffect, useState, type FormEvent } from 'react'
import { currentMember } from '../auth/auth'
import { IS_WORDPRESS, WordPressError } from '../backend'
import {
  beitrittConfig,
  beitrittDocumentUrl,
  resumeBeitritt,
  startBeitritt,
  syncBeitritt,
  type Application,
  type BeitrittData,
} from '../data/beitritt'
import { Field, SubmitButton } from './AuthForm'
import { ConsentCheckbox } from './ui'

const euro = (v: number) => `${new Intl.NumberFormat('de-DE').format(v)} €`
const date = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

type Errors = Partial<Record<keyof BeitrittData | 'consent' | 'form', string>>

function BeitrittForm({ initial, onSaved }: { initial?: BeitrittData; onSaved: (a: Application) => void }) {
  const config = beitrittConfig()
  const [v, setV] = useState({
    birthDate: initial?.birthDate ?? '',
    street: initial?.street ?? '',
    zip: initial?.zip ?? '',
    city: initial?.city ?? '',
    phone: initial?.phone ?? '',
    units: String(initial?.units ?? config.minUnits),
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }))
  const units = Number.parseInt(v.units, 10) || 0

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (!v.birthDate) next.birthDate = 'Bitte geben Sie Ihr Geburtsdatum ein.'
    if (!v.street.trim()) next.street = 'Bitte geben Sie Straße und Hausnummer ein.'
    if (!/^\d{5}$/.test(v.zip.trim())) next.zip = 'Fünfstellige Postleitzahl.'
    if (!v.city.trim()) next.city = 'Bitte geben Sie Ihren Wohnort ein.'
    if (units < config.minUnits || units > config.maxUnits)
      next.units = `Zwischen ${config.minUnits} und ${new Intl.NumberFormat('de-DE').format(config.maxUnits)} Anteilen.`
    if (!consent) next.consent = 'Bitte bestätigen Sie die Hinweise.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      const data: BeitrittData = { birthDate: v.birthDate, street: v.street.trim(), zip: v.zip.trim(), city: v.city.trim(), phone: v.phone.trim(), units }
      const { application, url } = await startBeitritt(data, config.consent.version)
      if (url) {
        location.assign(url) // DocuSign signing page; it sends the member back here
        return
      }
      onSaved(application)
    } catch (err) {
      setErrors({ form: err instanceof WordPressError ? err.message : 'Das hat nicht geklappt. Bitte versuchen Sie es erneut.' })
    }
    setBusy(false)
  }

  const member = currentMember()

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-6">
      {member && (
        <p className="m-0 rounded-control bg-section px-4 py-3 text-[14px] text-ink-2 sm:col-span-6">
          <strong className="text-ink">
            {member.firstName} {member.lastName}
          </strong>{' '}
          · {member.email}
          <span className="block text-[13px] text-muted">Aus Ihrem Mitgliederkonto. Änderungen bitte über den Mitgliederservice.</span>
        </p>
      )}
      <div className="sm:col-span-3">
        <Field id="bt-birth" label="Geburtsdatum" type="date" autoComplete="bday" value={v.birthDate} onChange={set('birthDate')} error={errors.birthDate} />
      </div>
      <div className="sm:col-span-3">
        <Field id="bt-phone" label="Telefon (optional)" type="tel" autoComplete="tel" value={v.phone} onChange={set('phone')} />
      </div>
      <div className="sm:col-span-6">
        <Field id="bt-street" label="Straße und Hausnummer" autoComplete="street-address" value={v.street} onChange={set('street')} error={errors.street} />
      </div>
      <div className="sm:col-span-2">
        <Field id="bt-zip" label="PLZ" inputMode="numeric" autoComplete="postal-code" value={v.zip} onChange={set('zip')} error={errors.zip} />
      </div>
      <div className="sm:col-span-4">
        <Field id="bt-city" label="Ort" autoComplete="address-level2" value={v.city} onChange={set('city')} error={errors.city} />
      </div>
      <div className="sm:col-span-3">
        <Field
          id="bt-units"
          label={`Anzahl Anteile à ${euro(config.sharePrice)}`}
          type="number"
          min={config.minUnits}
          max={config.maxUnits}
          step={1}
          value={v.units}
          onChange={set('units')}
          error={errors.units}
          hint={`Mindestens ${config.minUnits} Anteile (${euro(config.minUnits * config.sharePrice)}).`}
        />
      </div>
      <div className="flex flex-col justify-center rounded-card bg-section px-5 py-4 sm:col-span-3">
        <span className="text-[13px] text-muted">Ihre Beteiligung</span>
        <span className="font-display text-[28px] leading-tight tabular-nums">{euro(units * config.sharePrice)}</span>
      </div>
      <div className="sm:col-span-6">
        <ConsentCheckbox checked={consent} onChange={setConsent} error={!!errors.consent}>
          {config.consent.text} <a href="#">Satzung</a> · <a href="#">Risikohinweis</a> · <a href="#">Datenschutzhinweise</a>
        </ConsentCheckbox>
        {errors.consent && <p className="m-0 mt-2 text-[13px] text-coral-600">{errors.consent}</p>}
      </div>
      {errors.form && (
        <p role="alert" className="m-0 rounded-control bg-coral-100 px-4 py-3 text-[14px] text-coral-600 sm:col-span-6">
          {errors.form}
        </p>
      )}
      <div className="sm:col-span-6">
        <SubmitButton busy={busy}>{config.signingEnabled ? 'Weiter zur Unterschrift' : 'Beitrittserklärung absenden'}</SubmitButton>
        <p className="m-0 mt-3 text-center text-[12px] text-muted">
          {config.signingEnabled
            ? 'Sie unterschreiben digital bei DocuSign und kommen danach automatisch hierher zurück.'
            : 'Wir melden uns nach Eingang mit den Unterlagen zur Unterschrift.'}
        </p>
      </div>
    </form>
  )
}

function StatusCard({ application, onRestart }: { application: Application; onRestart: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { status, data } = application
  const amount = euro(data.units * beitrittConfig().sharePrice)
  const documentUrl = beitrittDocumentUrl()

  async function resume() {
    setBusy(true)
    setError('')
    try {
      location.assign(await resumeBeitritt())
    } catch (err) {
      setError(err instanceof WordPressError ? err.message : 'Das hat nicht geklappt. Bitte versuchen Sie es erneut.')
      setBusy(false)
    }
  }

  const content = {
    unterschrieben: {
      tone: 'bg-green-tint',
      title: 'Beitrittserklärung unterschrieben',
      text: `${data.units} Anteile, ${amount}, unterschrieben am ${date(application.signedAt ?? application.submittedAt)}. Wir prüfen Ihre Angaben und melden uns mit den nächsten Schritten.`,
    },
    entwurf: {
      tone: 'bg-gold-100',
      title: 'Unterschrift ausstehend',
      text: `Ihre Beitrittserklärung über ${data.units} Anteile (${amount}) ist vorbereitet, aber noch nicht unterschrieben.`,
    },
    eingegangen: {
      tone: 'bg-green-tint',
      title: 'Beitrittserklärung eingegangen',
      text: `Ihre Angaben über ${data.units} Anteile (${amount}) sind am ${date(application.submittedAt)} bei uns eingegangen. Wir melden uns mit den Unterlagen zur Unterschrift.`,
    },
    abgelehnt: {
      tone: 'bg-coral-100',
      title: 'Unterschrift abgelehnt',
      text: 'Sie haben die Unterschrift bei DocuSign abgelehnt. Sie können die Beitrittserklärung jederzeit neu ausfüllen, oder rufen Sie uns an.',
    },
    storniert: {
      tone: 'bg-section',
      title: 'Beitrittserklärung zurückgezogen',
      text: 'Diese Beitrittserklärung ist nicht mehr gültig. Sie können sie neu ausfüllen.',
    },
  }[status]

  return (
    <div role="status" className={`rounded-card p-6 sm:p-8 ${content.tone}`}>
      <p className="m-0 text-lg font-bold">{content.title}</p>
      <p className="m-0 mt-2 text-[15px] leading-relaxed text-ink-2">{content.text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {status === 'unterschrieben' && application.hasDocument && documentUrl && (
          <a href={documentUrl} target="_blank" rel="noopener" className="rounded-control bg-ink px-5 py-3 text-[15px] font-bold text-white no-underline hover:bg-navy-600">
            Unterschriebenes Dokument öffnen
          </a>
        )}
        {status === 'entwurf' && (
          <button
            type="button"
            onClick={resume}
            disabled={busy}
            className="cursor-pointer rounded-control border-0 bg-gold px-5 py-3 text-[15px] font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
          >
            {busy ? 'Bitte warten …' : 'Jetzt unterschreiben'}
          </button>
        )}
        {status !== 'unterschrieben' && (
          <button
            type="button"
            onClick={onRestart}
            className="cursor-pointer rounded-control border-2 border-navy-200 bg-transparent px-5 py-2.5 text-[15px] font-semibold text-ink hover:border-ink"
          >
            {status === 'entwurf' || status === 'eingegangen' ? 'Angaben ändern' : 'Neu ausfüllen'}
          </button>
        )}
      </div>
      {error && <p className="m-0 mt-3 text-[13px] text-coral-600">{error}</p>}
    </div>
  )
}

/** "Beitrittserklärung" section of the members' area. */
export default function Beitritt() {
  const config = beitrittConfig()
  const [application, setApplication] = useState<Application | null>(config.application)
  const [editing, setEditing] = useState(false)
  // Back from DocuSign (?beitritt=zurueck): the theme asks DocuSign for the new status.
  const [checking, setChecking] = useState(() => new URLSearchParams(location.search).get('beitritt') === 'zurueck')

  useEffect(() => {
    if (!checking) return
    document.getElementById('beitritt')?.scrollIntoView({ block: 'start' })
    try {
      history.replaceState(null, '', location.pathname + '#beitritt')
    } catch {
      // not available in sandboxed previews
    }
    syncBeitritt()
      .then((a) => a && setApplication(a))
      .catch(() => undefined)
      .finally(() => setChecking(false))
  }, [checking])

  const showForm = editing || !application

  return (
    <section id="beitritt" className="section scroll-mt-20">
      <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-[88px]">
        <div>
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Beitritt</p>
          <h2 className="h2 mt-3">Ihre Beitrittserklärung</h2>
          <p className="m-0 mt-4 text-[17px] leading-relaxed text-ink-2">
            Ihre Daten aus dem Mitgliederkonto sind schon eingetragen. Ergänzen Sie Anschrift und Anzahl der Anteile und
            unterschreiben Sie digital, ohne Ausdrucken und ohne Post.
          </p>
          <ol className="m-0 mt-6 grid list-none gap-3 p-0 text-[15px] text-ink-2">
            {['Angaben ergänzen', 'Digital unterschreiben (DocuSign)', 'Bestätigung und Bankverbindung für die Einzahlung'].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-bold text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
          {(!IS_WORDPRESS || !config.signingEnabled || config.demo) && (
            <p className="m-0 mt-6 rounded-control border border-gold-400/50 bg-gold-100 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
              <strong>Testphase:</strong>{' '}
              {config.signingEnabled
                ? 'Die digitale Unterschrift läuft noch in der DocuSign-Testumgebung und ist nicht rechtsgültig.'
                : 'Die digitale Unterschrift wird gerade eingerichtet. Bis dahin nehmen wir Ihre Angaben entgegen und senden Ihnen die Unterlagen zur Unterschrift.'}
            </p>
          )}
        </div>

        <div className="rounded-card border border-line bg-white p-6 sm:p-8">
          {checking ? (
            <p role="status" className="m-0 text-[15px] text-ink-2">
              Wir prüfen den Status Ihrer Unterschrift …
            </p>
          ) : showForm ? (
            <BeitrittForm
              initial={application?.data}
              onSaved={(a) => {
                setApplication(a)
                setEditing(false)
              }}
            />
          ) : (
            <StatusCard application={application} onRestart={() => setEditing(true)} />
          )}
        </div>
      </div>
    </section>
  )
}
