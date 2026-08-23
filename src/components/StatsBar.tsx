import { stats } from "../data/content";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { GhostWord } from "./GhostWord";

export function StatsBar() {
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-navy-deep">
      <GhostWord className="text-white">Fakten</GhostWord>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-12 text-center sm:px-8 md:grid-cols-4 lg:px-11">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div className="subheading text-[36px] text-white sm:text-[40px]">
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
