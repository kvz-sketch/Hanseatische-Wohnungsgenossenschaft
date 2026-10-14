import Footer from '../components/Footer'
import GermanyMap, { MapLegend } from '../components/GermanyMap'
import Header from '../components/Header'
import { AccessForm } from '../components/LeadForms'
import { Arrow, LockIcon, StatusBadge } from '../components/ui'
import { projectsCompleted, projectsForSale, projectsPipeline, type Project } from '../data/content'

const allHouses = projectsForSale.length + projectsCompleted.length

function ProjectGroup({ title, projects, offset }: { title: string; projects: Project[]; offset?: number }) {
  const numbered = offset !== undefined
  return (
    <section aria-label={title} className="mt-8 first:mt-0">
      <h2 className="m-0 mb-3 text-[13px] font-bold tracking-[0.08em] uppercase">
        {title} <span className="ml-1.5 font-semibold text-muted">{projects.length}</span>
      </h2>
      <ul className="m-0 list-none overflow-hidden rounded-card border border-line bg-white p-0">
        {projects.map((p, i) => {
          const body = (
            <>
              <span className="w-6 shrink-0 text-[13px] font-bold text-brick tabular-nums">
                {numbered ? String(offset + i + 1).padStart(2, '0') : '·'}
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
                {numbered && (
                  <span className="hidden text-muted sm:inline">
                    <Arrow />
                  </span>
                )}
              </span>
            </>
          )
          return (
            <li key={`${p.city}-${p.street ?? i}`} className="border-b border-line-soft last:border-b-0">
              {numbered ? (
                <a
                  href="#zugang"
                  className="flex items-center gap-4 px-4 py-4 text-ink no-underline transition-colors hover:bg-section sm:px-5"
                  aria-label={`${p.street}, ${p.city} – Details nach Anmeldung`}
                >
                  {body}
                </a>
              ) : (
                <div className="flex items-center gap-4 px-4 py-4 sm:px-5">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function Projekte() {
  const stats = [
    { value: String(projectsCompleted.length), label: 'abgeschlossen' },
    { value: String(projectsForSale.length), label: 'im Verkauf' },
    { value: String(projectsPipeline.length), label: 'im Ankauf' },
    { value: '13.269', label: 'm² Wohnfläche' },
  ]

  return (
    <>
      <Header />
      <main className="bg-section">
        <div className="section pb-0">
          <div className="container-site">
            <p className="m-0 text-[13px] text-muted">Gerlach Immobilien Gruppe · Stand April 2026</p>
            <h1 className="m-0 mt-3 text-[clamp(32px,3.6vw,44px)] leading-tight font-extrabold tracking-[-0.02em]">
              {allHouses} Häuser, jedes mit eigener Seite.
            </h1>
            <p className="m-0 mt-3 max-w-[740px] text-[17px] leading-relaxed text-ink-2">
              Alles, was die Gerlach Immobilien Gruppe seit 2025 gekauft, saniert und verkauft hat, dazu die Objekte im
              Verkauf und im Ankauf. Kaufpreis, Kosten und Verkaufserlös sehen Sie nach der Anmeldung.
            </p>

            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
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
        </div>

        <section id="zugang" className="section">
          <div className="container-site grid items-center gap-10 rounded-card bg-ink px-6 py-10 text-white sm:px-14 sm:py-14 lg:grid-cols-2">
            <div>
              <LockIcon className="size-7 text-brick" />
              <h2 className="m-0 mt-4 text-[clamp(30px,3.2vw,40px)] leading-[1.1] font-extrabold tracking-tight">
                Alle Zahlen zu 15 Projekten und die Pipeline
              </h2>
              <p className="m-0 mt-4 text-[17px] leading-relaxed text-light-dark">
                Kaufpreis, Sanierungskosten und Verkaufserlös jedes Hauses, dazu die Objekte im Ankauf. Mit Ihrer
                Telefonnummer oder E-Mail-Adresse angemeldet, sehen Sie alles.
              </p>
            </div>
            <AccessForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
