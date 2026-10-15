// Member authentication.
//
// Two implementations behind the same exports:
// - WordPress (theme build): real WordPress user accounts via the theme's REST
//   endpoints; the logged-in member comes server-rendered in window.HANSEA.
// - Demo (every other build): accounts and the session live in this browser's
//   localStorage. Not shared between devices and not a security boundary; the
//   password is stored as a salted PBKDF2 hash so it never sits in plain text.

import { IS_WORDPRESS, WordPressError, wp, wpPost } from '../backend'

export type Member = {
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

type StoredMember = Member & { salt: string; hash: string }

const USERS_KEY = 'hs-demo-members'
const SESSION_KEY = 'hs-demo-session'

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

function readUsers(): Record<string, StoredMember> {
  try {
    return JSON.parse(store.get(USERS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, StoredMember>) {
  store.set(USERS_KEY, JSON.stringify(users))
}

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

async function hashPassword(password: string, saltHex: string) {
  const salt = new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16)))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' }, key, 256)
  return toHex(bits)
}

const normalise = (email: string) => email.trim().toLowerCase()

export const MIN_PASSWORD_LENGTH = 8

/** Where "Passwort vergessen?" leads, or null when resets go through the member service. */
export const passwordResetUrl = () => (IS_WORDPRESS ? wp().lostPasswordUrl : null)

export async function register(input: { firstName: string; lastName: string; email: string; password: string }) {
  if (IS_WORDPRESS) {
    try {
      const { member } = await wpPost<{ member: Member }>('register', { ...input, consent: true })
      return member
    } catch (err) {
      throw err instanceof WordPressError ? new AuthError(err.message) : err
    }
  }
  const email = normalise(input.email)
  const users = readUsers()
  if (users[email]) throw new AuthError('Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melden Sie sich an.')
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(`Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`)
  }
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const member: StoredMember = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    createdAt: new Date().toISOString(),
    salt,
    hash: await hashPassword(input.password, salt),
  }
  writeUsers({ ...users, [email]: member })
  store.set(SESSION_KEY, email)
  return publicMember(member)
}

export async function login(emailInput: string, password: string) {
  if (IS_WORDPRESS) {
    try {
      const { member } = await wpPost<{ member: Member }>('login', { email: emailInput.trim(), password })
      return member
    } catch (err) {
      throw err instanceof WordPressError ? new AuthError(err.message) : err
    }
  }
  const email = normalise(emailInput)
  const member = readUsers()[email]
  // Same message for unknown email and wrong password
  const fail = new AuthError('E-Mail-Adresse oder Passwort ist nicht korrekt.')
  if (!member) throw fail
  if ((await hashPassword(password, member.salt)) !== member.hash) throw fail
  store.set(SESSION_KEY, email)
  return publicMember(member)
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
  const email = store.get(SESSION_KEY)
  const member = email ? readUsers()[email] : undefined
  return member ? publicMember(member) : null
}

function publicMember({ firstName, lastName, email, createdAt }: StoredMember): Member {
  return { firstName, lastName, email, createdAt }
}
