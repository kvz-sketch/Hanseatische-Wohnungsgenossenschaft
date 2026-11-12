/** Immo Affiliate Network: the referral programme of the Gerlach Group. */
export const REFERRAL_URL = 'https://immoaffiliate.de/'

const STEPS = [
  ['PIN sichern', 'Sie registrieren sich und erhalten Ihre persönliche PIN. Jede Empfehlung ist damit eindeutig Ihnen zugeordnet.'],
  ['Empfehlen', 'Sie teilen Ihren Link mit Interessierten. Beratung, Betreuung und Abschluss übernimmt unser Team.'],
  ['Vergütung erhalten', 'Ihre Empfehlungen werden über Ihre PIN erfasst und nach den Bedingungen des Partnerprogramms vergütet.'],
]

/** "Empfehlungsprogramm" in the members' area, linking to immoaffiliate.de. */
export default function MemberReferral() {
  return (
    <section id="empfehlen" className="section scroll-mt-20 bg-section">
      <div className="container-site grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Empfehlungsprogramm</p>
          <h2 className="h2 mt-3">Empfehlen Sie uns weiter</h2>
          <p className="m-0 mt-4 max-w-[520px] text-[17px] leading-relaxed text-ink-2">
            Sie kennen Menschen, die sich für Immobilien als Kapitalanlage interessieren? Über das Immo Affiliate Network empfehlen Sie die Hanseatische Invest eG
            weiter. Sie stellen nur den Kontakt her, alles Weitere übernehmen wir.
          </p>
          <a
            href={REFERRAL_URL}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex h-12 items-center rounded-control bg-gold px-6 text-[16px] font-semibold text-ink no-underline hover:bg-gold-400"
          >
            Jetzt Partner werden
          </a>
          <p className="m-0 mt-3 text-[13px] text-muted">Weiter zu immoaffiliate.de, dort finden Sie Ablauf und Bedingungen.</p>
        </div>
        <ol className="m-0 grid list-none gap-3 p-0">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-4 rounded-card border border-line bg-white p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-bold text-white tabular-nums">{i + 1}</span>
              <span>
                <span className="block text-[16px] font-bold text-ink">{title}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
