import type { Portfolio } from '../auth/auth'
import { wpUrl } from '../backend'
import { company, memberDocuments } from '../data/content'

const request = (title: string) =>
  `mailto:${company.email}?subject=${encodeURIComponent(`Dokument anfordern: ${title}`)}`

const date = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** "Beitrittserklärung-mit-Zustimmung.pdf" → "Beitrittserklärung mit Zustimmung". */
const title = (name: string) => name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim()

function DocCard({ href, kind, heading, note, download }: { href: string; kind: string; heading: string; note: string; download?: boolean }) {
  return (
    <li>
      <a
        href={href}
        target={download ? '_blank' : undefined}
        rel={download ? 'noopener' : undefined}
        className="group flex h-full items-center gap-4 rounded-card border border-line bg-white p-5 no-underline hover:border-ink"
      >
        <span className="grid h-12 w-10 shrink-0 place-items-center rounded bg-navy-050 text-[11px] font-bold text-ink">PDF</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-gold-700">{kind}</span>
          <span className="block text-[16px] leading-snug font-bold break-words text-ink">{heading}</span>
          <span className="block text-[13px] text-muted">{note}</span>
        </span>
        <span aria-hidden="true" className="text-[18px] text-ink transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
    </li>
  )
}

/**
 * The member's own documents from the Mitgliederliste (every PDF the team has
 * attached: Beitrittserklärung, approvals, Kündigung …), plus the documents of
 * the Genossenschaft on request. `documents` undefined: sample data (demo).
 */
export default function MemberDocuments({ documents }: { documents?: Portfolio['documents'] | null }) {
  const own = documents ?? null
  const general = memberDocuments.filter((d) => d.kind === 'Genossenschaft')
  return (
    <section id="dokumente" className="section">
      <div className="container-site">
        <h2 className="h2">Ihre Dokumente</h2>
        <p className="m-0 mt-3 max-w-[640px] text-[17px] leading-relaxed text-ink-2">
          Bescheinigungen, Abrechnungen und die Unterlagen der Genossenschaft an einem Ort.
        </p>

        {own ? (
          <>
            {own.length === 0 ? (
              <p className="m-0 mt-8 rounded-card border border-line bg-white p-5 text-[15px] text-muted">
                Noch keine persönlichen Dokumente. Sobald wir Ihnen ein Dokument bereitstellen, finden Sie es hier.
              </p>
            ) : (
              <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {[...own]
                  .sort((a, b) => b.time.localeCompare(a.time))
                  .map((d) => (
                    <DocCard key={d.id} href={wpUrl(`member/documents/${d.id}`)} kind="Persönlich" heading={title(d.name)} note={`Bereitgestellt am ${date(d.time)}`} download />
                  ))}
              </ul>
            )}
            <h3 className="m-0 mt-10 text-[18px] font-bold">Unterlagen der Genossenschaft</h3>
            <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {general.map((d) => (
                <DocCard key={d.title} href={request(d.title)} kind={d.kind} heading={d.title} note={`${d.note} · auf Anfrage per E-Mail`} />
              ))}
            </ul>
          </>
        ) : (
          <>
            <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {memberDocuments.map((d) => (
                <DocCard key={d.title} href={request(d.title)} kind={d.kind} heading={d.title} note={d.note} />
              ))}
            </ul>
            <p className="m-0 mt-4 text-[13px] text-muted">
              Beispieldaten. Bis die Dateien hier bereitstehen, schicken wir Ihnen jedes Dokument auf Anfrage per E-Mail.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
