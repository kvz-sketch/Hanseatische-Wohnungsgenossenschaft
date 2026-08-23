import { brands } from "../data/content";

const accentBorder: Record<string, string> = {
  gold: "border-t-gold",
  koralle: "border-t-koralle",
  flat: "border-t-line",
};

export function BrandArchitecture() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Markenarchitektur
        </span>
        <h2 className="font-serif-display mt-3 max-w-[560px] text-[26px] font-normal text-navy sm:text-[30px]">
          Eine Dachmarke, klar getrennte Aufgaben
        </h2>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="font-serif-display rounded-[4px] bg-navy px-8 py-3 text-[17px] text-white">
            Gerlach Immobilien Gruppe
          </div>
          <div className="h-4 w-px bg-navy/25" />
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-9">
            {brands.map((b) => (
              <div
                key={b.name}
                className={`min-w-0 rounded-[4px] border-t-2 bg-white px-2 py-3 text-center text-[10px] leading-snug text-navy break-words hyphens-auto ${accentBorder[b.accent]}`}
              >
                {b.name.replace(/\.de$/, "")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
