// Which backend the pages talk to. The WordPress theme build sets
// VITE_BACKEND=wordpress; every other build uses the browser-only demo.

import type { Member } from './auth/auth'

export const IS_WORDPRESS = import.meta.env.VITE_BACKEND === 'wordpress'

/** Server-rendered by the theme (inc/views.php → hansea_app_config). */
type WordPressConfig = {
  restUrl: string
  nonce: string
  member: Member | null
  lostPasswordUrl: string
}

declare global {
  interface Window {
    HANSEA?: WordPressConfig
  }
}

export const wp = (): WordPressConfig => {
  if (!window.HANSEA) throw new Error('window.HANSEA missing: page not rendered by the Hansea Invest theme')
  return window.HANSEA
}

/** POST to the theme's REST API; throws with the server's message on failure. */
export async function wpPost<T>(route: string, body: unknown): Promise<T> {
  const { restUrl, nonce } = wp()
  const res = await fetch(`${restUrl}hansea/v1/${route}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new WordPressError(data?.message ?? 'Das hat nicht geklappt. Bitte versuchen Sie es erneut.', res.status)
  return data as T
}

export class WordPressError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
