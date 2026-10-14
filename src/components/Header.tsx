import { useState, type ReactNode } from 'react'
import { ButtonLink, Logo } from './ui'

type NavItem = { label: string; href: string }

/**
 * Sticky navy header. `aside` sits right of the nav on desktop and below the
 * links in the mobile menu (e.g. login link, user name, logout).
 */
export default function Header({
  nav,
  aside,
  cta,
  homeHref = '/',
}: {
  nav: NavItem[]
  aside?: ReactNode
  cta?: NavItem
  homeHref?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="container-site flex h-[72px] items-center gap-8 px-5">
        <a href={homeHref} className="shrink-0 text-white hover:text-white" aria-label="Hanseatische Invest eG – Startseite">
          <Logo className="h-[50px] w-auto" />
        </a>

        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <a key={item.label} href={item.href} className="text-[15px] font-medium text-white no-underline hover:text-lighter-dark">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          {aside}
          {cta && (
            <ButtonLink href={cta.href} className="px-4 py-2.5">
              {cta.label}
            </ButtonLink>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-control border border-white/20 bg-transparent text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-white/10 px-5 pb-6 pt-2 lg:hidden" aria-label="Hauptnavigation">
          <ul className="m-0 list-none p-0">
            {nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-3.5 text-base font-medium text-white no-underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {aside && <div className="flex flex-wrap items-center gap-4 py-4">{aside}</div>}
          {cta && (
            <ButtonLink href={cta.href} className="w-full">
              {cta.label}
            </ButtonLink>
          )}
        </nav>
      )}
    </header>
  )
}

export function LoginLink() {
  return (
    <a href="/login/" className="text-[15px] text-light-dark no-underline hover:text-white">
      Mitglieder-Login
    </a>
  )
}
