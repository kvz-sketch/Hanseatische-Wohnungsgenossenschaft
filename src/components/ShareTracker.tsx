import { nextPayout, portfolioProjects, type PortfolioProject } from '../data/content'

const phaseTone: Record<PortfolioProject['phase'], string> = {
  Ankauf: 'bg-gold-100 text-gold-700',
  Modernisierung: 'bg-gold-100 text-gold-700',
  Vermietung: 'bg-gold-100 text-gold-700',
  Verkauf: 'bg-green-tint text-green',
  Abgeschlossen: 'bg-green-tint text-green',
}

/** Progress report on the projects the Genossenschaft invests the members' money in. */
export default function ShareTracker() {
  return (
    <section id="verfolgen" className="section">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <p className="m-0 mb-3 text-[13px] font-bold text-gold-700">Projekte</p>
            <h2 className="h2">Hier arbeitet Ihr Geld</h2>
            <p className="m-0 mt-3 text-[17px] leading-relaxed text-ink-2">
              Ihre Einlage fließt in die Genossenschaft und von dort in alle laufenden Projekte. So weit sind sie.
            </p>
          </div>
          <div className="rounded-card bg-section px-5 py-4">
            <p className="m-0 text-[13px] text-muted">Nächste Ausschüttung</p>
            <p className="m-0 mt-1 text-[18px] font-semibold">{nextPayout.date}</p>
            <p className="m-0 text-[13px] font-bold text-green">{nextPayout.perShare}</p>
          </div>
        </div>

        <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-4 p-0">
          {portfolioProjects.map((p) => (
            <li
              key={p.city + p.name}
              className="grid grid-cols-1 overflow-hidden rounded-card border border-line bg-white sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)]"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={`${p.name}, ${p.city}`}
                  loading="lazy"
                  className="aspect-[16/10] h-full w-full object-cover"
                />
              ) : (
                <span className="stripe-light aspect-[16/10] h-full w-full" aria-label={`Foto ${p.name} folgt`}>
                  Foto folgt
                </span>
              )}

              <div className="flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-[13px] text-muted">{p.city}</p>
                    <p className="m-0 text-[22px] leading-tight font-semibold">{p.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${phaseTone[p.phase]}`}>
                    {p.phase}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-[13px] text-muted">Fortschritt</span>
                  <span className="font-display text-[32px] leading-none tabular-nums">{p.progress} %</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-valuenow={p.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Fortschritt ${p.name}`}
                >
                  <div className="h-full rounded-full bg-gold" style={{ width: `${p.progress}%` }} />
                </div>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="m-0 text-[14px] leading-snug text-ink-2">{p.status}</p>
                  <p className="m-0 text-[12px] text-muted">Stand {p.updated}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
