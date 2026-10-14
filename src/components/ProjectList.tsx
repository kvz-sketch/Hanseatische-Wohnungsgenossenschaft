import { projectsCompleted, projectsForSale, projectsPipeline, type Project } from '../data/content'
import GermanyMap, { MapLegend } from './GermanyMap'
import { StatusBadge } from './ui'

function ProjectGroup({ title, projects, offset }: { title: string; projects: Project[]; offset?: number }) {
  return (
    <section aria-label={title} className="mt-8 first:mt-0">
      <h3 className="m-0 mb-3 text-[13px] font-bold tracking-[0.08em] uppercase">
        {title} <span className="ml-1.5 font-semibold text-muted">{projects.length}</span>
      </h3>
      <ul className="m-0 list-none overflow-hidden rounded-card border border-line bg-white p-0">
        {projects.map((p, i) => (
          <li
            key={`${p.city}-${p.street ?? i}`}
            className="flex items-center gap-4 border-b border-line-soft px-4 py-4 last:border-b-0 sm:px-5"
          >
            <span className="w-6 shrink-0 text-[13px] font-bold text-brick tabular-nums">
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
        ))}
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
          Alles, was die Gerlach Immobilien Gruppe seit 2025 gekauft, saniert und verkauft hat, dazu die Objekte im Verkauf
          und im Ankauf.
        </p>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-card border border-line bg-white p-6">
              <GermanyMap className="mx-auto block w-full max-w-[300px]" />
              <div className="mt-4">
                <MapLegend />
              </div>
            </div>
            <dl className="m-0 mt-3 grid grid-cols-2 overflow-hidden rounded-card border border-line bg-white">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`p-5 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i > 1 ? 'border-t border-line' : ''}`}
                >
                  <dt className="text-[28px] leading-none font-extrabold tracking-tight tabular-nums">{s.value}</dt>
                  <dd className="m-0 mt-2 text-[13px] text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div>
            <ProjectGroup title="Im Verkauf" projects={projectsForSale} offset={0} />
            <ProjectGroup title="Abgeschlossen" projects={projectsCompleted} offset={projectsForSale.length} />
            <ProjectGroup title="Im Ankauf" projects={projectsPipeline} />
            <p className="m-0 mt-4 text-[13px] text-muted">
              Aus dem Norden nach Nordrhein-Westfalen; Berlin und die neuen Bundesländer werden geprüft. Stand April 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
