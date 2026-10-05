import type { Platform } from "../../data/socialReport";

const fmt = (v: number) => new Intl.NumberFormat("de-DE").format(v);

export function PlatformBreakdown({ platforms }: { platforms: Platform[] }) {
  const maxReach = Math.max(...platforms.map((p) => p.reach));

  return (
    <div className="rounded-md border border-navy/8 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="subheading text-[15px] text-navy">Reichweite nach Kanal</h3>
        <span className="text-[11px] text-muted">Letzte 30 Tage</span>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {platforms.map((p) => (
          <div key={p.id}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
                <span className="text-[13.5px] font-bold text-navy">{p.name}</span>
              </div>
              <div className="flex items-baseline gap-3 text-[12px] [font-variant-numeric:tabular-nums]">
                <span className="text-muted">{fmt(p.follower)} Follower</span>
                <span className={p.followerDelta >= 0 ? "font-bold text-[#1f8a5a]" : "font-bold text-koralle"}>
                  {p.followerDelta >= 0 ? "+" : ""}
                  {fmt(p.followerDelta)}
                </span>
              </div>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full"
                style={{ width: `${(p.reach / maxReach) * 100}%`, backgroundColor: p.color }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted [font-variant-numeric:tabular-nums]">
              <span>{fmt(p.reach)} Reichweite</span>
              <span>{p.engagementRate.toLocaleString("de-DE")} % Engagement</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
