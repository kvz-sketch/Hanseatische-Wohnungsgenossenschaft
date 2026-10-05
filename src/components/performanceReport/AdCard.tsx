import { useEffect, useState } from "react";
import type { AdStat } from "../../data/performanceReport";

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");

function PlaceholderThumb() {
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-[3px] border border-dashed border-navy/15 bg-mist">
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-fog">
        <rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 16.5 9 12l3.5 3.5L16 12l4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
      />
    </div>
  );
}

export function AdCard({ ad }: { ad: AdStat }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="rounded-md border border-navy/8 bg-white p-3">
      {ad.image ? (
        <>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[3px] border border-navy/8"
          >
            <img src={ad.image} alt={ad.name} className="h-full w-full object-cover transition-transform hover:scale-105" />
          </button>
          {lightboxOpen && <Lightbox src={ad.image} alt={ad.name} onClose={() => setLightboxOpen(false)} />}
        </>
      ) : (
        <PlaceholderThumb />
      )}
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <span className="text-[12px] font-bold leading-snug text-navy">{ad.name}</span>
      </div>
      {ad.badge && (
        <span className="mt-1 inline-block rounded-[2px] bg-navy/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-muted">
          {ad.badge}
        </span>
      )}

      <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-line pt-2.5 text-[11px] [font-variant-numeric:tabular-nums]">
        <div>
          <div className="font-bold text-navy">{ad.metaResults ?? "—"}</div>
          <div className="text-[10px] text-muted">Meta-Ergebnisse</div>
        </div>
        <div>
          <div className="font-bold text-navy">{ad.perspectiveLeads ?? "—"}</div>
          <div className="text-[10px] text-muted">Perspective-Leads</div>
        </div>
        <div>
          <div className="font-bold text-navy">{fmtEur(ad.spend)}</div>
          <div className="text-[10px] text-muted">Ausgegeben</div>
        </div>
        <div>
          <div className="font-bold text-navy">{ad.metaCostPerResult != null ? fmtEur(ad.metaCostPerResult) : "—"}</div>
          <div className="text-[10px] text-muted">Pro Ergebnis</div>
        </div>
        <div>
          <div className="font-bold text-navy">{fmtNum(ad.reach)}</div>
          <div className="text-[10px] text-muted">Reichweite</div>
        </div>
        <div>
          <div className="font-bold text-navy">{fmtNum(ad.impressions)}</div>
          <div className="text-[10px] text-muted">Impressionen</div>
        </div>
      </div>
    </div>
  );
}
