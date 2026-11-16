import { useEffect } from 'react'
import { caseStudyStats, publicFaqs } from '../../data/landing'
import { ButtonLink, Placeholder } from '../ui'

export function PressSection() {
  return (
    <section className="section bg-section">
      <div className="container-site grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Placeholder label="Bild Presse & Artikel" className="aspect-[4/3] w-full" />
        <div>
          <h2 className="h2">Öffentlichkeitsarbeit &amp; Artikel</h2>
          <p className="m-0 mt-4 text-[17px] leading-relaxed text-ink-2">
            In diesem Bereich finden Sie ausgewählte Artikel und Veröffentlichungen rund um unser Unternehmen. Hier
            erhalten Sie kompakte Einblicke in unser Business und erfahren, wo und zu welchen Themen wir publizieren.
          </p>
          <ButtonLink href="#" className="mt-7">
            Mehr erfahren
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

export function CaseStudyNumbers() {
  return (
    <section className="bg-navy-gradient px-5 py-16 text-white lg:py-20">
      <div className="container-site">
        <h2 className="h2 max-w-[760px]">Case Study: Ein Mehrfamilienhaus in Hamburg</h2>
        <p className="m-0 mt-5 max-w-[860px] text-[17px] leading-relaxed text-lighter-dark">
          Die Hanseatische Invest eG ermöglicht durch gezielten Einsatz von Eigenkapital attraktive Finanzierungsstrukturen,
          steigert Immobilienwerte nachhaltig und bietet Anlegern transparente sowie verlässliche Renditen. Das Projekt
          wurde zu 80 % fremd- und zu 20 % eigenfinanziert, wobei die Ankaufnebenkosten aus Eigenkapital gedeckt wurden.
          Durch gezielte Sanierungsmaßnahmen erzielten die Anleger eine Rendite von 7 % zuzüglich vollständiger
          Rückzahlung des Eigenkapitals.
        </p>
        <dl className="m-0 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {caseStudyStats.map((s, i) => (
            <div key={s.label} className="rounded-card border border-white/15 bg-white/5 px-4 py-5">
              <dt
                className={`text-[clamp(22px,2.2vw,28px)] leading-none font-display font-normal ${i === caseStudyStats.length - 1 ? 'text-gold-400' : ''}`}
              >
                {s.value}
              </dt>
              <dd className="m-0 mt-2 text-[13px] text-light-dark">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function LogoGrid({ count }: { count: number }) {
  return (
    <ul className="m-0 mt-10 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Placeholder label="Logo Platzhalter" className="aspect-[3/2] w-full" />
        </li>
      ))}
    </ul>
  )
}

export function Subsidiaries() {
  return (
    <section className="section">
      <div className="container-site">
        <h2 className="h2">Tochterunternehmen</h2>
        <p className="m-0 mt-4 max-w-[760px] text-[17px] leading-relaxed text-ink-2">
          Mit unseren Marken decken wir die gesamte Wertschöpfungskette entlang der Bestandssanierung bis hin zum Verkauf
          als optimierte Kapitalanlage ab. Durch diese Synergien entstehen für uns und unsere Kunden relevante
          Kostenvorteile.
        </p>
        <LogoGrid count={6} />
      </div>
    </section>
  )
}

export function BrokerBanner() {
  return (
    <section className="px-5 pb-[72px]">
      <div className="container-site flex flex-col gap-8 rounded-card bg-navy-gradient px-6 py-10 text-white sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-[760px]">
          <h2 className="m-0 text-[clamp(24px,2.6vw,32px)] leading-snug font-display font-normal">
            Mehrwert für Makler: 7&nbsp;% p.a. Rendite-Chance für Ihre Verkaufskunden
          </h2>
          <p className="m-0 mt-4 text-[16px] leading-relaxed text-lighter-dark">
            Was passiert mit dem Kapital Ihrer Kunden nach dem Verkauf? Mit den Genossenschaftsanteilen der Hanseatischen
            Invest eG bieten Sie eine attraktive Möglichkeit zur renditestarken Weiteranlage – 7&nbsp;% p.a. im Rahmen
            unseres „Club der Kapitalanleger PRO“ der Gerlach Immobilien Gruppe.
          </p>
        </div>
        <ButtonLink href="#kontakt" className="shrink-0 px-7 py-4">
          Jetzt empfehlen
        </ButtonLink>
      </div>
    </section>
  )
}

export function PublicFaq() {
  return (
    <section id="faq" className="section bg-section">
      <div className="mx-auto max-w-[860px]">
        <h2 className="h2">Häufig gestellte Fragen</h2>
        <div className="mt-8 border-t border-line">
          {publicFaqs.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl font-medium transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <div className="pb-6 text-[16px] leading-relaxed text-ink-2">
                <p className="m-0 font-bold text-ink">{f.lead}</p>
                <p className="m-0 mt-2">
                  {f.body}
                  {f.link && (
                    <>
                      {' '}
                      <a href={f.link.href}>{f.link.label}</a>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Sponsoring() {
  return (
    <section className="section">
      <div className="container-site">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <h2 className="h2">Wir sponsern Ihr Team</h2>
            <p className="m-0 mt-4 text-[17px] leading-relaxed text-ink-2">
              Die Hanseatische Invest eG ist stolzer Sponsor verschiedener Sportteams und engagiert sich aktiv für sportliche
              Leistung und Gemeinschaft. Mit diesem Engagement unterstreicht das Unternehmen seine Verbundenheit zu
              Teamgeist, Fairness und nachhaltiger Förderung.
            </p>
          </div>
          <ButtonLink href="#kontakt" className="self-start lg:self-end">
            Mehr erfahren
          </ButtonLink>
        </div>
        <LogoGrid count={6} />
      </div>
    </section>
  )
}

const HUBSPOT_FORM = { portal: '19607021', form: '267d631e-8b36-4e15-bcfe-e5ba855ad77e', region: 'na1' }

/** Loads HubSpot's embed script once; it renders the form into every .hs-form-frame. */
function useHubspotEmbed() {
  useEffect(() => {
    const src = `https://js.hsforms.net/forms/embed/${HUBSPOT_FORM.portal}.js`
    if (document.querySelector(`script[src="${src}"]`)) return
    const script = document.createElement('script')
    script.src = src
    script.defer = true
    document.body.appendChild(script)
  }, [])
}

export function ContactSection() {
  useHubspotEmbed()

  return (
    <section id="kontakt" className="section bg-section">
      <div className="container-site grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="h2">Kontakt</h2>
          <p className="m-0 mt-4 text-[17px] leading-relaxed text-ink-2">
            Wenn Sie Fragen haben oder einen Termin mit einem unserer Berater für weiterführende Informationen vereinbaren
            möchten, nehmen Sie gerne Kontakt mit uns auf. Unser Team steht Ihnen jederzeit zur Verfügung und organisiert
            gerne ein persönliches Gespräch zu einem für Sie passenden Zeitpunkt. Wir freuen uns auf Ihre Anfrage.
          </p>
          <Placeholder label="Bild Beratung / Team" className="mt-8 hidden aspect-[4/3] w-full lg:grid" />
        </div>

        <div className="min-h-[420px] rounded-card border border-line bg-white p-6 sm:p-8">
          <div
            className="hs-form-frame"
            data-region={HUBSPOT_FORM.region}
            data-form-id={HUBSPOT_FORM.form}
            data-portal-id={HUBSPOT_FORM.portal}
          />
        </div>
      </div>
    </section>
  )
}
