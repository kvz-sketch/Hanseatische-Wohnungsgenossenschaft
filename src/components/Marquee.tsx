import { brands } from "../data/content";

export function Marquee() {
  const names = brands.map((b) => b.name);
  const loop = [...names, ...names];

  return (
    <div className="overflow-hidden border-b border-koralle/30 bg-navy-deep py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="subheading flex items-center gap-10 text-[12px] uppercase tracking-[0.14em] text-fog/80"
          >
            {name}
            <span className="text-koralle">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
