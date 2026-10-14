import { useState, type FormEvent } from 'react'
import { callSlots } from '../data/content'
import { toE164 } from '../data/phone'
import { ConsentCheckbox } from './ui'

// Lead forms have no backend yet. Set this to an endpoint that accepts a JSON
// POST (e.g. a small PHP script on the host) to start receiving requests.
const LEAD_ENDPOINT = ''

async function submitLead(payload: Record<string, unknown>) {
  if (!LEAD_ENDPOINT) {
    console.warn('LEAD_ENDPOINT is not configured; lead not sent', payload)
    return
  }
  const res = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Lead endpoint responded ${res.status}`)
}

const inputClass =
  'w-full rounded-control border border-line bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none'

function SubmitButton({ busy, children }: { busy: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full cursor-pointer rounded-control bg-brick px-5 py-4 text-base font-bold text-white transition-colors hover:bg-brick-hover active:bg-brick-active disabled:opacity-60"
    >
      {busy ? 'Wird gesendet …' : children}
    </button>
  )
}

function Done({ title, text }: { title: string; text: string }) {
  return (
    <div role="status" className="rounded-card bg-green-tint p-6 text-ink">
      <p className="m-0 text-lg font-bold">{title}</p>
      <p className="m-0 mt-2 text-[15px] text-ink-2">{text}</p>
    </div>
  )
}

/** "Wir rufen Sie an" – callback request in the hero. */
export function CallbackForm() {
  const [slot, setSlot] = useState(callSlots[0])
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('') // honeypot
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; consent?: boolean; send?: boolean }>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const e164 = toE164(phone)
    const next = {
      phone: e164 ? undefined : 'Bitte prüfen Sie die Nummer, zum Beispiel 0171 2345678.',
      consent: !consent,
    }
    setErrors(next)
    if (next.phone || next.consent) return
    if (fax) return setDone(true)
    setBusy(true)
    try {
      await submitLead({ type: 'callback', slot, phone: e164, page: location.pathname })
      setDone(true)
    } catch {
      setErrors({ send: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      id="termin"
      onSubmit={onSubmit}
      noValidate
      className="relative scroll-mt-24 rounded-card bg-white p-7 text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
    >
      <h2 className="m-0 text-[26px] font-extrabold tracking-tight">Wir rufen Sie an</h2>
      <p className="m-0 mt-2 text-[15px] text-muted">Kostenlos, 20 Minuten, kein Vertrag. Einmal – nicht fünfmal.</p>

      {done ? (
        <div className="mt-6">
          <Done
            title="Danke, wir melden uns."
            text={`Ein Berater ruft Sie ${slot === 'Schnellstmöglich' ? 'schnellstmöglich' : `zwischen ${slot}`} an.`}
          />
        </div>
      ) : (
        <>
          <fieldset className="m-0 mt-6 border-0 p-0">
            <legend className="mb-3 p-0 text-[15px] font-bold">Wann erreichen wir Sie am besten?</legend>
            <div className="grid grid-cols-2 gap-2">
              {callSlots.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={slot === s}
                  onClick={() => setSlot(s)}
                  className={`cursor-pointer rounded-control border px-3 py-3 text-[15px] font-bold transition-colors ${
                    slot === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor="hs-tel" className="mt-6 mb-2 block text-[15px] font-bold">
            Ihre Mobilnummer
          </label>
          <input
            id="hs-tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0171 2345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby="hs-tel-hint"
            className={`${inputClass} ${errors.phone ? 'border-brick' : ''}`}
          />
          <p id="hs-tel-hint" className={`m-0 mt-2 text-[13px] ${errors.phone ? 'text-brick' : 'text-muted'}`}>
            {errors.phone ?? 'So wie Sie sie wählen würden, zum Beispiel 0171 2345678.'}
          </p>

          <div className="absolute -left-[9999px]" aria-hidden>
            <label htmlFor="hs-fax">Fax</label>
            <input id="hs-fax" tabIndex={-1} autoComplete="off" value={fax} onChange={(e) => setFax(e.target.value)} />
          </div>

          <div className="mt-5">
            <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent}>
              Ja, die Hanseatische Invest eG darf mich im gewählten Zeitfenster telefonisch zu meiner Anfrage kontaktieren
              und mir einen Zugangscode für mein Portal per SMS an diese Nummer senden. Ich kann diese Einwilligung
              jederzeit widerrufen. <a href="#">Datenschutzhinweise</a>
            </ConsentCheckbox>
            {errors.consent && <p className="m-0 mt-2 text-[13px] text-brick">Bitte bestätigen Sie die Einwilligung.</p>}
          </div>

          <div className="mt-6">
            <SubmitButton busy={busy}>Rückruf anfordern</SubmitButton>
          </div>
          {errors.send && (
            <p className="m-0 mt-3 text-[13px] text-brick">Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.</p>
          )}
          <p className="m-0 mt-3 text-center text-[12px] text-muted">
            Keine weiteren Daten nötig · Server in Deutschland · Keine Weitergabe
          </p>
        </>
      )}
    </form>
  )
}

