import { brands } from "../data/content";
import { Reveal } from "./Reveal";
import { GhostWord } from "./GhostWord";

const accentBorder: Record<string, string> = {
  gold: "border-t-gold",
  koralle: "border-t-koralle",
  flat: "border-t-line",
};

export function BrandArchitecture() {
  return (
    <section className="relative overflow-hidden bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <GhostWord className="text-navy">Struktur</GhostWord>
      <div className="relative mx-auto max-w-[1200px]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            Markenarchitektur
          </span>
          <h2 className="font-serif-display mt-3 max-w-[560px] text-[26px] text-navy sm:text-[30px]">
            Eine Dachmarke, klar getrennte Aufgaben
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10 flex flex-col items-center gap-4">
          <div className="subheading rounded-[4px] bg-navy px-8 py-3 text-[15px] text-white shadow-[0_10px_28px_rgba(20,26,70,0.25)]">
            Gerlach Immobilien Gruppe
          </div>
          <div className="h-4 w-px bg-navy/25" />
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {brands.map((b, i) => (
              <Reveal key={b.name} delay={400 + i * 45}>
                <div
                  className={`subheading min-w-0 rounded-[4px] border-t-2 bg-white px-2 py-3 text-center text-[9.5px] uppercase leading-snug tracking-[0.04em] text-navy break-words hyphens-auto transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(20,26,70,0.12)] ${accentBorder[b.accent]}`}
                >
                  {b.name.replace(/\.de$/, "")}
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
