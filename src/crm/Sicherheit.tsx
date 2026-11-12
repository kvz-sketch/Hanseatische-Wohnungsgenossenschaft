import qrcode from 'qrcode-generator'
import { useState } from 'react'
import { IS_WORDPRESS, wpPost } from '../backend'
import { inputClass, labelClass } from './format'
import { Button, Card, ErrorNote } from './ui'

type Setup = { secret: string; uri: string }

// Demo build: a fixed example so the screens can be previewed.
const demo = {
  setup: async (): Promise<Setup> => ({ secret: 'JBSW Y3DP EHPK 3PXP', uri: 'otpauth://totp/Hanseatische%20Invest%20eG:demo?secret=JBSWY3DPEHPK3PXP&issuer=Hanseatische%20Invest%20eG' }),
  enable: async (): Promise<{ recoveryCodes: string[] }> => ({ recoveryCodes: ['ABCDE-FGHIJ', 'KLMNO-PQRST'] }),
}
const api = IS_WORDPRESS
  ? {
      setup: () => wpPost<Setup>('2fa/setup', {}),
      enable: (code: string) => wpPost<{ recoveryCodes: string[] }>('2fa/enable', { code }),
    }
  : demo

/** QR code of the otpauth link as an SVG data URL (rendered locally, the secret never leaves the browser). */
function qrSvg(text: string) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  return qr.createDataURL(5, 2)
}

/**
 * Two-factor setup for staff (inc/twofactor.php). Required before the
 * Mitgliederliste opens; afterwards shows that it is active.
 */
export default function Sicherheit({ enabled, required }: { enabled: boolean; required: boolean }) {
  const [setup, setSetup] = useState<Setup | null>(null)
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run<T>(fn: () => Promise<T>, then: (v: T) => void) {
    setBusy(true)
    setError('')
    try {
      then(await fn())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[40px] font-normal leading-tight">Sicherheit</h1>
      <p className="mb-6 mt-0 max-w-[680px] text-muted">
        Die Mitgliederliste enthält Bank- und Steuerdaten. Deshalb melden sich alle Mitarbeiter mit Passwort und einem Code aus einer
        Authenticator-App an (z. B. Microsoft Authenticator, Google Authenticator oder 1Password).
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}

      {recovery ? (
        <Card title="Zwei-Faktor-Anmeldung ist eingerichtet">
          <p className="mt-0 text-sm">
            Bewahren Sie diese Wiederherstellungscodes sicher auf (z. B. ausgedruckt oder im Passwort-Manager). Jeder Code funktioniert
            einmal, falls Ihr Telefon nicht verfügbar ist. Sie werden nur jetzt angezeigt.
          </p>
          <ul className="grid list-none grid-cols-2 gap-2 p-0 font-mono text-[15px] sm:grid-cols-4">
            {recovery.map((c) => <li key={c} className="rounded-control bg-navy-050 px-3 py-2 text-center">{c}</li>)}
          </ul>
          <Button onClick={() => location.assign('/mitgliederliste/')}>Codes gesichert, weiter zur Mitgliederliste</Button>
        </Card>
      ) : enabled ? (
        <Card title="Zwei-Faktor-Anmeldung">
          <p className="m-0 text-sm">
            <strong className="text-green">Aktiv.</strong> Bei jeder Anmeldung fragen wir nach dem Code aus Ihrer App. Neues Telefon oder Codes
            verloren? Eine Administratorin oder ein Administrator setzt die Zwei-Faktor-Anmeldung unter „Benutzer“ zurück, danach richten Sie
            sie hier neu ein.
          </p>
        </Card>
      ) : !setup ? (
        <Card title={required ? 'Bitte richten Sie die Zwei-Faktor-Anmeldung ein' : 'Zwei-Faktor-Anmeldung'}>
          <p className="mt-0 text-sm">Dauert etwa zwei Minuten. Halten Sie Ihr Telefon mit einer Authenticator-App bereit.</p>
          <Button disabled={busy} onClick={() => run(api.setup, setSetup)}>Einrichten</Button>
        </Card>
      ) : (
        <Card title="Zwei-Faktor-Anmeldung einrichten">
          <ol className="m-0 grid gap-5 pl-5 text-sm">
            <li>
              Öffnen Sie Ihre Authenticator-App, wählen Sie „Konto hinzufügen“ und scannen Sie diesen QR-Code:
              <img src={qrSvg(setup.uri)} alt="QR-Code für die Authenticator-App" className="mt-3 block size-[200px] rounded-control border border-line-soft bg-white" />
              <span className="mt-2 block text-xs text-muted">
                Kein Scan möglich? Schlüssel von Hand eingeben: <span className="font-mono text-ink">{setup.secret}</span>
              </span>
            </li>
            <li>
              Geben Sie den 6-stelligen Code ein, den die App jetzt anzeigt:
              <form
                className="mt-3 flex max-w-[360px] items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  run(() => api.enable(code.trim()), (r) => setRecovery(r.recoveryCodes))
                }}
              >
                <label className="block flex-1">
                  <span className={labelClass}>Code</span>
                  <input className={inputClass} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} required />
                </label>
                <Button type="submit" disabled={busy}>Bestätigen</Button>
              </form>
            </li>
          </ol>
        </Card>
      )}
    </>
  )
}
