import { useState } from 'react'
import { nav } from '../data/content'
import { ButtonLink, Logo } from './ui'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="container-site flex h-[72px] items-center gap-8 px-5">
        <a href="/" className="shrink-0 text-white hover:text-white" aria-label="Hanseatische Invest eG – Startseite">
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
          <a href="#" className="text-[15px] text-light-dark no-underline hover:text-white">
            Mitglieder-Login
          </a>
          <ButtonLink href="/#termin" className="px-4 py-2.5">
            Mein Erstgespräch buchen
          </ButtonLink>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-control border border-white/20 lg:hidden"
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
            <li>
              <a href="#" className="block py-3.5 text-base text-light-dark no-underline">
                Mitglieder-Login
              </a>
            </li>
          </ul>
          <ButtonLink href="/#termin" className="mt-2 w-full">
            Mein Erstgespräch buchen
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}
