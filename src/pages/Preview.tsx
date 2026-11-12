// In-memory page switcher for the single-file preview (see src/preview.tsx).
import { useEffect, useState } from 'react'
import { setPreviewNavigator, type Page } from '../routes'
import Dashboard from './Dashboard'
import Landing from './Landing'
import Login from './Login'
import Passwort from './Passwort'

const pages = { home: Landing, login: Login, dashboard: Dashboard, password: Passwort }

function setHash(hash: string) {
  try {
    history.replaceState(null, '', hash || location.pathname + location.search)
  } catch {
    // ignore in sandboxed documents
  }
}

export default function Preview() {
  const [state, setState] = useState<{ page: Page; hash: string }>({ page: 'home', hash: '' })

  useEffect(() => {
    setPreviewNavigator((page, hash) => {
      setHash(hash)
      setState({ page, hash })
    })
    // Links to other pages look like "?p=home#kontakt"
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a')
      const link = a?.getAttribute('href')
      if (!link?.startsWith('?p=')) return
      e.preventDefault()
      const [query, hash = ''] = link.split('#')
      const page = query.slice(3) as Page
      setHash(hash ? `#${hash}` : '')
      setState({ page, hash: hash ? `#${hash}` : '' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Scroll to the anchor (or top) after switching
  useEffect(() => {
    const el = state.hash ? document.getElementById(state.hash.slice(1)) : null
    if (el) el.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [state])

  const Current = pages[state.page]
  return <Current key={state.page} />
}
