import { brands } from "../data/content";
import { Reveal } from "./Reveal";
import { GhostWord } from "./GhostWord";
import { BrandTile } from "./BrandTile";

export function BrandGrid() {
  return (
    <section id="marken" className="relative overflow-hidden bg-navy px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <GhostWord className="text-white">Marken</GhostWord>
      <div className="relative mx-auto max-w-[1200px]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Unsere Marken
          </span>
          <h2 className="font-serif-display mt-3 max-w-[560px] text-[26px] text-white sm:text-[30px]">
            Eine Gruppe, sechs Wege zum gleichen Ziel
          </h2>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, i) => (
            <Reveal key={b.name} delay={(i % 3) * 90}>
              <BrandTile brand={b} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
