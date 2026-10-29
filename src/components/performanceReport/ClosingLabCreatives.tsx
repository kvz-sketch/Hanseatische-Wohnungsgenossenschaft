import { useState } from "react";
import { Lightbox } from "./AdCard";
import {
  creativeImage,
  type ClosingLabCreative,
  type ClosingLabCreativeGroup,
  type ClosingLabTermine,
} from "../../data/closingLabReport";

// Closing Lab creatives, compared from the Termin onwards: the portal only
// names the ad for leads that booked a Termin, and Closing Lab bills per
// Termin, so Termine (not leads) are the unit here. Counts only, no names.

const fmtNum = (v: number) => v.toLocaleString("de-DE");
const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtPct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)} %` : "n. v.");
const fmtDay = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
};

type Totals = Pick<ClosingLabCreative, "termine" | "stattgefunden" | "noShow" | "pipeline" | "bereit" | "disqualifiziert">;

const sum = (list: ClosingLabCreative[]): Totals =>
  list.reduce(
    (t, c) => ({
      termine: t.termine + c.termine,
      stattgefunden: t.stattgefunden + c.stattgefunden,
      noShow: t.noShow + c.noShow,
      pipeline: t.pipeline + c.pipeline,
      bereit: t.bereit + c.bereit,
      disqualifiziert: t.disqualifiziert + c.disqualifiziert,
    }),
    { termine: 0, stattgefunden: 0, noShow: 0, pipeline: 0, bereit: 0, disqualifiziert: 0 },
  );

/** Show-up: Termine held of those that were due (held + no-show). */
const showUp = (t: Totals) => fmtPct(t.stattgefunden, t.stattgefunden + t.noShow);
/** Cost per lead that reached the closing pipeline, at the price per Termin. */
const perPipeline = (t: Totals, price: number) => (t.pipeline > 0 ? fmtEur((t.termine * price) / t.pipeline) : "–");

function FunnelStep({ label, value, sub, strong }: { label: string; value: number; sub?: string; strong?: boolean }) {
  return (
    <div className={`flex-1 rounded-md px-4 py-3 ${strong ? "bg-navy text-white" : "border border-navy/8 bg-white"}`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.1em] ${strong ? "text-gold" : "text-fog"}`}>{label}</div>
      <div className={`mt-1 font-serif-display text-[24px] [font-variant-numeric:tabular-nums] ${strong ? "text-white" : "text-navy"}`}>{fmtNum(value)}</div>
      {sub && <div className={`text-[11px] ${strong ? "text-fog" : "text-muted"}`}>{sub}</div>}
    </div>
  );
}

