import { useState } from "react";
import { rgbLabel } from "../../lib/color";

export function ColorSwatch({
  name,
  hex,
  role,
  size = "md",
}: {
  name: string;
  hex: string;
  role?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // Clipboard API unavailable (older browser / non-secure context) — swallow silently.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const swatchHeight = { sm: "h-14", md: "h-24", lg: "h-32" }[size];
  const isLight = hex === "#F5F5F5" || hex === "#FFFFFF";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group block w-full text-left"
      title={`${hex} kopieren`}
    >
      <div
        className={`relative w-full ${swatchHeight} rounded-[3px] transition-transform duration-150 group-hover:-translate-y-0.5 group-active:translate-y-0`}
        style={{
          backgroundColor: hex,
          boxShadow: isLight ? "inset 0 0 0 1px rgba(20,26,70,0.12)" : undefined,
        }}
      >
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.1em] opacity-0 transition-opacity group-hover:opacity-100 ${
            isLight ? "text-navy" : "text-white"
          }`}
        >
          {copied ? "Kopiert ✓" : "Hex kopieren"}
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-navy">{name}</span>
        <span className="font-mono text-[11px] text-muted">{copied ? "Kopiert!" : hex}</span>
      </div>
      {role && <div className="mt-0.5 text-[11px] text-muted">{role}</div>}
      <div className="font-mono text-[10.5px] text-fog">RGB {rgbLabel(hex)}</div>
    </button>
  );
}
