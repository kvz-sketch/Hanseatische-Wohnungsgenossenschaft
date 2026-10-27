import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/Reveal";
import { team } from "../data/content";
import { Calculator } from "./components/Calculator";
import { HanseaMark } from "./components/HanseaMark";
import { LeadForm } from "./components/LeadForm";
import {
  contact,
  facts,
  faq,
  group,
  legal,
  offer,
  opportunities,
  reasons,
  risks,
  steps,
} from "./content";

const FORM_ID = "infopaket";
const people = team.filter((p) => ["CEO", "CFO", "Director Relationship Management"].includes(p.role));

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
        <Group />
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
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-11">
        <a href="#top" className="flex items-center gap-2.5">
          <HanseaMark size={28} />
          <span className="font-serif-display text-[18px] leading-none text-navy">Hansea Invest</span>
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
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep">
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-gold/15 blur-[110px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-11 lg:py-20">
        <div>
          <Reveal>
            <span className="subheading text-[11px] uppercase tracking-[0.22em] text-gold">
              Genossenschaftsanteile · Hamburg
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-serif-display mt-4 text-[36px] leading-[1.08] text-white sm:text-[48px] lg:text-[56px]">
              Bis zu <span className="text-shimmer">7 % p. a.</span> mit Hamburger Wohnimmobilien
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-fog sm:text-[17px]">
              Werden Sie Mitglied der {offer.issuer} und beteiligen Sie sich an echten Mietwohnungen in Hamburg — als
              Baustein für Rente, Vermögensaufbau und Schutz vor Inflation.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <ul className="mt-6 flex flex-col gap-2.5 text-[15px] text-white">
              {["Ziel-Dividende bis zu 7 % p. a.", "Beteiligung ab 10.000 €", "Quartalsweise Ausschüttung"].map(
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
              Die Ziel-Dividende ist nicht garantiert. Ein Verlust des eingesetzten Kapitals ist möglich.
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
          title="In drei Schritten an Hamburger Wohnungen beteiligt"
          intro="Kein eigener Wohnungskauf, keine Mieterbetreuung, kein Notartermin — die Genossenschaft übernimmt Ankauf, Sanierung und Verwaltung."
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
            title="Was Ihr Geld in Hamburger Wohnungen erwirtschaften kann"
            intro="Bewegen Sie den Regler und sehen Sie, welche Ausschüttung sich bei der Ziel-Dividende von 7 % p. a. ergeben würde."
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

function Group() {
  return (
    <section className="bg-navy px-5 py-16 text-white sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <span className="subheading text-[11px] uppercase tracking-[0.2em] text-gold">Wer dahintersteht</span>
          <h2 className="font-serif-display mt-3 text-[28px] leading-tight sm:text-[34px]">{group.heading}</h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-fog">{group.paragraph}</p>
          <ul className="mt-6 flex flex-col gap-2.5 text-[15px]">
            {group.points.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <Check />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-fog/70">Sitz: {contact.address}</p>
        </Reveal>
        <div className="grid grid-cols-3 gap-3 self-center sm:gap-4">
          {people.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <img
                src={p.photo}
                alt={p.name}
                loading="lazy"
                className="aspect-[3/4] w-full rounded-md object-cover grayscale-[20%]"
              />
              <div className="subheading mt-2.5 text-[13px] leading-tight">{p.name}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-fog/70">{p.role}</div>
            </Reveal>
          ))}
        </div>
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
    <section className="bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-16 text-center sm:px-8 md:py-20 lg:px-11">
      <Reveal className="mx-auto max-w-[640px]">
        <h2 className="font-serif-display text-[28px] leading-tight text-white sm:text-[36px]">
          Jetzt in Ruhe informieren — kostenlos und unverbindlich
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
        <div className="flex items-center gap-2.5">
          <HanseaMark size={24} color="#ffffff" />
          <span className="font-serif-display text-[16px] text-white">Hansea Invest</span>
        </div>
        <p className="mt-5 max-w-[900px] text-[12px] leading-relaxed text-fog/80">{legal.riskNotice}</p>
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
