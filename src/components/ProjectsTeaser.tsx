import { ButtonLink, LockIcon, StageBar, StatusBadge } from './ui'

const stages = ['Ankauf', 'Sanierung', 'Vermietung', 'Verkauf']

const lockedTeasers = [
  { title: 'Eckernförde, Diestelkamp', meta: '36 Wohnungen · verkauft' },
  { title: 'Kiel, Mühlenweg', meta: '21 Wohnungen · verkauft' },
  { title: 'Lübeck', meta: '40 Wohnungen · im Ankauf' },
]

export default function ProjectsTeaser() {
  return (
    <section id="projekte" className="section bg-section">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[680px]">
            <h2 className="h2">Sehen Sie, wo Ihr Geld arbeitet – bevor Sie es einsetzen</h2>
            <p className="m-0 mt-3 text-[16px] leading-relaxed text-ink-2">
              Ein verkauftes und ein laufendes Haus mit echten Zahlen. Jedes Projekt der Gruppe hat eine eigene Seite;
              Kaufpreis, Kosten und Verkaufserlös sehen Sie nach der Anmeldung, in derselben Ansicht wie später im
              Mitgliederportal.
            </p>
          </div>
          <a href="/projekte/" className="text-[15px] font-bold text-ink underline underline-offset-4">
            Alle Projekte ansehen →
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="overflow-hidden rounded-card border border-line bg-white">
            <img
              src="/media/projekt-hamburg-borgfelder.jpg"
              alt="Mehrfamilienhaus Borgfelder Straße 52 in Hamburg nach der Sanierung, im Winter"
              width={800}
              height={600}
              loading="lazy"
              className="block aspect-[4/3] w-full object-cover"
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="m-0 text-[18px] font-extrabold">Hamburg, Borgfelder Straße</h3>
                  <p className="m-0 mt-0.5 text-[13px] text-muted">20 Wohnungen · Baujahr 1955 · in unter 6 Monaten</p>
                </div>
                <StatusBadge status="Verkauft" />
              </div>
              <div className="mt-4">
                <StageBar stages={stages} current={3} />
              </div>
              <p className="m-0 mt-4 text-[14px] text-ink-2">
                Gekauft für 4,75 Mio. €, verkauft für <strong className="text-ink">6,55 Mio. €</strong>
              </p>
            </div>
          </article>

          <article className="overflow-hidden rounded-card border border-line bg-white">
            <div className="stripe-light aspect-[4/3] w-full">Foto 4:3</div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="m-0 text-[18px] font-extrabold">Norderstedt, Langer Kamp</h3>
                  <p className="m-0 mt-0.5 text-[13px] text-muted">23 Wohnungen · ab 57 m²</p>
                </div>
                <StatusBadge status="Verkauf läuft" />
              </div>
              <div className="mt-4">
                <StageBar stages={stages} current={3} />
              </div>
              <p className="m-0 mt-4 text-[14px] text-ink-2">
                Reserviert: <strong className="text-ink">15 bis 50 % der Wohnungen</strong>
              </p>
            </div>
          </article>
        </div>

        {/* Locked preview of further projects */}
        <div className="relative mt-4">
          <div className="grid gap-4 opacity-70 blur-[6px] select-none sm:grid-cols-3" aria-hidden>
            {lockedTeasers.map((t) => (
              <div key={t.title} className="overflow-hidden rounded-card bg-white/80">
                <div className="aspect-[4/3] bg-line-soft" />
                <div className="p-5">
                  <p className="m-0 text-[16px] font-extrabold">{t.title}</p>
                  <p className="m-0 text-[13px] text-muted">{t.meta}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-[520px] rounded-card border border-line bg-white px-6 py-7 text-center shadow-[0_10px_40px_rgba(16,35,58,0.12)] sm:px-9">
              <LockIcon className="mx-auto size-6 text-brick" />
              <h3 className="m-0 mt-3 text-[21px] font-extrabold">Alle Zahlen zu 15 Projekten und die Pipeline</h3>
              <p className="m-0 mt-2 text-[14px] leading-relaxed text-ink-2">
                Kaufpreis, Sanierungskosten und Verkaufserlös jedes Hauses, dazu die Objekte im Ankauf. Mit Ihrer
                Telefonnummer oder E-Mail-Adresse angemeldet, sehen Sie alles.
              </p>
              <ButtonLink href="/projekte/#zugang" className="mt-5">
                Zugang anfordern →
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
