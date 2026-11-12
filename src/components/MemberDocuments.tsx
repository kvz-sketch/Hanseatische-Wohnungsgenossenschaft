import { company, memberDocuments } from '../data/content'

const request = (title: string) =>
  `mailto:${company.email}?subject=${encodeURIComponent(`Dokument anfordern: ${title}`)}`

/** Documents of the member and of the Genossenschaft; downloads follow once the files are connected. */
export default function MemberDocuments() {
  return (
    <section id="dokumente" className="section">
      <div className="container-site">
        <h2 className="h2">Ihre Dokumente</h2>
        <p className="m-0 mt-3 max-w-[640px] text-[17px] leading-relaxed text-ink-2">
          Bescheinigungen, Abrechnungen und die Unterlagen der Genossenschaft an einem Ort.
        </p>

        <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {memberDocuments.map((d) => (
            <li key={d.title}>
              <a
                href={request(d.title)}
                className="group flex h-full items-center gap-4 rounded-card border border-line bg-white p-5 no-underline hover:border-ink"
              >
                <span className="grid h-12 w-10 shrink-0 place-items-center rounded bg-navy-050 text-[11px] font-bold text-ink">
                  PDF
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-gold-700">{d.kind}</span>
                  <span className="block text-[16px] leading-snug font-bold text-ink">{d.title}</span>
                  <span className="block text-[13px] text-muted">{d.note}</span>
                </span>
                <span aria-hidden="true" className="text-[18px] text-ink transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4 text-[13px] text-muted">
          Beispieldaten. Bis die Dateien hier bereitstehen, schicken wir Ihnen jedes Dokument auf Anfrage per E-Mail.
        </p>
      </div>
    </section>
  )
}
