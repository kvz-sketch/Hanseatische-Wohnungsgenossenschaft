// Two interlocking rounded squares, the mark used in the Taboola ad creative.
export function HanseaMark({ size = 28, color = "#141A46", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="17" height="17" rx="4.5" stroke={color} strokeWidth="2.6" />
      <rect x="12" y="12" width="17" height="17" rx="4.5" stroke="#DDB851" strokeWidth="2.6" />
    </svg>
  );
}
