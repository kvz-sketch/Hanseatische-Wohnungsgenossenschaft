import { useState, type ChangeEvent, type FormEvent } from 'react'
import { AuthError, login, MIN_PASSWORD_LENGTH, passwordResetUrl, register } from '../auth/auth'
import { IS_WORDPRESS } from '../backend'
import { Field, SubmitButton } from '../components/AuthForm'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { ConsentCheckbox } from '../components/ui'
import { company } from '../data/content'
import { publicNav } from '../data/landing'
import { href, navigate } from '../routes'

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const resetUrl = passwordResetUrl()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return setError('Bitte geben Sie E-Mail-Adresse und Passwort ein.')
    setBusy(true)
    try {
      await login(email, password)
      onDone()
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Die Anmeldung hat nicht geklappt. Bitte versuchen Sie es erneut.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="login-email" label="E-Mail-Adresse" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field
        id="login-password"
        label="Passwort"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="m-0 rounded-control bg-coral-100 px-4 py-3 text-[14px] text-coral-600">
          {error}
        </p>
      )}
      <SubmitButton busy={busy}>Anmelden</SubmitButton>
      {resetUrl ? (
        <a href={resetUrl} className="justify-self-start text-[14px] text-link underline">
          Passwort vergessen?
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setForgot((f) => !f)}
          className="cursor-pointer justify-self-start border-0 bg-transparent p-0 text-[14px] text-link underline"
        >
          Passwort vergessen?
        </button>
      )}
      {forgot && (
        <p className="m-0 text-[14px] text-ink-2">
          Bitte wenden Sie sich an unseren Mitgliederservice unter{' '}
          <a href={company.phoneHref}>{company.phone}</a> oder <a href={`mailto:${company.email}`}>{company.email}</a>.
          Wir setzen Ihr Passwort zurück.
        </p>
      )}
    </form>
  )
}

type RegisterErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'password' | 'password2' | 'consent' | 'form', string>>

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState({ firstName: '', lastName: '', email: '', password: '', password2: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof v) => (e: ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: RegisterErrors = {}
    if (!v.firstName.trim()) next.firstName = 'Bitte geben Sie Ihren Vornamen ein.'
    if (!v.lastName.trim()) next.lastName = 'Bitte geben Sie Ihren Nachnamen ein.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) next.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
    if (v.password.length < MIN_PASSWORD_LENGTH) next.password = `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`
    if (v.password2 !== v.password) next.password2 = 'Die Passwörter stimmen nicht überein.'
    if (!consent) next.consent = 'Bitte bestätigen Sie die Datenschutzhinweise.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      await register(v)
      onDone()
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : 'Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field id="reg-first" label="Vorname" autoComplete="given-name" value={v.firstName} onChange={set('firstName')} error={errors.firstName} />
      <Field id="reg-last" label="Nachname" autoComplete="family-name" value={v.lastName} onChange={set('lastName')} error={errors.lastName} />
      <div className="sm:col-span-2">
        <Field id="reg-email" label="E-Mail-Adresse" type="email" autoComplete="email" value={v.email} onChange={set('email')} error={errors.email} />
      </div>
      <Field
        id="reg-password"
        label="Passwort"
        type="password"
        autoComplete="new-password"
        value={v.password}
        onChange={set('password')}
        error={errors.password}
        hint={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`}
      />
      <Field
        id="reg-password2"
        label="Passwort wiederholen"
        type="password"
        autoComplete="new-password"
        value={v.password2}
        onChange={set('password2')}
        error={errors.password2}
      />
      <div className="sm:col-span-2">
        <ConsentCheckbox checked={consent} onChange={setConsent} error={!!errors.consent}>
          Ich habe die <a href="#">Datenschutzhinweise</a> gelesen und bin einverstanden, dass die Hanseatische Invest eG
          meine Angaben für mein Mitgliederkonto speichert.
        </ConsentCheckbox>
        {errors.consent && <p className="m-0 mt-2 text-[13px] text-coral-600">{errors.consent}</p>}
      </div>
      {errors.form && (
        <p role="alert" className="m-0 rounded-control bg-coral-100 px-4 py-3 text-[14px] text-coral-600 sm:col-span-2">
          {errors.form}
        </p>
      )}
      <div className="sm:col-span-2">
        <SubmitButton busy={busy}>Konto erstellen</SubmitButton>
      </div>
    </form>
  )
}

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>(() => (location.hash === '#registrieren' ? 'register' : 'login'))

  const goToDashboard = () => navigate('dashboard')

  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => {
        setMode(m)
        try {
          history.replaceState(null, '', m === 'register' ? '#registrieren' : location.pathname + location.search)
        } catch {
          // not available in sandboxed previews
        }
      }}
      className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent px-2 py-4 text-[16px] font-bold transition-colors ${
        mode === m ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      <Header nav={publicNav} cta={{ label: 'Jetzt informieren', href: href('home', '#kontakt') }} />
      <main className="bg-section px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-[560px]">
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Mitgliederbereich</p>
          <h1 className="m-0 mt-3 text-[clamp(30px,3.4vw,40px)] leading-tight font-display font-normal">
            {mode === 'login' ? 'Willkommen zurück' : 'Ihr Mitgliederkonto erstellen'}
          </h1>
          <p className="m-0 mt-3 text-[17px] leading-relaxed text-ink-2">
            {mode === 'login'
              ? 'Melden Sie sich an, um Ihre Anteile, Projekte und Ausschüttungen zu sehen.'
              : 'Beim ersten Besuch legen Sie einmalig Ihr Konto mit E-Mail-Adresse und Passwort an.'}
          </p>

          <div className="mt-8 rounded-card border border-line bg-white">
            <div role="tablist" aria-label="Anmelden oder registrieren" className="flex border-b border-line px-4">
              {tab('login', 'Anmelden')}
              {tab('register', 'Erstmals hier? Konto erstellen')}
            </div>
            <div className="p-6 sm:p-8">
              {mode === 'login' ? <LoginForm onDone={goToDashboard} /> : <RegisterForm onDone={goToDashboard} />}
            </div>
          </div>

          {!IS_WORDPRESS && (
            <p className="m-0 mt-6 rounded-control border border-gold-400/50 bg-gold-100 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
              <strong>Vorschau-Version:</strong> Konten werden vorerst nur in diesem Browser gespeichert. Bitte verwenden Sie
              keine echten Passwörter.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
