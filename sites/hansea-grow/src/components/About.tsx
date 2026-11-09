import { Button, GhostWord, GigMark, Reveal } from "./shared";
import { SectionTitle } from "./SectionTitle";
import { links, steps } from "../content";
import ueberUnsImg from "../assets/ueber-uns.jpg";
import unterschriftImg from "../assets/unterschrift.jpg";

export function About() {
  return (
    <section id="ueber-uns" className="bg-mist px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="relative overflow-hidden rounded-md">
          <img
            src={ueberUnsImg}
            alt="Paar entspannt auf dem Sofa"
            loading="lazy"
            className="h-[180px] w-full object-cover sm:h-[240px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy/60 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1.5 bg-koralle" />
          <div className="absolute inset-0 flex flex-col justify-center px-7 sm:px-12">
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
              Hansea Grow
            </span>
            <h2 className="font-serif-display mt-2 text-[34px] text-white sm:text-[48px]">Über uns</h2>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[15px] leading-relaxed text-ink">
              <strong className="text-navy">Hansea Grow</strong> ermöglicht dir die Beteiligung an
              realen Wohnimmobilien – ganz ohne eine eigene Wohnung zu kaufen, ohne einen Kredit
              aufzunehmen und ohne spekulatives Trading. Stattdessen partizipierst du strukturiert
              und langfristig an einem nachhaltigen Immobilienbestand.
            </p>
            <p className="subheading mt-6 text-[18px] text-navy">
              Digital. <span className="text-koralle">Strukturiert.</span>{" "}
              <span className="text-gold-deep">Transparent.</span>
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="rounded-md border border-line border-t-2 border-t-gold bg-white p-7 shadow-[0_2px_10px_rgba(20,26,70,0.06)]">
              <div className="flex items-center gap-2.5">
                <GigMark size={34} color="#141A46" />
                <span className="font-serif-display text-[22px] text-navy">GIG</span>
              </div>
              <p className="mt-5 text-[14px] leading-relaxed text-ink">
                <strong className="text-navy">Hansea Grow</strong> ist Teil der Gerlach Immobilien
                Gruppe. Gemeinsam schaffen wir einen modernen, digitalen Zugang zu
                genossenschaftlichem Vermögensaufbau – transparent, langfristig und substanzbasiert.
              </p>
              <Button
                variant="primary"
                size="md"
                href={links.gig}
                target="_blank"
                rel="noreferrer"
                className="mt-6"
              >
                Mehr über die GIG erfahren
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section
      id="so-funktionierts"
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-11"
    >
      <GhostWord className="text-navy">Prozess</GhostWord>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionTitle
              eyebrow="In drei Schritten"
              intro="An aktuellen Immobilienprojekten passiv partizipieren und von unserer jahrelangen Erfahrung profitieren. Mit voller Transparenz über unser digitales Mitgliederportal."
            >
              So funktioniert's
            </SectionTitle>
            <Reveal delay={80}>
              <Button variant="gold" size="md" href="#kontakt" className="mt-7">
                Mehr erfahren
              </Button>
            </Reveal>
          </div>
          <Reveal delay={140} className="overflow-hidden rounded-md shadow-[0_20px_44px_rgba(20,26,70,0.14)]">
            <img
              src={unterschriftImg}
              alt="Unterschrift auf einem Beitrittsformular"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
          </Reveal>
        </div>

        <div className="relative mt-14">
          <div className="absolute top-[22px] left-0 right-0 hidden h-px bg-navy/10 md:block" />
          <Reveal
            delay={120}
            className="absolute top-[22px] left-0 hidden h-px w-full origin-left animate-draw bg-gradient-to-r from-koralle via-gold to-transparent md:block"
          />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 130}>
                <div className="subheading relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-koralle text-[18px] text-white shadow-[0_8px_20px_rgba(249,119,104,0.35)]">
                  {s.step}
                </div>
                <h3 className="subheading mt-4 mb-2 text-[15px] text-navy">{s.title}</h3>
                {s.paragraphs.map((p) => (
                  <p key={p} className="mt-2 text-[13px] leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-10 border-l-2 border-gold pl-4 text-[12.5px] text-muted">
          *Es handelt sich um eine unternehmerische Beteiligung und kein Festgeldprodukt.
        </Reveal>
      </div>
    </section>
  );
}
