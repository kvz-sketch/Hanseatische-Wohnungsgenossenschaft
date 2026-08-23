// Oversized, near-invisible watermark word sat behind a section title.
export function GhostWord({
  children,
  className = "text-navy",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`ghost-word ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}
