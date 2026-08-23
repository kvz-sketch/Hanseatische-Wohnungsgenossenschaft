import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ArchitectureArt } from "./ArchitectureArt";

export function Hero() {
  return (
    <section
      id="gruppe"
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep"
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-koralle" />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-11 lg:px-11 lg:py-24">
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="gold">9 Gesellschaften</Badge>
            <Badge variant="koralle">Norddeutschland</Badge>
            <Badge variant="outline">Hamburg · Köln</Badge>
          </div>

          <h1 className="font-serif-display max-w-[560px] text-[38px] font-normal leading-[1.1] text-white sm:text-[46px] lg:text-[56px]">
            Wir entwickeln <span className="text-gold">Werte.</span>
            <br />
            Ihr Weg zum nachhaltigen Vermögensaufbau.
          </h1>

          <div className="my-6 h-[3px] w-16 bg-koralle" />

          <p className="max-w-[440px] text-[15px] leading-relaxed text-fog">
            Die Gerlach Immobilien Gruppe bündelt neun spezialisierte Gesellschaften unter einem
            Qualitätsstandard — von der eigenen Kapitalanlage-Wohnung über die genossenschaftliche
            Beteiligung bis zum digitalen Einstieg. Wir decken die gesamte Wertschöpfungskette ab:
            von der Auswahl bis zur Vermarktung Ihrer Immobilie.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" href="#kontakt">
              Kostenloses Erstgespräch
            </Button>
            <Button variant="on-navy" size="lg" href="#marken">
              Unsere Marken ansehen
            </Button>
          </div>
        </div>

        <div className="relative hidden min-h-[300px] lg:block">
          <div className="absolute inset-0 left-4 top-8 overflow-hidden rounded-md border border-white/15 bg-white/[0.06]">
            <ArchitectureArt className="h-full w-full" />
          </div>
          <div className="absolute -bottom-5 -left-6 w-[200px] rounded-md border-t-[3px] border-koralle bg-white p-5 shadow-[0_16px_34px_rgba(20,26,70,0.35)]">
            <div className="font-serif-display text-[30px] leading-none text-navy">10 Jahre</div>
            <div className="mt-1 text-[11px] text-muted">
              Mietgarantie auf vermittelte Wohnungen
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
