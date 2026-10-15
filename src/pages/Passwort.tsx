import { useState, type FormEvent } from 'react'
import { MIN_PASSWORD_LENGTH } from '../auth/auth'
import { IS_WORDPRESS, WordPressError, wpPost } from '../backend'
import { Field, SubmitButton } from '../components/AuthForm'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { company } from '../data/content'
import { publicNav } from '../data/landing'
import { href, navigate } from '../routes'

const errorText = (err: unknown) =>
  err instanceof WordPressError ? err.message : 'Das hat nicht geklappt. Bitte versuchen Sie es erneut.'

function Alert({ children }: { children: string }) {
  return (
    <p role="alert" className="m-0 rounded-control bg-coral-100 px-4 py-3 text-[14px] text-coral-600">
      {children}
    </p>
  )
}

/** Step 1: ask for the reset link. */
function RequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
    setBusy(true)
    setError('')
    try {
      await wpPost('password/request', { email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-card bg-green-tint p-6">
        <p className="m-0 text-lg font-bold">Bitte prüfen Sie Ihr Postfach.</p>
        <p className="m-0 mt-2 text-[15px] leading-relaxed text-ink-2">
          Wenn für {email.trim()} ein Mitgliedskonto besteht, haben wir Ihnen einen Link zum Festlegen Ihres Passworts
          geschickt. Der Link ist 24 Stunden gültig. Keine E-Mail erhalten? Sehen Sie bitte auch im Spam-Ordner nach.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field
        id="pw-email"
        label="E-Mail-Adresse"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <Alert>{error}</Alert>}
      <SubmitButton busy={busy}>Link zum Passwort senden</SubmitButton>
    </form>
  )
}

/** Step 2: set the new password from the emailed link. */
function ResetForm({ login, resetKey }: { login: string; resetKey: string }) {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [errors, setErrors] = useState<{ password?: string; password2?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (password.length < MIN_PASSWORD_LENGTH) next.password = `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`
    if (password2 !== password) next.password2 = 'Die Passwörter stimmen nicht überein.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      await wpPost('password/reset', { login, key: resetKey, password })
      navigate('dashboard')
    } catch (err) {
      setErrors({ form: errorText(err) })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field
        id="pw-new"
        label="Neues Passwort"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`}
      />
      <Field
        id="pw-new2"
        label="Passwort wiederholen"
        type="password"
        autoComplete="new-password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        error={errors.password2}
      />
      {errors.form && <Alert>{errors.form}</Alert>}
      <SubmitButton busy={busy}>Passwort speichern und anmelden</SubmitButton>
      {errors.form && (
        <a href={href('password')} className="justify-self-start text-[14px] text-link underline">
          Neuen Link anfordern
        </a>
      )}
    </form>
  )
}

export default function Passwort() {
  const params = new URLSearchParams(location.search)
  const login = params.get('login') ?? ''
  const resetKey = params.get('key') ?? ''
  const resetting = Boolean(login && resetKey)

  return (
    <>
      <Header nav={publicNav} cta={{ label: 'Mitglieder-Login', href: href('login') }} />
      <main className="bg-section px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-[560px]">
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Mitgliederbereich</p>
          <h1 className="m-0 mt-3 font-display text-[clamp(30px,3.4vw,40px)] leading-tight font-normal">
            {resetting ? 'Neues Passwort festlegen' : 'Passwort vergessen?'}
          </h1>
          <p className="m-0 mt-3 text-[17px] leading-relaxed text-ink-2">
            {resetting
              ? 'Wählen Sie ein neues Passwort für Ihr Mitgliederkonto. Danach sind Sie direkt angemeldet.'
              : 'Geben Sie die E-Mail-Adresse Ihres Mitgliederkontos ein. Wir schicken Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.'}
          </p>

          <div className="mt-8 rounded-card border border-line bg-white p-6 sm:p-8">
            {!IS_WORDPRESS ? (
              <p className="m-0 text-[15px] text-ink-2">
                Bitte wenden Sie sich an unseren Mitgliederservice unter {company.phone} oder {company.email}.
              </p>
            ) : resetting ? (
              <ResetForm login={login} resetKey={resetKey} />
            ) : (
              <RequestForm />
            )}
          </div>

          <p className="m-0 mt-6 text-[14px] text-ink-2">
            <a href={href('login')} className="text-link underline">
              Zurück zur Anmeldung
            </a>
            <span className="mx-2 text-muted">·</span>
            Fragen? {company.phone}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
