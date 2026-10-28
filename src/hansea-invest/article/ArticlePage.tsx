import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { HanseaMark } from "../components/HanseaMark";
import { legal, offer } from "../content";
import { article, checklist, closingQuestion, pullQuote, sections } from "./content";

// The landing page lives one level up. Taboola click id and UTM parameters are
// carried over so leads stay attributed to the ad that brought the reader in.
// VITE_LANDING_URL overrides the target (used for standalone previews).
function landingHref() {
  const base = (import.meta.env.VITE_LANDING_URL as string | undefined) ?? "../";
  return `${base}${window.location.search}#infopaket`;
}

const serif = { fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif' };

const riskNotice =
  "Risikohinweis: Der Erwerb von Genossenschaftsanteilen ist mit Risiken verbunden und kann zum teilweisen oder vollständigen Verlust des eingesetzten Kapitals führen. Maßgeblich sind ausschließlich die Satzung und die Beitrittsunterlagen der Hanseatische Invest eG.";

// Editorial extras placed after the section with the given id.
const inserts: Record<string, ReactNode> = {
  unternehmer: <PullQuote />,
  anlageformen: <TwoTimeframes />,
  bedingungen: <InlineCta />,
};

export function ArticlePage() {
  return (
    <div className="bg-white">
      <ReadingProgress />
      <div className="bg-navy-deep px-5 py-1.5 text-center text-[11px] tracking-[0.08em] text-fog/80">
        <span className="subheading uppercase text-gold">Anzeige</span> · Ein Beitrag der {offer.issuer}
      </div>
      <div className="border-b border-line px-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between py-3.5">
          <span className="subheading text-[11px] uppercase tracking-[0.18em] text-gold-deep">{article.kicker}</span>
          <span className="flex items-center gap-2 text-[13px] font-bold text-navy">
            <HanseaMark size={20} />
            Hansea Invest
          </span>
        </div>
      </div>

      <main className="px-5 pb-16">
        <article className="mx-auto max-w-[720px]">
          <header className="pt-10 pb-8 sm:pt-14">
            <h1 className="font-serif-display text-[29px] leading-[1.15] text-navy hyphens-auto sm:hyphens-none [text-wrap:balance] sm:text-[44px]">
              {article.title}
            </h1>
            <p className="mt-5 text-[19px] leading-[1.55] text-ink sm:text-[21px]" style={serif}>
              {article.dek}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-[12.5px] text-muted">
              <span>Anzeige der {offer.issuer}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readingMinutes} Min. Lesezeit</span>
            </div>
          </header>

          {sections.map((s) => (
            <Fragment key={s.id}>
              {s.id === "fazit" && <Checklist />}
              <section id={s.id} className="mt-10">
                <h2 className="subheading text-[22px] leading-snug text-navy hyphens-auto sm:hyphens-none [text-wrap:balance] sm:text-[25px]">
                  {s.heading}
                </h2>
                <div className="mt-4 flex flex-col gap-5 text-[18px] leading-[1.7] text-ink sm:text-[19px]" style={serif}>
                  {s.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </section>
              {inserts[s.id]}
            </Fragment>
          ))}

          <ClosingQuestion />
        </article>
      </main>

      <footer className="bg-navy-deep px-5 py-10 text-fog">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-center gap-2.5">
            <HanseaMark size={22} color="#ffffff" />
            <span className="font-serif-display text-[15px] text-white">Hansea Invest</span>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-fog/80">{riskNotice}</p>
          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-[12px] text-fog/70 sm:flex-row sm:justify-between">
            <span>Anzeige · {offer.issuer}</span>
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
    </div>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="reading-progress fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
      <div className="h-full origin-left bg-gold" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

function PullQuote() {
  return (
    <figure className="my-10 border-l-[3px] border-gold py-1 pl-6">
      <blockquote className="text-[23px] italic leading-snug text-navy sm:text-[27px]" style={serif}>
        {pullQuote}
      </blockquote>
    </figure>
  );
}

// Schematic of the article's key distinction: how long a property project runs
// versus how long the investor's capital stays bound. No durations on purpose.
function TwoTimeframes() {
  const project = ["Ankauf", "Moderni­sierung", "Neu­vermietung", "Verkauf"];
  return (
    <figure className="my-10 rounded-md bg-mist p-5 sm:p-7">
      <figcaption className="subheading text-[12px] uppercase tracking-[0.12em] text-gold-deep">
        Zwei Zeiträume, die man auseinanderhalten sollte
      </figcaption>

      <div className="relative mt-6">
        <div className="subheading text-[13px] text-navy">Dauer des Immobilienprojekts</div>
        <div className="mt-2 flex w-[72%] gap-[3px]">
          {project.map((step, i) => (
            <div
              key={step}
              className="flex-1 rounded-[2px] px-1 py-2 text-center text-[10.5px] font-semibold leading-tight text-white hyphens-manual sm:text-[12px]"
              style={{ background: ["#1e2864", "#141a46", "#1e2864", "#141a46"][i] }}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="subheading mt-6 text-[13px] text-navy">Bindung des angelegten Kapitals</div>
        <div className="mt-2 flex w-full gap-[3px]">
          <div className="w-[38%] rounded-[2px] bg-gold px-1 py-2 text-center text-[10.5px] font-semibold leading-tight text-navy sm:text-[12px]">
            Mindest&shy;laufzeit
          </div>
          <div className="w-[30%] rounded-[2px] bg-gold/70 px-1 py-2 text-center text-[10.5px] font-semibold leading-tight text-navy sm:text-[12px]">
            Kündigungs&shy;frist
          </div>
          <div className="flex-1 rounded-[2px] border border-dashed border-gold-deep px-1 py-2 text-center text-[10.5px] font-semibold leading-tight text-navy sm:text-[12px]">
            Rück&shy;zahlung nach Satzung
          </div>
        </div>

        {/* Marker: the property is sold while the capital is still bound */}
        <div className="pointer-events-none absolute top-[22px] bottom-0 left-[72%] w-0 border-l-2 border-koralle" aria-hidden="true" />
      </div>

      <p className="mt-4 flex items-start gap-2 text-[13.5px] leading-snug text-ink">
        <span className="mt-[5px] h-2.5 w-2.5 flex-none rounded-full bg-koralle" aria-hidden="true" />
        Objekt verkauft: daraus entsteht nicht automatisch ein Rückzahlungsanspruch für den Anleger.
      </p>
      <p className="mt-3 text-[11.5px] text-muted">
        Schematische Darstellung ohne Zeitangaben. Maßgeblich sind die konkreten Beteiligungsbedingungen.
      </p>
    </figure>
  );
}

function InlineCta() {
  return (
    <aside className="my-10 rounded-md border border-line p-6 sm:p-7">
      <div className="subheading text-[12px] uppercase tracking-[0.12em] text-gold-deep">Die Bedingungen im Detail</div>
      <p className="subheading mt-2 text-[19px] leading-snug text-navy">
        Mindestlaufzeit, Kündigungsfristen und Rückzahlung bei der {offer.issuer}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">
        Prüfen Sie anhand der vollständigen Unterlagen, ob die Beteiligung zu Ihrem Zeithorizont passt. Kostenlos und
        unverbindlich.
      </p>
      <Button variant="primary" size="md" href={landingHref()} className="mt-5">
        Unterlagen ansehen
      </Button>
    </aside>
  );
}

function Checklist() {
  return (
    <aside className="my-12 rounded-md bg-navy p-6 text-white sm:p-8">
      <div className="subheading text-[12px] uppercase tracking-[0.12em] text-gold">Vor der Entscheidung</div>
      <p className="subheading mt-2 text-[20px] leading-snug">Sechs Fragen an den eigenen Zeithorizont</p>
      <ol className="mt-5 flex flex-col gap-3.5">
        {checklist.map((q, i) => (
          <li key={q} className="flex gap-3.5 text-[15.5px] leading-snug text-fog">
            <span className="subheading flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold text-[12px] text-navy">
              {i + 1}
            </span>
            {q}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ClosingQuestion() {
  return (
    <section className="mt-12 border-t-[3px] border-navy pt-8">
      <p className="text-[16px] leading-relaxed text-muted" style={serif}>
        Vor einer Investitionsentscheidung lohnt es sich deshalb, die Frage zu stellen:
      </p>
      <p className="font-serif-display mt-3 text-[26px] leading-tight text-navy [text-wrap:balance] sm:text-[32px]">
        {closingQuestion}
      </p>
      <div className="mt-8 rounded-md bg-cream p-6 sm:p-7">
        <p className="text-[15.5px] leading-relaxed text-ink">
          Die {offer.issuer} stellt ihre Beteiligungsbedingungen in einem kostenlosen Infopaket zusammen. So können Sie
          in Ruhe prüfen, ob die Bindung zu Ihren Plänen passt.
        </p>
        <Button variant="gold" size="lg" href={landingHref()} className="mt-5 w-full sm:w-auto">
          Infopaket anfordern
        </Button>
      </div>
    </section>
  );
}
