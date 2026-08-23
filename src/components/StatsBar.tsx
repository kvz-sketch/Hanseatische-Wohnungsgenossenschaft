import { stats } from "../data/content";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

export function StatsBar() {
  return (
    <div className="border-b border-navy/8 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-10 text-center sm:px-8 md:grid-cols-4 lg:px-11">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div className="font-serif-display text-[34px] text-navy sm:text-[38px]">
              <CountUp value={s.value} />
            </div>
            <div className="subheading mt-1.5 text-[10.5px] uppercase tracking-[0.08em] text-muted">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
