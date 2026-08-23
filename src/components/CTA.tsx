import { Button } from "./ui/Button";
import { company } from "../data/content";

export function CTA() {
  return (
    <section id="kontakt" className="bg-navy px-5 py-16 text-center sm:px-8 lg:px-11">
      <div className="mx-auto max-w-[640px]">
        <h2 className="font-serif-display text-[22px] font-normal text-white sm:text-[26px]">
          Lernen Sie die Gruppe im Gespräch kennen
        </h2>
        <p className="mt-3 text-[13.5px] text-fog">
          {company.address} · {company.phone}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button variant="gold" size="lg" href={`mailto:${company.email}`}>
            Termin vereinbaren
          </Button>
          <Button variant="on-navy" size="lg" href={`tel:${company.phone.replace(/\s/g, "")}`}>
            {company.phone}
          </Button>
        </div>
      </div>
    </section>
  );
}
