// Member authentication.
//
// Two implementations behind the same exports:
// - WordPress (theme build): real WordPress user accounts via the theme's REST
//   endpoints; the logged-in member comes server-rendered in window.HANSEA.
// - Demo (every other build): one sample account (DEMO_LOGIN) and the session
//   in this browser's localStorage. Not a security boundary.
//
// There is no self-registration: the team creates member accounts in wp-admin
// and the member gets a welcome email to set their password (inc/welcome.php).

import { IS_WORDPRESS, WordPressError, wp, wpPost } from '../backend'

/** The member's own figures from the Mitgliederliste (inc/crm.php → hansea_crm_portfolio). */
export type Portfolio = {
  nr: number | null
  since: string
  anteile: number
  einlage: number
  zinsenJahr: number
  /** Next interest payment (target, 7 % p.a.), or null when nothing is due. */
  next: { date: string; amount: number } | null
  zeichnungen: { anteile: number | null; betrag: number | null; zahlung: string }[]
  /** Interest paid out so far (gross) and the single payments. */
  ausgezahlt: number
  zinszahlungen: { datum: string; zeitraum: string; betrag: number | null; steuer: number | null }[]
  /** Cancellations not yet paid out. */
  kuendigungen: { anteile: number | null; zum: string }[]
}

export type Member = {
  firstName: string
  lastName: string
  email: string
  createdAt: string
  /** null until the account is linked to the member's record in the Mitgliederliste. */
  portfolio?: Portfolio | null
  /** May open the Mitgliederliste (staff). */
  crm?: boolean
}

const SESSION_KEY = 'hs-demo-session'

/** Sample account of the demo and preview builds (shown on their login page). */
export const DEMO_LOGIN = { email: 'demo@hanseainvest.de', password: 'vorschau2026' }
const demoMember: Member = { firstName: 'Maria', lastName: 'Muster', email: DEMO_LOGIN.email, createdAt: '2026-04-01T09:00:00Z' }

export class AuthError extends Error {}

// localStorage can be missing or blocked (private mode, sandboxed previews);
// fall back to memory so the flow still works for the current visit.
const memory = new Map<string, string>()
const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return memory.get(key) ?? null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      memory.set(key, value)
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      memory.delete(key)
    }
  },
}

export const MIN_PASSWORD_LENGTH = 8

/** Where "Passwort vergessen?" leads, or null when resets go through the member service. */
export const passwordResetUrl = () => (IS_WORDPRESS ? wp().lostPasswordUrl : null)

export async function login(emailInput: string, password: string) {
  if (IS_WORDPRESS) {
    try {
      const { member } = await wpPost<{ member: Member }>('login', { email: emailInput.trim(), password })
      return member
    } catch (err) {
      throw err instanceof WordPressError ? new AuthError(err.message) : err
    }
  }
  if (emailInput.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
    throw new AuthError('E-Mail-Adresse oder Passwort ist nicht korrekt.')
  }
  store.set(SESSION_KEY, DEMO_LOGIN.email)
  return demoMember
}

export async function logout() {
  if (IS_WORDPRESS) {
    await wpPost('logout', {}).catch(() => undefined)
    return
  }
  store.remove(SESSION_KEY)
}

export function currentMember(): Member | null {
  if (IS_WORDPRESS) return wp().member
  return store.get(SESSION_KEY) === DEMO_LOGIN.email ? demoMember : null
}
