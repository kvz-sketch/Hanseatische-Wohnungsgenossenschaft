import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/Reveal";
import { team } from "../data/content";
import bookCover from "./assets/buch-immobilien-investitionen-leicht-gemacht.jpg";
import { Calculator } from "./components/Calculator";
import logoNavy from "./assets/logo-hanseatische-invest-navy.png";
import logoWhite from "./assets/logo-hanseatische-invest-white.png";
import { LeadForm } from "./components/LeadForm";
import {
  contact,
  facts,
  faq,
  ceo,
  legal,
  offer,
  opportunities,
  reasons,
  risks,
  steps,
} from "./content";

const FORM_ID = "infopaket";
const ceoPhoto = team.find((p) => p.name === "Stephan Gerlach")?.photo;

export function LandingPage() {
  return (
    <div id="top" className="pb-20 sm:pb-0">
      <AdLabel />
      <Header />
      <main>
        <Hero />
        <FactStrip />
        <HowItWorks />
        <CalculatorSection />
        <WhyHamburg />
        <Ceo />
        <ChancesRisks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}

function AdLabel() {
  return (
    <div className="bg-navy-deep px-5 py-1.5 text-center text-[11px] tracking-[0.08em] text-fog/80">
      <span className="subheading uppercase text-gold">Anzeige</span> · Ein Angebot der {offer.issuer}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8 lg:px-11">
        <a href="#top" className="block">
          <img src={logoNavy} alt={offer.issuer} className="h-12 w-auto sm:h-14" />
        </a>
        <div className="flex items-center gap-5">
          <a href={contact.phoneHref} className="hidden text-[13px] font-semibold text-navy hover:text-gold-deep md:block">
            {contact.phone}
          </a>
          <Button variant="primary" size="sm" href={`#${FORM_ID}`}>
            Infopaket
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-navy">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-11 lg:py-20">
        <div>
          <Reveal>
            <span className="subheading text-[11px] uppercase tracking-[0.22em] text-gold">
              Genossenschaftsanteile · Hamburg
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-serif-display mt-4 text-[36px] leading-[1.08] text-white sm:text-[48px] lg:text-[56px]">
              <span className="text-gold">7 % p. a.*</span> mit echten Wohnimmobilien
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-fog sm:text-[17px]">
              Werden Sie investierendes Mitglied der Hamburger {offer.issuer}: gemeinsam mit anderen Mitgliedern in
              Wohnimmobilien investieren, ohne Kredit und ohne Vermieten.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <ul className="mt-6 flex flex-col gap-2.5 text-[15px] text-white">
              {["7 % p. a. vorgesehene Verzinsung*", "Ein Anteil: 10.000 €, auch mehrere möglich", "Auszahlung alle drei Monate"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-7 max-w-[520px] text-[11.5px] leading-relaxed text-fog/60">
              * Vorgesehene Verzinsung laut Geschäftsordnung, nicht garantiert. Ein Totalverlust des eingesetzten Kapitals ist möglich.
            </p>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <LeadForm id={FORM_ID} />
        </Reveal>
      </div>
    </section>
  );
}

function FactStrip() {
  return (
    <section className="border-b border-line bg-cream px-5 sm:px-8 lg:px-11">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <div
            key={f.label}
            className={`px-2 py-6 text-center sm:py-8 ${i % 2 === 1 ? "border-l border-navy/10" : ""} ${
              i >= 2 ? "border-t border-navy/10 lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <div className="subheading text-[22px] text-navy sm:text-[28px]">{f.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">{f.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className="max-w-[640px]">
      <span className="subheading text-[11px] uppercase tracking-[0.2em] text-gold-deep">{eyebrow}</span>
      <h2 className="font-serif-display mt-3 text-[28px] leading-tight text-navy sm:text-[34px]">{title}</h2>
      {intro && <p className="mt-4 text-[15.5px] leading-relaxed text-ink">{intro}</p>}
    </Reveal>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="So funktioniert's"
          title="In drei Schritten an echten Wohnimmobilien beteiligt"
          intro="Kein eigener Wohnungskauf, keine Mieterbetreuung, kein Notartermin. Ankauf, Modernisierung, Vermietung und Verkauf übernehmen die Genossenschaft und die Gerlach Immobilien Gruppe."
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="h-full rounded-lg border border-line p-6 sm:p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-[16px] font-bold text-gold">
                  {i + 1}
                </div>
                <h3 className="subheading mt-5 text-[18px] text-navy">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalculatorSection() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Beispielrechnung"
            title="Was Ihre Anteile an Zinsen bringen würden"
            intro="Bewegen Sie den Regler und sehen Sie, welche Zinsen sich bei der vorgesehenen Verzinsung von 7 % p. a. ergeben würden."
          />
          <Reveal delay={120} className="mt-7">
            <Button variant="primary" size="lg" href={`#${FORM_ID}`}>
              Konditionen anfordern
            </Button>
          </Reveal>
        </div>
        <Reveal delay={100}>
          <Calculator />
        </Reveal>
      </div>
    </section>
  );
}

function WhyHamburg() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="Warum Wohnimmobilien" title="Ein Sachwert, den jeder versteht" />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className="h-full border-l-[3px] border-gold bg-cream/60 p-6 sm:p-7">
                <h3 className="subheading text-[17px] text-navy">{r.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{r.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ceo() {
  return (
    <section className="bg-navy px-5 py-16 text-white sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <figure className="mx-auto max-w-[420px] lg:mx-0">
            <img
              src={ceoPhoto}
              alt={`${ceo.name}, ${ceo.role}`}
              loading="lazy"
              className="aspect-[4/5] w-full max-w-full rounded-md object-cover"
            />
            <figcaption className="mt-4">
              <div className="subheading text-[18px]">{ceo.name}</div>
              <div className="mt-0.5 text-[13.5px] text-fog/80">{ceo.role}</div>
              <a
                href={ceo.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[13px] font-semibold text-gold underline-offset-2 hover:underline"
              >
                LinkedIn-Profil
              </a>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={100}>
          <span className="subheading text-[11px] uppercase tracking-[0.2em] text-gold">Wer dahintersteht</span>
          <h2 className="font-serif-display mt-3 text-[28px] leading-tight [text-wrap:balance] sm:text-[34px]">
            {ceo.heading}
          </h2>
          {ceo.paragraphs.map((text) => (
            <p key={text.slice(0, 30)} className="mt-4 text-[15.5px] leading-relaxed text-fog">
              {text}
            </p>
          ))}

          <a
            href={ceo.book.url}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 flex gap-5 rounded-md border border-white/15 bg-white/[0.06] p-4 transition-colors hover:border-gold/60 sm:p-5"
          >
            <img
              src={bookCover}
              alt={`Buchcover: ${ceo.book.title}`}
              loading="lazy"
              className="h-auto w-[92px] flex-none rounded-[3px] shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:w-[110px]"
            />
            <div className="min-w-0">
              <span className="subheading inline-block rounded-[2px] bg-gold px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-navy">
                {ceo.book.badge}
              </span>
              <div className="subheading mt-2.5 text-[17px] leading-snug text-white">{ceo.book.title}</div>
              <div className="mt-1 text-[13px] leading-snug text-fog/80">{ceo.book.subtitle}</div>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-fog">{ceo.book.text}</p>
              <span className="mt-3 inline-block text-[13px] font-semibold text-gold group-hover:underline">
                Zum Buch beim {ceo.book.publisher} →
              </span>
            </div>
          </a>

          <p className="mt-6 text-[13px] text-fog/70">Sitz: {contact.address}</p>
        </Reveal>
      </div>
    </section>
  );
}

function ChancesRisks() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Transparent"
          title="Chancen und Risiken auf einen Blick"
          intro="Eine gute Entscheidung braucht beide Seiten. Ausführliche Informationen finden Sie im Infopaket."
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Reveal className="rounded-lg border border-line p-6 sm:p-7">
            <h3 className="subheading text-[17px] text-navy">Chancen</h3>
            <ul className="mt-4 flex flex-col gap-3 text-[14.5px] leading-relaxed text-ink">
              {opportunities.map((o) => (
                <li key={o} className="flex gap-3">
                  <Check />
                  {o}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={90} className="rounded-lg border border-koralle/40 bg-koralle/[0.04] p-6 sm:p-7">
            <h3 className="subheading text-[17px] text-navy">Risiken</h3>
            <ul className="mt-4 flex flex-col gap-3 text-[14.5px] leading-relaxed text-ink">
              {risks.map((r) => (
                <li key={r} className="flex gap-3">
                  <span className="mt-[7px] h-2 w-2 flex-none rounded-full bg-koralle" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[820px]">
        <SectionHeading eyebrow="FAQ" title="Häufige Fragen" />
        <div className="mt-8 flex flex-col gap-2.5">
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className={`rounded-[4px] border bg-white transition-colors ${isOpen ? "border-gold" : "border-line"}`}
              >
                <button
                  className="subheading flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-navy"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[15px] transition-transform duration-300 ${
                      isOpen ? "rotate-45 bg-navy text-gold" : "bg-mist text-gold-deep"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-5 pb-4 text-[14px] leading-relaxed text-ink">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-navy px-5 py-16 text-center sm:px-8 md:py-20 lg:px-11">
      <Reveal className="mx-auto max-w-[640px]">
        <h2 className="font-serif-display text-[28px] leading-tight text-white sm:text-[36px]">
          Jetzt kostenlos und unverbindlich informieren
        </h2>
        <p className="mt-4 text-[15.5px] leading-relaxed text-fog">
          Fordern Sie das Infopaket an oder sprechen Sie direkt mit unserem Team in Hamburg.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="gold" size="lg" href={`#${FORM_ID}`}>
            Infopaket anfordern
          </Button>
          <Button variant="on-navy" size="lg" href={contact.phoneHref}>
            {contact.phone}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-deep px-5 py-10 text-fog sm:px-8 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <img src={logoWhite} alt={offer.issuer} className="h-16 w-auto" />
        <p className="mt-5 max-w-[900px] text-[12px] leading-relaxed text-fog/80">{legal.riskNotice}</p>
        <p className="mt-3 max-w-[900px] text-[12px] leading-relaxed text-fog/60">{legal.notes}</p>
        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-fog/70 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Anzeige · {offer.issuer} · {contact.address}
          </span>
          <div className="flex gap-5">
            <a href={legal.imprint} target="_blank" rel="noreferrer" className="hover:text-gold">
              Impressum
            </a>
            <a href={legal.privacy} target="_blank" rel="noreferrer" className="hover:text-gold">
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Mobile-only bottom bar that appears once the hero form has scrolled away.
function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-navy/10 bg-white p-3 shadow-[0_-6px_20px_rgba(20,26,70,0.12)] transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Button variant="gold" size="lg" href={`#${FORM_ID}`} block>
        Infopaket kostenlos anfordern
      </Button>
    </div>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 flex-none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#DDB851" />
      <path d="M6 10.4 8.7 13 14 7.5" stroke="#141A46" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
