import { CountUp, GhostWord, Reveal } from "./shared";
import { marquee, stats } from "../content";

export function Marquee() {
  const loop = [...marquee, ...marquee];
  return (
    <div className="overflow-hidden border-b border-koralle/30 bg-navy-deep py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="subheading flex items-center gap-10 text-[12px] uppercase tracking-[0.14em] text-fog/80"
          >
            {item}
            <span className="text-koralle">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatsBar() {
  return (
    <div className="relative overflow-hidden bg-navy">
      <GhostWord className="text-white">Fakten</GhostWord>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-12 text-center sm:px-8 md:grid-cols-4 lg:px-11">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div className="subheading text-[34px] text-white sm:text-[40px]">
              <CountUp value={s.value} />
            </div>
            <div className="subheading mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-fog">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
