import borgfelder from '../../assets/media/projekt-hamburg-borgfelder.jpg'
import { aboutStats, glanceBullets } from '../../data/landing'
import { ButtonLink, Eyebrow, Placeholder } from '../ui'

export function LandingHero() {
  return (
    <section id="top" className="bg-navy-gradient px-5 py-16 text-white lg:py-24">
      <div className="container-site grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="m-0 text-[clamp(40px,5.2vw,62px)] leading-[1.04] font-display font-normal text-balance">
            Investieren in reale Wohnimmobilien
          </h1>
          <p className="m-0 mt-5 text-[clamp(18px,1.8vw,22px)] font-semibold text-lighter-dark">
            Unternehmerisch. Transparent. Nachvollziehbar.
          </p>
          <ButtonLink href="#kontakt" className="mt-8 px-7 py-4 text-[16px]">
            Jetzt informieren
          </ButtonLink>
        </div>
        <img
          src={borgfelder}
          alt="Saniertes Mehrfamilienhaus in der Borgfelder Straße, Hamburg"
          width={800}
          height={600}
          className="block aspect-[4/3] w-full rounded-card object-cover"
        />
      </div>
    </section>
  )
}

export function AboutWithStats() {
  return (
    <section id="ueber-uns" className="section">
      <div className="container-site">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="max-w-[760px]">
            <Eyebrow>Über uns</Eyebrow>
            <h2 className="h2">Die Hanseatische Invest eG</h2>
            <p className="m-0 mt-5 text-[17px] leading-relaxed text-ink-2">
              Die Hanseatische Invest eG verwendet Ihr investiertes Kapital, um Immobilienprojekte effizient umzusetzen und
              nachhaltige Mehrwerte zu schaffen – für unsere Mitglieder und den deutschen Immobilienmarkt. Als
              Genossenschaft stehen wir für Transparenz, Verantwortung und eine partnerschaftliche Beteiligung an
              Immobilieninvestments. Werden Sie Teil der Hanseatischen Invest eG und profitieren Sie von einer attraktiven
              Rendite von bis zu 7&nbsp;% p.a. – jetzt informieren und investieren.
            </p>
          </div>
          <ButtonLink href="#kontakt" className="self-end">
            Kontakt aufnehmen
          </ButtonLink>
        </div>

        <dl className="m-0 mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
          {aboutStats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-7 text-center">
              <dt className="text-[clamp(32px,3.4vw,44px)] leading-none font-display font-normal">{s.value}</dt>
              <dd className="m-0 mt-2 text-[14px] text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function AtAGlance() {
  return (
    <section className="px-5 pb-[72px]">
      <div className="container-site grid grid-cols-1 gap-10 rounded-card bg-navy-gradient px-6 py-10 text-white sm:px-12 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow onDark>Auf einen Blick</Eyebrow>
          <p className="m-0 text-[clamp(22px,2.2vw,28px)] leading-snug font-display font-normal">
            Kurz zusammengefasst: So funktioniert Ihre Beteiligung bei der Hanseatischen Invest eG.
          </p>
          <p className="m-0 mt-5 text-[16px] leading-relaxed text-lighter-dark">
            Die Hanseatische Invest eG bietet eine genossenschaftliche Beteiligung statt einer klassischen Geldanlage: Sie
            investieren gemeinsam mit anderen Mitgliedern in reale Wohnimmobilien und nehmen unternehmerisch an Chancen und
            Risiken teil. Die Mindestlaufzeit beträgt 12 Monate, mit einer angestrebten Verzinsung von 7&nbsp;% p.a.*
          </p>
        </div>
        <div>
          <ul className="m-0 list-none space-y-3 p-0">
            {glanceBullets.map((b) => (
              <li key={b} className="flex items-center gap-3 rounded-control bg-white/5 px-4 py-3 text-[16px] font-semibold">
                <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
          <p className="m-0 mt-5 text-[12px] leading-relaxed text-muted-dark">
            * Die Verzinsung ist aus rechtlichen Gründen nicht garantiert und abhängig vom wirtschaftlichen Erfolg der
            Genossenschaft.
          </p>
        </div>
      </div>
    </section>
  )
}

export function BookBanner() {
  return (
    <section className="px-5 pb-[72px]">
      <div className="container-site grid grid-cols-1 items-center gap-10 rounded-card border border-cream-line bg-cream px-6 py-10 sm:px-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <Placeholder label="Buchcover „Dein Weg zur finanziellen Freiheit“" className="mx-auto aspect-[2/3] w-full max-w-[220px]" />
        <div>
          <Eyebrow>Neues Buch</Eyebrow>
          <h2 className="h2">Dein Weg zur finanziellen Freiheit</h2>
          <p className="m-0 mt-4 max-w-[640px] text-[17px] leading-relaxed text-ink-2">
            Das neue Buch von Stephan Gerlach, des Spiegel-Bestsellerautors und CEO der Gerlach Immobilien Gruppe, ist Ihr
            Leitfaden für Immobilien als Kapitalanlage. Nutzen Sie sein Expertenwissen, um fundierte Entscheidungen zu
            treffen und gezielt für Ihre finanzielle Freiheit und eine sichere Zukunft vorzusorgen.
          </p>
          <ButtonLink href="#" className="mt-6">
            Zum Buchkauf
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