/** "Zugang anfordern" – access code request on the projects page. */
export function AccessForm() {
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<{ contact?: string; consent?: boolean; send?: boolean }>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const value = contact.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    const e164 = isEmail ? null : toE164(value)
    const next = {
      contact: isEmail || e164 ? undefined : 'Bitte geben Sie eine Mobilnummer oder E-Mail-Adresse ein.',
      consent: !consent,
    }
    setErrors(next)
    if (next.contact || next.consent) return
    setBusy(true)
    try {
      await submitLead({ type: 'access', email: isEmail ? value : undefined, phone: e164 ?? undefined })
      setDone(true)
    } catch {
      setErrors({ send: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-card bg-white p-6 text-ink sm:p-8">
      <h2 className="m-0 text-[28px] font-extrabold tracking-tight">Zugang anfordern</h2>
      <p className="m-0 mt-3 text-base text-ink-2">
        Telefonnummer oder E-Mail-Adresse eingeben, Code empfangen, fertig. Kein Passwort, kein Konto.
      </p>

      {done ? (
        <div className="mt-6">
          <Done title="Code ist unterwegs." text="Prüfen Sie Ihre SMS oder Ihr Postfach." />
        </div>
      ) : (
        <>
          <label htmlFor="zugang-contact" className="mt-6 mb-2 block text-[14px] font-bold">
            Telefonnummer oder E-Mail-Adresse
          </label>
          <input
            id="zugang-contact"
            autoComplete="email"
            placeholder="0171 2345678 oder name@beispiel.de"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            aria-invalid={!!errors.contact}
            aria-describedby="zugang-contact-hint"
            className={`${inputClass} ${errors.contact ? 'border-brick' : ''}`}
          />
          <p id="zugang-contact-hint" className={`m-0 mt-2 text-[13px] ${errors.contact ? 'text-brick' : 'text-muted'}`}>
            {errors.contact ?? 'Mobilnummer so wie Sie sie wählen würden, oder Ihre E-Mail-Adresse.'}
          </p>

          <div className="mt-5">
            <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent}>
              Ja, die Hanseatische Invest eG darf mir den Zugangscode an die angegebene Nummer oder Adresse senden und mich
              zu meiner Anfrage kontaktieren. Ich kann diese Einwilligung jederzeit widerrufen.
            </ConsentCheckbox>
            {errors.consent && <p className="m-0 mt-2 text-[13px] text-brick">Bitte bestätigen Sie die Einwilligung.</p>}
          </div>

          <div className="mt-6">
            <SubmitButton busy={busy}>Code senden</SubmitButton>
          </div>
          {errors.send && (
            <p className="m-0 mt-3 text-[13px] text-brick">Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.</p>
          )}
        </>
      )}

      <p className="m-0 mt-4 text-[15px] text-ink-2">
        Ihre Daten werden nur für den Zugang und eine mögliche Rückfrage verwendet. Keine Weitergabe, kein Newsletter.
      </p>
    </form>
  )
}
