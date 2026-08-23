import { stats } from "../data/content";

export function StatsBar() {
  return (
    <div className="border-b border-navy/8 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-9 text-center sm:px-8 md:grid-cols-4 lg:px-11">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-serif-display text-[30px] text-navy">{s.value}</div>
            <div className="mt-1 text-[11px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