function CreativeCard({ creative, price }: { creative: ClosingLabCreative; price: number }) {
  const images = creative.images.map(creativeImage).filter((u): u is string => !!u);
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(false);
  const stats: [string, string, boolean?][] = [
    ["Termine", fmtNum(creative.termine), true],
    ["Show-up", showUp(creative)],
    ["In Pipeline", `${creative.pipeline} · ${fmtPct(creative.pipeline, creative.termine)}`, creative.pipeline > 0],
    ["Bereit fürs Closing", fmtNum(creative.bereit)],
    ["Disqualifiziert", fmtNum(creative.disqualifiziert)],
    ["€ je Pipeline-Lead", perPipeline(creative, price)],
  ];
  return (
    <div className="flex flex-col rounded-md border border-navy/8 bg-white p-3">
      {images.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[3px] border border-navy/8 bg-mist"
            aria-label={`Creative ${creative.name} vergrößern`}
          >
            <img src={images[shown]} alt={creative.name} className="h-full w-full object-contain" />
          </button>
          {images.length > 1 && (
            <div className="mt-1.5 flex gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setShown(i)}
                  className={`h-10 w-10 overflow-hidden rounded-[2px] border ${i === shown ? "border-koralle" : "border-navy/10"}`}
                  aria-label={`Motiv ${i + 1} zeigen`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <span className="self-center text-[10.5px] text-muted">{images.length} Motive, im Portal nicht getrennt</span>
            </div>
          )}
          {open && <Lightbox src={images[shown]} alt={creative.name} onClose={() => setOpen(false)} />}
        </>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-[3px] border border-dashed border-navy/15 bg-mist px-4 text-center text-[11px] text-muted">
          {creative.type === "unbekannt" ? "Kein Motiv zuordenbar" : "Motiv folgt"}
        </div>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-[2px] bg-navy/[0.06] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-navy">{creative.type}</span>
        <span className="text-[10.5px] text-muted">
          {creative.firstTermin === creative.lastTermin ? fmtDay(creative.firstTermin) : `${fmtDay(creative.firstTermin)} bis ${fmtDay(creative.lastTermin)}`}
        </span>
      </div>
      <div className="mt-1.5 text-[12.5px] font-bold leading-snug text-navy">{creative.name}</div>
      <div className="mt-1 flex-1 text-[10.5px] leading-snug text-muted">{creative.portalAd}</div>
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-line pt-2.5 text-[11px] [font-variant-numeric:tabular-nums]">
        {stats.map(([label, value, highlight]) => (
          <div key={label}>
            <div className={`font-bold ${highlight ? "text-koralle" : "text-navy"}`}>{value}</div>
            <div className="text-[10px] text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClosingLabCreatives({
  termine,
  groups,
  creatives,
}: {
  termine: ClosingLabTermine;
  groups: ClosingLabCreativeGroup[];
  creatives: ClosingLabCreative[];
}) {
  const price = termine.pricePerTermin;
  const total = sum(creatives);
  const rows = groups
    .map((g) => ({ group: g, list: creatives.filter((c) => c.group === g.id && c.termine > 0) }))
    .filter((r) => r.list.length > 0);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="rounded-md border border-navy/8 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[14px] font-bold text-navy">Vom Lead zum Closing</span>
          <span className="text-[11px] text-muted">{termine.source}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <FunnelStep label="Leads" value={termine.leads} sub={`davon ${termine.ohneTermin} ohne Termin`} />
          <FunnelStep label="Termin gebucht" value={termine.termine} sub={`${fmtPct(termine.termine, termine.leads)} der Leads`} />
          <FunnelStep
            label="Termin stattgefunden"
            value={termine.stattgefunden}
            sub={`Show-up ${fmtPct(termine.stattgefunden, termine.stattgefunden + termine.noShow)} · ${termine.noShow} No-Shows`}
          />
          <FunnelStep label="In der Closing-Pipeline" value={total.pipeline} sub={`${fmtPct(total.pipeline, termine.termine)} der Termine`} strong />
          <FunnelStep label="Bereit fürs Closing" value={total.bereit} />
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{termine.note}</p>
      </div>

      <div className="rounded-md border border-navy/8 bg-white p-5 sm:p-6">
        <span className="text-[14px] font-bold text-navy">Welche Creatives bringen gute Termine?</span>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12px] [font-variant-numeric:tabular-nums]">
            <thead>
              <tr className="border-b border-navy/8 text-[10px] font-bold uppercase tracking-[0.1em] text-fog">
                <th className="py-2 pr-3 font-bold">Creatives</th>
                <th className="py-2 pr-3 font-bold">Zeitraum</th>
                <th className="py-2 pr-3 text-right font-bold">Termine</th>
                <th className="py-2 pr-3 text-right font-bold">Show-up</th>
                <th className="py-2 pr-3 text-right font-bold">In Pipeline</th>
                <th className="py-2 pr-3 text-right font-bold">Disqualifiziert</th>
                <th className="py-2 pr-3 text-right font-bold">Kosten</th>
                <th className="py-2 text-right font-bold">€ je Pipeline-Lead</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ group, list }) => {
                const t = sum(list);
                return (
                  <tr key={group.id} className="border-b border-navy/[0.05]">
                    <td className="py-2.5 pr-3 font-bold text-navy">
                      {group.label}
                      {group.id !== "ohne" && (
                        <span className="ml-1.5 text-[10.5px] font-normal text-muted">
                          {list.length} {list.length === 1 ? "Anzeige" : "Anzeigen"}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{group.period}</td>
                    <td className="py-2.5 pr-3 text-right font-bold text-navy">{t.termine}</td>
                    <td className="py-2.5 pr-3 text-right text-navy">{showUp(t)}</td>
                    <td className={`py-2.5 pr-3 text-right font-bold ${t.pipeline > 0 ? "text-[#1f8a5a]" : "text-navy"}`}>
                      {t.pipeline} · {fmtPct(t.pipeline, t.termine)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-navy">{t.disqualifiziert}</td>
                    <td className="py-2.5 pr-3 text-right text-navy">{fmtEur(t.termine * price)}</td>
                    <td className="py-2.5 text-right font-bold text-navy">{perPipeline(t, price)}</td>
                  </tr>
                );
              })}
              <tr className="text-navy">
                <td className="py-2.5 pr-3 font-bold">Gesamt</td>
                <td />
                <td className="py-2.5 pr-3 text-right font-bold">{total.termine}</td>
                <td className="py-2.5 pr-3 text-right">{showUp(total)}</td>
                <td className="py-2.5 pr-3 text-right font-bold">
                  {total.pipeline} · {fmtPct(total.pipeline, total.termine)}
                </td>
                <td className="py-2.5 pr-3 text-right">{total.disqualifiziert}</td>
                <td className="py-2.5 pr-3 text-right">{fmtEur(total.termine * price)}</td>
                <td className="py-2.5 text-right font-bold">{perPipeline(total, price)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          In Pipeline: nach dem Termin in Bereit fürs 1. Closing, Bedarfsanalyse- oder Objektfindungsphase. Kosten: Termine × {fmtEur(price)}. Leads aus dem Oktober sind jünger;
          ein Teil der Pipeline kann noch disqualifiziert werden.
        </p>
      </div>

      {rows.map(({ group, list }) => (
        <div key={group.id}>
          <div className="flex flex-wrap items-baseline gap-2 border-b border-navy/8 pb-2">
            <span className="text-[13px] font-bold text-navy">{group.label}</span>
            {group.period && <span className="text-[11px] text-muted">{group.period}</span>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[...list]
              .sort((a, b) => b.termine - a.termine)
              .map((c) => (
                <CreativeCard key={c.id} creative={c} price={price} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
