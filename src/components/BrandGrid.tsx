import { brands } from "../data/content";
import { Card } from "./ui/Card";
import { Reveal } from "./Reveal";

const glow: Record<string, string> = {
  gold: "hover:shadow-[0_18px_40px_rgba(221,184,81,0.25)]",
  koralle: "hover:shadow-[0_18px_40px_rgba(249,119,104,0.25)]",
  flat: "hover:shadow-[0_18px_40px_rgba(20,26,70,0.14)]",
};

export function BrandGrid() {
  return (
    <section id="marken" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            Unsere Marken
          </span>
          <h2 className="font-serif-display mt-3 max-w-[560px] text-[26px] font-normal text-navy sm:text-[30px]">
            Eine Gruppe, neun Wege zum gleichen Ziel
          </h2>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, i) => (
            <Reveal key={b.name} delay={(i % 3) * 90}>
              <a href={b.href} target="_blank" rel="noreferrer" className="block h-full">
                <Card
                  accent={b.accent}
                  className={`group h-full transition-shadow duration-300 ${glow[b.accent]}`}
                >
                  <div className="subheading mb-2 text-[10px] uppercase tracking-[0.14em] text-gold-deep">
                    {b.category}
                  </div>
                  <h3 className="subheading mb-2 text-[16px] leading-snug text-navy transition-colors group-hover:text-koralle">
                    {b.name}
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-muted">{b.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-koralle opacity-0 transition-opacity group-hover:opacity-100">
                    Ansehen <span aria-hidden="true">→</span>
                  </span>
                </Card>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
