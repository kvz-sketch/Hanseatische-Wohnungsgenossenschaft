import { useState } from "react";
import type { Campaign } from "../../data/performanceReport";
import { AdCard } from "./AdCard";

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[13.5px] font-bold text-navy [font-variant-numeric:tabular-nums]">{value}</div>
      <div className="text-[10.5px] text-muted">{label}</div>
      {sub && <div className="text-[10px] text-fog">{sub}</div>}
    </div>
  );
}

export function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const recalculatedCpl = campaign.perspectiveLeads > 0 ? campaign.spend / campaign.perspectiveLeads : null;
  const isActive = campaign.status === "active";

  return (
    <div className="rounded-md border border-navy/8 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-4 p-5 text-left sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full ${isActive ? "bg-[#1f8a5a]" : "bg-fog"}`}
              aria-hidden="true"
            />
            <span className="font-mono text-[13px] font-bold text-navy">{campaign.name}</span>
            <span
              className={`rounded-[2px] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                isActive ? "bg-[#1f8a5a]/10 text-[#1f8a5a]" : "bg-navy/[0.06] text-muted"
              }`}
            >
              {isActive ? "Aktiv" : "Aus"}
            </span>
            {campaign.incomplete && (
              <span className="rounded-[2px] bg-[#fdf3da] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#8a6a1f]">
                Unvollständig
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-koralle">
            {open ? "Anzeigen ausblenden" : "Anzeigen anzeigen"}
            <span className={`inline-block transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
              ▾
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <Stat label="Ziel" value={campaign.objective} />
          <Stat label="Meta-Ergebnisse" value={String(campaign.metaResults)} sub={campaign.metaCostPerResult != null ? `${fmtEur(campaign.metaCostPerResult)} / Ergebnis` : undefined} />
          <Stat label="Perspective-Leads" value={String(campaign.perspectiveLeads)} />
          <Stat label="Neu berechnete CPL" value={recalculatedCpl != null ? fmtEur(recalculatedCpl) : "—"} />
          <Stat label="Ausgegeben" value={fmtEur(campaign.spend)} sub={`${fmtEur(campaign.dailyBudget)} / Tag`} />
          <Stat label="Reichweite" value={fmtNum(campaign.reach)} />
          <Stat label="Impressionen" value={fmtNum(campaign.impressions)} />
        </div>

        {campaign.leadStatus && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-fog">Lead-Status:</span>
            <span className="rounded-[2px] bg-navy/[0.06] px-2 py-0.5 text-[11px] font-bold text-navy">
              {campaign.leadStatus.neu} Neu
            </span>
            <span className="rounded-[2px] bg-navy/[0.06] px-2 py-0.5 text-[11px] font-bold text-muted">
              {campaign.leadStatus.nichtErreicht} Nicht erreicht
            </span>
            <span className="rounded-[2px] bg-koralle/10 px-2 py-0.5 text-[11px] font-bold text-koralle">
              {campaign.leadStatus.disqualifiziert} Disqualifiziert
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
          <span>{campaign.delivery}</span>
          <span>·</span>
          <span>{campaign.recommendations} Empfehlungen</span>
          <span>·</span>
          <span>Perspective-Funnel: {campaign.perspectiveFunnel}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-line p-5 sm:p-6">
          {campaign.note && (
            <p className="mb-4 rounded-[3px] bg-[#fdf3da] px-3 py-2 text-[11.5px] leading-relaxed text-[#8a6a1f]">
              {campaign.note}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {campaign.ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
