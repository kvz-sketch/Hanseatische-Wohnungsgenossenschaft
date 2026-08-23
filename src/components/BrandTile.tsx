import type { Brand } from "../data/content";

const accentText: Record<Brand["accent"], string> = {
  gold: "text-gold",
  koralle: "text-koralle",
  flat: "text-fog",
};

const accentGlow: Record<Brand["accent"], string> = {
  gold: "group-hover:shadow-[0_20px_50px_rgba(221,184,81,0.25)]",
  koralle: "group-hover:shadow-[0_20px_50px_rgba(249,119,104,0.25)]",
  flat: "group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]",
};

export function BrandTile({ brand }: { brand: Brand }) {
  const isExternal = brand.href.startsWith("http");
  const words = brand.name.split(" ");
  const monogram =
    words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : brand.name.slice(0, 2).toUpperCase();

  return (
    <a
      href={brand.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`group relative block aspect-[4/5] overflow-hidden rounded-sm border border-white/10 bg-navy-deep transition-all duration-300 hover:-translate-y-1 ${accentGlow[brand.accent]}`}
    >
      <span
        className={`font-serif-display pointer-events-none absolute -right-3 -top-6 select-none text-[110px] leading-none opacity-[0.07] ${accentText[brand.accent]}`}
        aria-hidden="true"
      >
        {monogram}
      </span>

      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <span
          className={`subheading text-[10px] uppercase tracking-[0.14em] ${accentText[brand.accent]}`}
        >
          {brand.category}
        </span>

        <div>
          <h3 className="subheading text-[19px] leading-snug text-white">{brand.name}</h3>
          <p className="mt-2 max-h-0 overflow-hidden text-[12px] leading-relaxed text-fog opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-[120px] group-hover:opacity-100">
            {brand.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
            Ansehen
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100 ${accentText[brand.accent]}`}
      />
    </a>
  );
}
