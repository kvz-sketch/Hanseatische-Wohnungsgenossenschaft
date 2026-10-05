export function StatTile({
  label,
  value,
  delta,
  deltaDirection,
  sub,
}: {
  label: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down";
  sub: string;
}) {
  const positive = deltaDirection === "up";
  return (
    <div className="rounded-md border border-navy/8 bg-white p-6">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fog">{label}</span>
      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="font-serif-display text-[30px] leading-none text-navy [font-variant-numeric:tabular-nums]">
          {value}
        </span>
        <span
          className={`text-[12px] font-bold [font-variant-numeric:tabular-nums] ${
            positive ? "text-[#1f8a5a]" : "text-koralle"
          }`}
        >
          {positive ? "▲" : "▼"} {delta}
        </span>
      </div>
      <div className="mt-1.5 text-[11px] text-muted">{sub}</div>
    </div>
  );
}
