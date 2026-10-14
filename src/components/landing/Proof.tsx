import { useState } from 'react'
import { capitalSteps, caseStudies, seals, team } from '../../data/landing'
import { ButtonLink, Eyebrow, Placeholder } from '../ui'

export function CapitalSteps() {
  return (
    <section id="so-funktionierts" className="section bg-section">
      <div className="container-site">
        <Eyebrow>So funktioniert's</Eyebrow>
        <p className="m-0 max-w-[720px] text-[17px] leading-relaxed text-ink-2">
          In vier Schritten: Ihr Kapital fließt in echte Häuser, stärkt dort als Eigenkapital die Finanzierung, und aus
          Sanierung und Verkauf entstehen Ihre Erträge.
        </p>
        <h2 className="h2 mt-3">Wie wir Ihr Kapital einsetzen:</h2>

        <ol className="m-0 mt-12 list-none space-y-14 p-0 lg:space-y-20">
          {capitalSteps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <p className="m-0 text-[clamp(40px,4vw,56px)] leading-none font-extrabold text-brick">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="m-0 mt-4 text-[clamp(22px,2.2vw,28px)] leading-snug font-extrabold tracking-tight">{s.title}</h3>
                <p className="m-0 mt-4 text-[16px] leading-relaxed text-ink-2">{s.text}</p>
              </div>
              <Placeholder label={`Bild Schritt ${i + 1}`} className={`aspect-[4/3] w-full ${i % 2 === 1 ? 'lg:order-1' : ''}`} />
            </li>
          ))}
        </ol>

        <p className="m-0 mt-12 text-[13px] text-muted">
          *Die Wertschöpfung entsteht durch operative Immobilienarbeit, nicht durch Finanzprodukte.
        </p>
      </div>
    </section>
  )
}

export function TrustBanner() {
  return (
    <section className="bg-ink px-5 py-16 text-white">
      <div className="container-site text-center">
        <h2 className="h2">Mehr Rendite, weniger Risiko. Kein Aufwand</h2>
        <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-3">
          {seals.map((s) => (
            <li key={s.label} className="flex flex-col items-center gap-4">
              <img src={s.src} alt={s.alt} width={250} height={400} loading="lazy" className="h-[150px] w-auto" />
              <span className="text-[15px] font-semibold text-lighter-dark">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CaseStudyCard({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false)
  const id = `case-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <article className="overflow-hidden rounded-card border border-line bg-white">
      <Placeholder label={`Projektfoto ${title}`} className="aspect-[16/10] w-full rounded-none" />
      <div className="p-6">
        <h3 className="m-0 text-[22px] font-extrabold">{title}</h3>
        <p id={id} className={`m-0 mt-3 text-[16px] leading-relaxed text-ink-2 ${open ? '' : 'line-clamp-4'}`}>
          {text}
        </p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-[15px] font-bold text-brick underline underline-offset-4"
        >
          {open ? 'Weniger anzeigen' : 'Mehr anzeigen'}
        </button>
      </div>
    </article>
  )
}

export function CaseStudies() {
  return (
    <section id="case-studies" className="section">
      <div className="container-site">
        <Eyebrow>Case Studies</Eyebrow>
        <h2 className="h2">Investition der Hanseatischen Invest eG</h2>
        <div className="mt-10 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {caseStudies.map((c) => (
            <CaseStudyCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function WebinarBanner() {
  return (
    <section className="bg-ink px-5 py-16 text-white lg:py-20">
      <div className="container-site grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow onDark>Live Webinar</Eyebrow>
          <h2 className="h2">Lassen Sie Ihr Kapital sinnvoll arbeiten</h2>
          <p className="m-0 mt-4 text-[17px] leading-relaxed text-lighter-dark">
            Nutzen Sie Ihr Kapital gezielt. Erfahren Sie im kostenfreien Live-Webinar, wie Genossenschaftsanteile als
            strukturierte Alternative zur klassischen Immobilienanlage funktionieren – transparent und ohne
            Verwaltungsaufwand. Jetzt Platz sichern.
          </p>
          <ButtonLink href="#kontakt" className="mt-7">
            Jetzt anmelden
          </ButtonLink>
        </div>
        <img
          src="/video/hansea-erklaerfilm-poster.jpg"
          alt="Standbild aus dem Erklärfilm der Hanseatischen Invest eG"
          width={1280}
          height={720}
          loading="lazy"
          className="block aspect-video w-full rounded-card object-cover"
        />
      </div>
    </section>
  )
}

export function Team() {
  return (
    <section id="team" className="section">
      <div className="container-site">
        <Eyebrow>Team</Eyebrow>
        <h2 className="h2">Die Führungsspitze der Hanseatischen Invest eG</h2>
        <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {team.map((m) => (
            <li key={m.name} className="overflow-hidden rounded-card border border-line bg-white">
              {m.photo ? (
                <img
                  src={m.photo}
                  alt={`${m.name}, ${m.role}`}
                  width={760}
                  height={1138}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover object-top"
                />
              ) : (
                <Placeholder label={`Foto ${m.name}`} className="aspect-[4/5] w-full rounded-none" />
              )}
              <div className="p-6">
                <h3 className="m-0 text-[20px] font-extrabold">{m.name}</h3>
                <p className="m-0 mt-1 text-[14px] font-bold text-brick">{m.role}</p>
                <p className="m-0 mt-3 text-[15px] leading-relaxed text-ink-2">{m.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
