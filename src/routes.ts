// Page URLs and navigation in one place. The normal build uses real paths;
// the single-file preview (VITE_PREVIEW=1) swaps pages in memory instead.

export type Page = 'home' | 'login' | 'dashboard'

export const IS_PREVIEW = import.meta.env.VITE_PREVIEW === '1'

const paths: Record<Page, string> = IS_PREVIEW
  ? { home: '?p=home', login: '?p=login', dashboard: '?p=dashboard' }
  : { home: '/', login: '/login/', dashboard: '/mitglieder/' }

/** URL of a page, optionally with an in-page anchor like "#kontakt". */
export const href = (page: Page, hash = '') => paths[page] + hash

type Navigator = (page: Page, hash: string) => void
let previewNavigator: Navigator | null = null

export function setPreviewNavigator(fn: Navigator) {
  previewNavigator = fn
}

export function navigate(page: Page, { hash = '', replace = false } = {}) {
  if (previewNavigator) return previewNavigator(page, hash)
  if (replace) location.replace(href(page, hash))
  else location.assign(href(page, hash))
}
