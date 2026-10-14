// Member authentication.
//
// DEMO ONLY: accounts and the session live in this browser's localStorage, so
// they are not shared between devices and are not a security boundary. The
// password is stored as a salted PBKDF2 hash so it never sits in plain text,
// but anyone with access to the browser can still read the dashboard data.
//
// When the site moves to WordPress, replace these functions with calls to
// WordPress user accounts (registration + login handled by WordPress, the
// dashboard reading the logged-in user via the REST API with a nonce). The
// pages only use the exports below, so nothing else needs to change.

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

export async function register(input: { firstName: string; lastName: string; email: string; password: string }) {
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
  const email = normalise(emailInput)
  const member = readUsers()[email]
  // Same message for unknown email and wrong password
  const fail = new AuthError('E-Mail-Adresse oder Passwort ist nicht korrekt.')
  if (!member) throw fail
  if ((await hashPassword(password, member.salt)) !== member.hash) throw fail
  store.set(SESSION_KEY, email)
  return publicMember(member)
}

export function logout() {
  store.remove(SESSION_KEY)
}

export function currentMember(): Member | null {
  const email = store.get(SESSION_KEY)
  const member = email ? readUsers()[email] : undefined
  return member ? publicMember(member) : null
}

function publicMember({ firstName, lastName, email, createdAt }: StoredMember): Member {
  return { firstName, lastName, email, createdAt }
}
