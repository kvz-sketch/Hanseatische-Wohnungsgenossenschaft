import { useState, type FormEvent } from 'react'
import { AuthError, DEMO_LOGIN, login, passwordResetUrl } from '../auth/auth'
import { IS_WORDPRESS } from '../backend'
import { Field, SubmitButton } from '../components/AuthForm'
import Footer from '../components/Footer'
import Header from '../components/Header'
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
          <a href={`mailto:${company.email}`}>{company.email}</a>.
          Wir setzen Ihr Passwort zurück.
        </p>
      )}
    </form>
  )
}

export default function Login() {
  return (
    <>
      <Header nav={publicNav} cta={{ label: 'Jetzt informieren', href: href('home', '#kontakt') }} />
      <main className="bg-section px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-[560px]">
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Mitgliederbereich</p>
          <h1 className="m-0 mt-3 text-[clamp(30px,3.4vw,40px)] leading-tight font-display font-normal">Willkommen zurück</h1>
          <p className="m-0 mt-3 text-[17px] leading-relaxed text-ink-2">
            Melden Sie sich an, um Ihre Anteile, Projekte und Ausschüttungen zu sehen.
          </p>

          <div className="mt-8 rounded-card border border-line bg-white p-6 sm:p-8">
            <LoginForm onDone={() => navigate('dashboard')} />
          </div>

          <div className="mt-6 rounded-card border border-line bg-white px-6 py-5 text-[15px] leading-relaxed text-ink-2">
            <p className="m-0 font-bold text-ink">Noch keine Zugangsdaten?</p>
            <p className="m-0 mt-1">
              Ihren Zugang zum Mitgliederbereich richten wir persönlich für Sie ein. Sie erhalten Ihre Zugangsdaten mit
              unserer Willkommens-E-Mail. Interesse an einer Mitgliedschaft?{' '}
              <a href={href('home', '#kontakt')} className="text-link underline">
                Sprechen Sie mit uns
              </a>{' '}
              oder schreiben Sie uns: <a href={`mailto:${company.email}`}>{company.email}</a>.
            </p>
          </div>

          {!IS_WORDPRESS && (
            <p className="m-0 mt-6 rounded-control border border-gold-400/50 bg-gold-100 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
              <strong>Vorschau-Version:</strong> Melden Sie sich mit dem Beispielkonto an: {DEMO_LOGIN.email} · Passwort{' '}
              {DEMO_LOGIN.password}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
