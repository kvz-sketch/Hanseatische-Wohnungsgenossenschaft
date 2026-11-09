// Hansea Grow wordmark: the group's roof line over the name, set in the GIG
// display face. The coral bar chart under the roof nods to "Grow".
export function GrowLogo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? "#141A46" : "#FFFFFF";
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none" aria-hidden="true">
        <path
          d="M2 13 L17 2 L32 13"
          stroke={ink}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 24 V18 M17 24 V13 M24 24 V16" stroke="#F97768" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif-display text-[18px] uppercase tracking-[0.04em]" style={{ color: ink }}>
          Hansea <span className="text-gold">Grow</span>
        </span>
        <span
          className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: tone === "dark" ? "#5a5f78" : "#c3c6d6" }}
        >
          Gerlach Immobilien Gruppe
        </span>
      </span>
    </span>
  );
}
