import { Button } from "./ui/Button";
import { company } from "../data/content";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section
      id="kontakt"
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-20 text-center sm:px-8 lg:px-11"
      style={{ clipPath: "polygon(0 24px, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-koralle/15 blur-[100px]"
        aria-hidden="true"
      />
      <Reveal className="relative mx-auto max-w-[640px]">
        <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
          Nächster Schritt
        </span>
        <h2 className="font-serif-display mt-3 text-[26px] font-normal text-white sm:text-[32px]">
          Lernen Sie die Gruppe im Gespräch kennen
        </h2>
        <p className="subheading mt-3 text-[13.5px] text-fog">
          {company.address} · {company.phone}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="gold"
            size="lg"
            href={`mailto:${company.email}`}
            className="animate-pulse-ring"
          >
            Termin vereinbaren
          </Button>
          <Button variant="on-navy" size="lg" href={`tel:${company.phone.replace(/\s/g, "")}`}>
            {company.phone}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
