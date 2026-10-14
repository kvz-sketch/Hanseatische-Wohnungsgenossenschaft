import { company, legalNotice } from '../data/content'
import { Logo } from './ui'

const columns = [
  {
    title: 'Anlegen',
    links: [
      { label: 'Projekte', href: '/projekte/' },
      { label: 'Magazin', href: '#' },
      { label: 'Rendite-Rechner', href: '/#rechner' },
      { label: 'Beitritt nach Gespräch', href: '/#termin' },
    ],
  },
  {
    title: 'Unterlagen',
    links: [
      { label: 'Risikohinweis', href: '#' },
      { label: 'Satzung', href: '#' },
      { label: 'Geprüfter Jahresabschluss auf Anfrage', href: `mailto:${company.email}` },
      { label: `Prüfungsverband: ${company.auditor}`, href: '#' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { label: 'Impressum', href: '#' },
      { label: 'Datenschutz', href: '#' },
    ],
  },
]

const linkClass = 'text-lighter-dark underline underline-offset-2 hover:text-white'

export default function Footer() {
  return (
    <footer className="bg-ink px-5 py-16 text-[14px] leading-relaxed text-lighter-dark">
      <div className="container-site">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="mb-5 h-[58px] w-auto text-white" />
            <p className="m-0 font-bold text-white">{company.name}</p>
            <p className="m-0">{company.street}</p>
            <p className="m-0">{company.city}</p>
            <a href={company.phoneHref} className={linkClass}>
              {company.phone}
            </a>
            <br />
            <a href={`mailto:${company.email}`} className={linkClass}>
              {company.email}
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="m-0 mb-1 font-bold text-white">{col.title}</p>
              <ul className="m-0 list-none p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  </li>
                ))}
                {col.title === 'Rechtliches' && <li>{company.register}</li>}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-[900px] border-t border-white/15 pt-6 text-[12px] leading-relaxed text-muted-dark">
          {legalNotice}
        </p>
      </div>
    </footer>
  )
}
