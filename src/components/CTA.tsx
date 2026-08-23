import { company } from "../data/content";
import { Reveal } from "./Reveal";
import { ContactForm } from "./ContactForm";
import { GhostWord } from "./GhostWord";

export function CTA() {
  return (
    <section
      id="kontakt"
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-20 sm:px-8 lg:px-11"
      style={{ clipPath: "polygon(0 24px, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-koralle/15 blur-[100px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">Kontakt</GhostWord>

      <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Nächster Schritt
          </span>
          <h2 className="font-serif-display mt-3 max-w-[420px] text-[28px] text-white sm:text-[34px]">
            Lernen Sie die Gruppe im Gespräch kennen
          </h2>
          <p className="mt-4 max-w-[380px] text-[13.5px] leading-relaxed text-fog">
            Schreiben Sie uns kurz, worum es geht — wir melden uns innerhalb eines Werktags mit
            einem Vorschlag für ein kostenloses Erstgespräch.
          </p>

          <div className="mt-8 flex flex-col gap-3 text-[13.5px] text-fog">
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-gold">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20 text-[13px]">
                ☎
              </span>
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-gold">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20 text-[13px]">
                ✉
              </span>
              {company.email}
            </a>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20 text-[13px]">
                ⚑
              </span>
              {company.address}
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
