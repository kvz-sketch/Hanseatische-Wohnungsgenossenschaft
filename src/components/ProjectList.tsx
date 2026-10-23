import { BOOKING_URL, projectsCompleted, projectsForSale, projectsPipeline, type Project } from '../data/content'
import GermanyMap, { MapLegend } from './GermanyMap'
import { StatusBadge } from './ui'

/** A project for sale: opens to photos and facts from the Exposé plus a booking button. */
function ExposeRow({ project: p, number }: { project: Project; number: number }) {
  const expose = p.expose!
  return (
    <li className="border-b border-line-soft last:border-b-0">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 hover:bg-navy-050 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="w-6 shrink-0 text-[13px] font-bold text-gold-700 tabular-nums">
            {String(number).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] leading-snug">
              <strong className="font-bold">{p.street}</strong>
              <span className="text-muted"> · {p.city}</span>
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">{p.note}</span>
            <span className="mt-1 block text-[13px] font-bold text-ink sm:hidden">{expose.sold} % verkauft</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="hidden w-[150px] sm:block">
              <span className="flex justify-between text-[12px]">
                <span className="text-muted">verkauft</span>
                <strong className="font-bold text-ink tabular-nums">{expose.sold} %</strong>
              </span>
              <span
                className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuenow={expose.sold}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.street}: ${expose.sold} % verkauft`}
              >
                <span className="block h-full rounded-full bg-gold" style={{ width: `${expose.sold}%` }} />
              </span>
            </span>
            <StatusBadge status={p.status} />
            <span
              aria-hidden="true"
              className="text-[20px] leading-none text-ink transition-transform group-open:rotate-45"
            >
              +
            </span>
          </span>
        </summary>

        <div className="grid grid-cols-1 gap-6 px-4 pb-6 sm:px-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:pl-[64px]">
          <div className="grid grid-cols-2 gap-2">
            {expose.images.length
              ? expose.images.map((img, k) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className={`w-full rounded-control object-cover ${k === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}
                  />
                ))
              : [0, 1, 2].map((k) => (
                  <span
                    key={k}
                    className={`stripe-light rounded-control ${k === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}
                  >
                    Foto aus dem Exposé
                  </span>
                ))}
          </div>
          <div>
            <p className="m-0 mb-4 text-[15px] leading-relaxed text-ink-2">{expose.summary}</p>
            <dl className="m-0">
              {expose.facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[40%_1fr] gap-3 border-t border-line-soft py-2.5 last:border-b">
                  <dt className="text-[13px] text-muted">{k}</dt>
                  <dd className="m-0 text-[14px] font-bold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-card bg-gold-100 p-4">
              <p className="m-0 text-[15px] font-bold text-ink">Interesse zum Kauf?</p>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-block rounded-control bg-gold px-4 py-2.5 text-[14px] font-semibold text-ink no-underline hover:bg-gold-600"
              >
                Gerne hier einen Termin machen
              </a>
            </div>
          </div>
        </div>
      </details>
    </li>
  )
}

function ProjectGroup({ title, projects, offset }: { title: string; projects: Project[]; offset?: number }) {
  return (
    <section aria-label={title} className="mt-8 first:mt-0">
      <h3 className="m-0 mb-3 text-[13px] font-semibold tracking-[0.18em] uppercase">
        {title} <span className="ml-1.5 font-semibold text-muted">{projects.length}</span>
      </h3>
      <ul className="m-0 list-none overflow-hidden rounded-card border border-line bg-white p-0">
        {projects.map((p, i) =>
          p.expose ? (
            <ExposeRow key={`${p.city}-${p.street ?? i}`} project={p} number={(offset ?? 0) + i + 1} />
          ) : (
            <li
              key={`${p.city}-${p.street ?? i}`}
              className="flex items-center gap-4 border-b border-line-soft px-4 py-4 last:border-b-0 sm:px-5"
            >
              <span className="w-6 shrink-0 text-[13px] font-bold text-gold-700 tabular-nums">
                {offset !== undefined ? String(offset + i + 1).padStart(2, '0') : '·'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] leading-snug">
                  {p.street ? (
                    <>
                      <strong className="font-bold">{p.street}</strong>
                      <span className="text-muted"> · {p.city}</span>
                    </>
                  ) : (
                    <strong className="font-bold">{p.city}</strong>
                  )}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted">{p.note}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {p.date && <span className="hidden text-[13px] text-muted sm:inline">{p.date}</span>}
                <StatusBadge status={p.status} />
              </span>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}

/** All houses of the group: map, key figures and the lists by status. */
export default function ProjectList() {
  const allHouses = projectsForSale.length + projectsCompleted.length
  const stats = [
    { value: String(projectsCompleted.length), label: 'abgeschlossen' },
    { value: String(projectsForSale.length), label: 'im Verkauf' },
    { value: String(projectsPipeline.length), label: 'im Ankauf' },
    { value: '13.269', label: 'm² Wohnfläche' },
  ]

  return (
    <section id="projekte" className="section bg-section">
      <div className="container-site">
        <p className="m-0 text-[13px] text-muted">Gerlach Immobilien Gruppe · Stand April 2026</p>
        <h2 className="h2 mt-3">{allHouses} Häuser, jedes mit eigener Seite.</h2>
        <p className="m-0 mt-3 max-w-[740px] text-[17px] leading-relaxed text-ink-2">
          Alles, was die Gerlach Immobilien Gruppe seit 2025 gekauft, saniert und verkauft hat, dazu die Objekte im
          Verkauf und im Ankauf.
        </p>

        <div className="mt-10 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-card bg-navy-gradient p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16 lg:p-14">
          <div>
            <p className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight">
              Vom Norden bis nach Nordrhein-Westfalen
            </p>
            <dl className="m-0 mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-white/10">
              {stats.map((s) => (
                <div key={s.label} className="bg-ink-panel p-5">
                  <dt className="font-display text-[34px] leading-none font-normal tabular-nums">{s.value}</dt>
                  <dd className="m-0 mt-2 text-[13px] text-navy-200">{s.label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <MapLegend onDark />
            </div>
          </div>
          <GermanyMap variant="navy" className="mx-auto block w-full max-w-[560px]" />
        </div>

        <div className="mt-12">
          <ProjectGroup title="Im Verkauf" projects={projectsForSale} offset={0} />
          <ProjectGroup title="Abgeschlossen" projects={projectsCompleted} offset={projectsForSale.length} />
          <ProjectGroup title="Im Ankauf" projects={projectsPipeline} />
          <p className="m-0 mt-4 text-[13px] text-muted">
            Berlin und die neuen Bundesländer werden geprüft. Stand April 2026.
          </p>
        </div>
      </div>
    </section>
  )
}
