import { team } from "../data/content";
import { Reveal } from "./Reveal";

export function AboutTeam() {
  return (
    <section id="ueber-uns" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 gap-11 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            Über uns
          </span>
          <h2 className="font-serif-display mt-3 text-[26px] font-normal leading-[1.25] text-navy sm:text-[30px]">
            Nachhaltige Immobilienentwicklung in Norddeutschland
          </h2>
          <p className="mt-4 max-w-[440px] text-[13.5px] leading-relaxed text-ink">
            Die Gerlach Immobilien Gruppe deckt die gesamte Wertschöpfungskette von der Auswahl bis
            zur Vermarktung von Immobilien ab. Wir gestalten sanierungsbedürftige
            Mehrfamilienhäuser nachhaltig, schaffen modernen Wohnraum nach ästhetischen und
            ökologischen Maßstäben und leisten damit einen Beitrag zum Klimaschutz.
          </p>
        </Reveal>

        <Reveal delay={140} className="rounded-md bg-navy p-7 shadow-[0_20px_44px_rgba(20,26,70,0.2)]">
          <div className="subheading mb-4 text-[11px] uppercase tracking-[0.14em] text-fog">
            Leitung
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {team.map((m) => (
              <div
                key={m.name}
                className="border-l-2 border-gold pl-3 transition-colors hover:border-koralle"
              >
                <div className="subheading text-[13.5px] text-white">{m.name}</div>
                <div className="text-[11px] text-fog">{m.role}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
