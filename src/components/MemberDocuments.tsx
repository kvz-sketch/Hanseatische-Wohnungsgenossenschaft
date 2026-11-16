import type { ReactNode } from 'react'
import type { Portfolio } from '../auth/auth'
import { wpUrl } from '../backend'
import { company, memberDocuments } from '../data/content'

const request = (title: string) =>
  `mailto:${company.email}?subject=${encodeURIComponent(`Dokument anfordern: ${title}`)}`

const date = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** "Beitrittserklärung-mit-Zustimmung.pdf" → "Beitrittserklärung mit Zustimmung". */
const title = (name: string) => name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim()

const actionClass =
  'inline-flex h-9 items-center rounded-control border border-line bg-white px-3 text-[14px] font-semibold text-ink no-underline hover:border-ink'

/** A list that opens on click (closed at first), so the page stays short. */
function Dropdown({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <details className="group rounded-card border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-[17px] font-bold text-ink">{label}</span>
        <span className="rounded-full bg-navy-050 px-2.5 py-0.5 text-[13px] font-semibold text-ink tabular-nums">{count}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0 text-ink transition-transform group-open:rotate-180">
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ul className="m-0 list-none border-t border-line p-0">{children}</ul>
    </details>
  )
}

function Row({ heading, note, children }: { heading: string; note: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3.5 last:border-0">
      <span className="grid h-10 w-8 shrink-0 place-items-center rounded bg-navy-050 text-[10px] font-bold text-ink">PDF</span>
      <span className="min-w-0 flex-1 basis-[200px]">
        <span className="block text-[15px] leading-snug font-semibold break-words text-ink">{heading}</span>
        <span className="block text-[13px] text-muted">{note}</span>
      </span>
      <span className="flex flex-wrap gap-2">{children}</span>
    </li>
  )
}

/**
 * The member's own documents from the Mitgliederliste (every PDF the team has
 * attached: Beitrittserklärung, approvals, Kündigung …), to open or download,
 * plus the documents of the Genossenschaft on request. Both as lists that
 * open on click. `documents` undefined: sample data (demo).
 */
export default function MemberDocuments({ documents }: { documents?: Portfolio['documents'] | null }) {
  const own = documents ?? null
  const general = memberDocuments.filter((d) => d.kind === 'Genossenschaft')
  const sample = memberDocuments.filter((d) => d.kind !== 'Genossenschaft')
  return (
    <section id="dokumente" className="section">
      <div className="container-site">
        <h2 className="h2">Ihre Dokumente</h2>
        <p className="m-0 mt-3 max-w-[640px] text-[17px] leading-relaxed text-ink-2">
          Bescheinigungen, Abrechnungen und die Unterlagen der Genossenschaft an einem Ort. Zum Öffnen auf die Liste klicken.
        </p>

        <div className="mt-8 grid max-w-[880px] gap-3">
          {own ? (
            <Dropdown label="Ihre persönlichen Dokumente" count={own.length}>
              {own.length === 0 ? (
                <li className="px-5 py-4 text-[15px] text-muted">Noch keine Dokumente. Sobald wir Ihnen ein Dokument bereitstellen, finden Sie es hier.</li>
              ) : (
                [...own]
                  .sort((a, b) => b.time.localeCompare(a.time))
                  .map((d) =>
                    d.url ? (
                      <Row key={d.id} heading={title(d.name)} note={`Bereitgestellt am ${date(d.time)} · bei DocuSign`}>
                        <a href={d.url} target="_blank" rel="noopener" className={actionClass}>Bei DocuSign öffnen</a>
                      </Row>
                    ) : (
                      <Row key={d.id} heading={title(d.name)} note={`Bereitgestellt am ${date(d.time)}`}>
                        <a href={wpUrl(`member/documents/${d.id}`)} target="_blank" rel="noopener" className={actionClass}>Öffnen</a>
                        <a href={`${wpUrl(`member/documents/${d.id}`)}&download=1`} download className={actionClass}>Herunterladen</a>
                      </Row>
                    ),
                  )
              )}
            </Dropdown>
          ) : (
            <Dropdown label="Ihre persönlichen Dokumente" count={sample.length}>
              {sample.map((d) => (
                <Row key={d.title} heading={d.title} note={`${d.note} · Beispieldaten`}>
                  <a href={request(d.title)} className={actionClass}>Anfordern</a>
                </Row>
              ))}
            </Dropdown>
          )}
          <Dropdown label="Unterlagen der Genossenschaft" count={general.length}>
            {general.map((d) => (
              <Row key={d.title} heading={d.title} note={`${d.note} · auf Anfrage per E-Mail`}>
                <a href={request(d.title)} className={actionClass}>Anfordern</a>
              </Row>
            ))}
          </Dropdown>
        </div>
      </div>
    </section>
  )
}
