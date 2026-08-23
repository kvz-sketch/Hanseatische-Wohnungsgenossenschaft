import { brands } from "../data/content";
import { Card } from "./ui/Card";

export function BrandGrid() {
  return (
    <section id="marken" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Unsere Marken
        </span>
        <h2 className="font-serif-display mt-3 max-w-[560px] text-[26px] font-normal text-navy sm:text-[30px]">
          Eine Gruppe, neun Wege zum gleichen Ziel
        </h2>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <a key={b.name} href={b.href} target="_blank" rel="noreferrer" className="block">
              <Card accent={b.accent} className="h-full">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  {b.category}
                </div>
                <h3 className="font-serif-display mb-2 text-[19px] font-normal text-navy">
                  {b.name}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-muted">{b.description}</p>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
