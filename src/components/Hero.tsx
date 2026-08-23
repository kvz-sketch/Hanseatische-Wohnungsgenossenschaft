import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ArchitectureArt } from "./ArchitectureArt";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { GhostWord } from "./GhostWord";

export function Hero() {
  return (
    <section
      id="gruppe"
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep"
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-koralle" />
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-koralle/20 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[15%] h-[320px] w-[320px] rounded-full bg-gold/15 blur-[100px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">Werte</GhostWord>

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-11 lg:px-11 lg:py-24">
        <div>
          <Reveal>
            <span className="subheading text-[11px] uppercase tracking-[0.22em] text-gold">
              Gerlach Immobilien Gruppe · Hamburg
            </span>
          </Reveal>

          <Reveal delay={60} className="mt-4 mb-6 flex flex-wrap gap-2">
            <Badge variant="gold">6 Marken</Badge>
            <Badge variant="koralle">Norddeutschland</Badge>
            <Badge variant="outline">Hamburg · Köln</Badge>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="font-serif-display max-w-[600px] text-[42px] leading-[1.06] text-white sm:text-[54px] lg:text-[68px]">
              Wir entwickeln <span className="text-shimmer">Werte.</span>
              <br />
              Ihr Weg zum nachhaltigen Vermögensaufbau.
            </h1>
          </Reveal>

          <Reveal delay={200} className="my-6 h-[3px] w-16 origin-left animate-draw bg-koralle" />

          <Reveal delay={240}>
            <p className="max-w-[440px] text-[15.5px] leading-relaxed text-fog">
              Die Gerlach Immobilien Gruppe bündelt sechs spezialisierte Marken unter einem
              Qualitätsstandard — von der eigenen Kapitalanlage-Wohnung über die
              genossenschaftliche Beteiligung bis zum digitalen Einstieg. Wir decken die gesamte
              Wertschöpfungskette ab: von der Auswahl bis zur Vermarktung Ihrer Immobilie.
            </p>
          </Reveal>

          <Reveal delay={320} className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" href="#kontakt" className="animate-pulse-ring">
              Kostenloses Erstgespräch
            </Button>
            <Button variant="on-navy" size="lg" href="#marken">
              Unsere Marken ansehen
            </Button>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative hidden min-h-[300px] lg:block">
          <div className="absolute inset-0 left-4 top-8 animate-float overflow-hidden rounded-md border border-white/15 bg-white/[0.06]">
            <ArchitectureArt className="h-full w-full" />
          </div>
          <div className="absolute -bottom-5 -left-6 w-[200px] rounded-md border-t-[3px] border-koralle bg-white p-5 shadow-[0_16px_34px_rgba(20,26,70,0.35)]">
            <div className="subheading text-[32px] leading-none text-navy">
              <CountUp value="10" /> Jahre
            </div>
            <div className="subheading mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
              Mietgarantie
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
