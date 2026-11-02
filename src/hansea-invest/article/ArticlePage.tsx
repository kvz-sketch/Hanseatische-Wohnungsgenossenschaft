import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import logoNavy from "../assets/logo-hanseatische-invest-navy.png";
import logoWhite from "../assets/logo-hanseatische-invest-white.png";
import { legal, offer } from "../content";
import { article, closingCta, modelCta, riskNotice, sections, type Block } from "./content";

// The landing page lives at /infopaket/ on the live subdomain. Taboola click id
// and UTM parameters are carried over so leads stay attributed to the ad that
// brought the reader in. VITE_LANDING_URL sets the target at build time.
function landingHref() {
  const base = (import.meta.env.VITE_LANDING_URL as string | undefined) ?? "../";
  return `${base}${window.location.search}#infopaket`;
}

const serif = { fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif' };

// Editorial extras placed after the section with the given id.
const inserts: Record<string, ReactNode> = {
  praxis: <ModelCta />,
  kapitalbindung: <TwoTimeframes />,
};

export function ArticlePage() {
  return (
    <div className="bg-white">
      <ReadingProgress />
      <div className="bg-navy-deep px-5 py-1.5 text-center text-[11px] tracking-[0.08em] text-fog/80">
        <span className="subheading uppercase text-gold">Anzeige</span> · Ein Beitrag der {offer.issuer}
      </div>
      <div className="border-b border-line px-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-4 py-2.5">
          <span className="subheading text-[11px] uppercase tracking-[0.18em] text-gold-deep">{article.kicker}</span>
          <img src={logoNavy} alt={offer.issuer} className="h-11 w-auto sm:h-12" />
        </div>
      </div>

      <main className="px-5 pb-16">
        <article className="mx-auto max-w-[720px]">
          <header className="pt-10 pb-8 sm:pt-14">
            <h1 className="font-serif-display text-[29px] leading-[1.15] text-navy hyphens-auto sm:hyphens-none [text-wrap:balance] sm:text-[44px]">
              {article.title}
            </h1>
            <p className="mt-5 text-[19px] font-semibold leading-[1.55] text-ink sm:text-[21px]" style={serif}>
              {article.dek}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-[12.5px] text-muted">
              <span>Anzeige · {offer.issuer}</span>
              <span aria-hidden="true">·</span>
              <span>{article.kicker}</span>
              <span aria-hidden="true">·</span>
              <span>ca. {article.readingMinutes} Minuten Lesezeit</span>
            </div>
          </header>

          {sections.map((s) => (
            <Fragment key={s.id}>
              <section
                id={s.id}
                className={s.id === "sechs-fragen" ? "mt-12 rounded-md bg-navy p-6 text-white sm:p-8" : "mt-10"}
              >
                <h2
                  className={`subheading text-[22px] leading-snug hyphens-auto sm:hyphens-none [text-wrap:balance] sm:text-[25px] ${
                    s.id === "sechs-fragen" ? "text-white" : "text-navy"
                  }`}
                >
                  {s.heading}
                </h2>
                <div className="mt-4 flex flex-col gap-5">
                  {s.blocks.map((b, i) => (
                    <BlockView key={i} block={b} dark={s.id === "sechs-fragen"} />
                  ))}
                </div>
              </section>
              {inserts[s.id]}
            </Fragment>
          ))}

          <ClosingCta />
        </article>
      </main>

      <footer className="bg-navy-deep px-5 py-10 text-fog">
        <div className="mx-auto max-w-[720px]">
          <img src={logoWhite} alt={offer.issuer} className="h-14 w-auto" />
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

function BlockView({ block, dark }: { block: Block; dark: boolean }) {
  if (block.kind === "p") {
    return (
      <p className="text-[18px] leading-[1.7] text-ink sm:text-[19px]" style={serif}>
        {block.text}
      </p>
    );
  }
  if (block.kind === "highlight") {
    return (
      <p
        className="border-l-[3px] border-gold py-1 pl-5 text-[19px] font-semibold leading-[1.55] text-navy sm:text-[21px]"
        style={serif}
      >
        {block.text}
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-4">
      {block.items.map((item, i) => (
        <li
          key={item.title}
          className={`flex gap-4 rounded-md p-4 sm:p-5 ${dark ? "bg-white/[0.06]" : "border border-line"}`}
        >
          <span className="subheading flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gold text-[13px] text-navy">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className={`subheading text-[16.5px] leading-snug ${dark ? "text-white" : "text-navy"}`}>{item.title}</div>
            <p className={`mt-1.5 text-[16px] leading-[1.6] ${dark ? "text-fog" : "text-ink"}`} style={serif}>
              {item.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
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

// Schematic of the article's key distinction: how long a property project runs
// versus how long the investor's capital stays bound. Not to scale.
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
            Mindest&shy;laufzeit 12 Monate
          </div>
          <div className="w-[30%] rounded-[2px] bg-gold/70 px-1 py-2 text-center text-[10.5px] font-semibold leading-tight text-navy sm:text-[12px]">
            Kündigungs&shy;frist 9 Monate
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
        Schematische Darstellung, nicht maßstabsgetreu. Maßgeblich sind die Satzung und die Beteiligungsbedingungen.
      </p>
    </figure>
  );
}

function ModelCta() {
  return (
    <aside className="my-10 rounded-md border border-line bg-mist p-6 sm:p-7">
      <p className="subheading text-[19px] leading-snug text-navy">{modelCta.heading}</p>
      <p className="mt-2 text-[16px] leading-relaxed text-ink" style={serif}>
        {modelCta.text}
      </p>
      <p className="mt-2 text-[16px] leading-relaxed text-ink" style={serif}>
        {modelCta.note}
      </p>
      <Button variant="primary" size="md" href={landingHref()} className="mt-5 w-full whitespace-normal! text-center sm:w-auto">
        {modelCta.button}
      </Button>
    </aside>
  );
}

function ClosingCta() {
  return (
    <section className="mt-12 border-t-[3px] border-navy pt-8">
      <h3 className="font-serif-display text-[24px] leading-tight text-navy [text-wrap:balance] sm:text-[28px]">
        {closingCta.heading}
      </h3>
      <div className="mt-4 flex flex-col gap-4">
        {closingCta.paragraphs.map((text) => (
          <p key={text.slice(0, 40)} className="text-[17px] leading-[1.65] text-ink" style={serif}>
            {text}
          </p>
        ))}
      </div>
      <Button variant="gold" size="lg" href={landingHref()} className="mt-6 w-full whitespace-normal! text-center sm:w-auto">
        {closingCta.button}
      </Button>
      <p className="mt-8 text-[12.5px] italic leading-relaxed text-muted">{riskNotice}</p>
    </section>
  );
}
