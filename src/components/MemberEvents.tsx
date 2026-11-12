import { company, memberEvents } from '../data/content'

const signup = (title: string) =>
  `mailto:${company.email}?subject=${encodeURIComponent(`Anmeldung: ${title}`)}`

/** Upcoming member events: site visits, project reports, the annual meeting. */
export default function MemberEvents() {
  return (
    <section id="termine" className="section bg-section">
      <div className="container-site">
        <h2 className="h2">Kommende Veranstaltungen</h2>
        <p className="m-0 mt-3 max-w-[640px] text-[17px] leading-relaxed text-ink-2">
          Besichtigungen, Projektberichte und Treffen mit anderen Mitgliedern.
        </p>

        <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {memberEvents.map((e) => (
            <li key={e.title} className="flex gap-5 rounded-card border border-line bg-white p-5 sm:p-6">
              <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-card bg-navy-gradient py-3 text-white">
                <span className="font-display text-[30px] leading-none">{e.day}</span>
                <span className="mt-1 text-[12px] font-semibold tracking-[0.12em] text-gold-400 uppercase">{e.month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[18px] leading-snug font-bold text-ink">{e.title}</p>
                <p className="m-0 mt-1 text-[13px] text-muted">{e.place}</p>
                <p className="m-0 mt-2 text-[14px] text-ink-2">{e.note}</p>
                <a href={signup(e.title)} className="mt-3 inline-block text-[14px] font-bold">
                  Anmelden →
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4 text-[13px] text-muted">Beispieltermine, die echten Termine folgen.</p>
      </div>
    </section>
  )
}
