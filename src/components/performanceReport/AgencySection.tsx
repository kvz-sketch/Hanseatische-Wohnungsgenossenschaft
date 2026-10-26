import { useState } from "react";
import { useAgencyReport, type AgencyCampaign, type AgencyLeadStatus } from "../../data/agencyReport";

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");
const fmtDate = (iso: string) => iso.split("-").reverse().join(".");
const fmtPct = (v: number) => `${Math.round(v * 100)} %`;
const cpl = (spend: number, leads: number | null) => (leads ? fmtEur(spend / leads) : "n. v.");

function StatusDot({ status }: { status: "active" | "off" }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${status === "active" ? "bg-[#1f8a5a]" : "bg-fog"}`}
      title={status === "active" ? "Aktiv" : "Pausiert"}
      aria-label={status === "active" ? "Aktiv" : "Pausiert"}
    />
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-md bg-white p-5 ${accent ? "border-2 border-koralle/30" : "border border-navy/8"}`}>
      <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${accent ? "text-koralle" : "text-fog"}`}>{label}</span>
      <div className="mt-2 font-serif-display text-[24px] text-navy [font-variant-numeric:tabular-nums]">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function LeadStatusChips({ status, source }: { status: AgencyLeadStatus; source?: string }) {
  const total = status.closing + status.disqualifiziert;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-fog">
        Lead-Status{source ? ` (${source})` : ""}:
      </span>
      <span
        className="rounded-[2px] bg-[#1f8a5a]/10 px-2 py-0.5 text-[11px] font-bold text-[#1f8a5a]"
        title={status.closingStages?.join(", ")}
      >
        {status.closing} im Closing{status.closingStages?.length ? ` (${status.closingStages.join(", ")})` : ""}
      </span>
      <span className="rounded-[2px] bg-koralle/10 px-2 py-0.5 text-[11px] font-bold text-koralle">
        {status.disqualifiziert} Disqualifiziert
      </span>
      {total > 0 && (
        <span className="text-[11px] text-muted">
          Disqualifizierungsrate <b className="text-navy">{fmtPct(status.disqualifiziert / total)}</b>
        </span>
      )}
    </div>
  );
}

function AgencyCampaignCard({ campaign }: { campaign: AgencyCampaign }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-md border border-navy/8 bg-white">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full flex-col gap-4 p-5 text-left sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <StatusDot status={campaign.status} />
            <span className="break-all text-[14px] font-bold text-navy">{campaign.name}</span>
            <span
              className={`rounded-[2px] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                campaign.status === "active" ? "bg-[#1f8a5a]/10 text-[#1f8a5a]" : "bg-navy/[0.06] text-muted"
              }`}
            >
              {campaign.status === "active" ? "Aktiv" : "Pausiert"}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-koralle">
            {open ? "Anzeigen ausblenden" : "Anzeigen anzeigen"}
            <span className={`inline-block transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
              ▾
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ["Ziel", campaign.objective],
            ["Leads (Meta)", campaign.leads == null ? "n. v." : String(campaign.leads)],
            ["CPL", cpl(campaign.spend, campaign.leads)],
            ["Ausgegeben", fmtEur(campaign.spend)],
            ["Reichweite", fmtNum(campaign.reach)],
            ["Impressionen", fmtNum(campaign.impressions)],
            ["Klicks", fmtNum(campaign.clicks)],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[13.5px] font-bold text-navy [font-variant-numeric:tabular-nums]">{value}</div>
              <div className="text-[10.5px] text-muted">{label}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted">
          seit {fmtDate(campaign.start)}
          {campaign.dailyBudget != null && ` · ${fmtEur(campaign.dailyBudget)} / Tag`}
        </div>
        {campaign.leadStatus && <LeadStatusChips status={campaign.leadStatus} source={campaign.leadStatusSource} />}
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-line p-5 sm:p-6">
          {campaign.note && (
            <p className="rounded-[3px] bg-[#fdf3da] px-3 py-2 text-[11.5px] leading-relaxed text-[#8a6a1f]">{campaign.note}</p>
          )}
          {campaign.adSets.map((set) => (
            <div key={set.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusDot status={set.status} />
                  <span className="break-all text-[12px] font-bold text-navy">{set.name}</span>
                </div>
                <span className="text-[11px] text-muted [font-variant-numeric:tabular-nums]">
                  seit {fmtDate(set.start)}
                  {set.dailyBudget != null && ` · ${fmtEur(set.dailyBudget)} / Tag`} · {fmtEur(set.spend)} ·{" "}
                  {set.leads == null ? "n. v." : set.leads} {set.leads === 1 ? "Lead" : "Leads"} · CPL {cpl(set.spend, set.leads)}
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[640px] table-fixed text-left text-[11.5px] [font-variant-numeric:tabular-nums]">
                  <thead>
                    <tr className="border-b border-line text-[10px] uppercase tracking-[0.08em] text-fog">
                      <th className="w-[38%] py-1.5 pr-3 font-bold">Anzeige</th>
                      <th className="py-1.5 pr-3 text-right font-bold">Leads</th>
                      <th className="py-1.5 pr-3 text-right font-bold">CPL</th>
                      <th className="py-1.5 pr-3 text-right font-bold">Ausgegeben</th>
                      <th className="py-1.5 pr-3 text-right font-bold">Klicks</th>
                      <th className="py-1.5 pr-3 text-right font-bold">Reichweite</th>
                      <th className="py-1.5 text-right font-bold">Impressionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...set.ads]
                      .sort((a, b) => (b.leads ?? -1) - (a.leads ?? -1))
                      .map((ad) => (
                        <tr key={ad.id} className="border-b border-line/60 last:border-0">
                          <td className="py-1.5 pr-3">
                            <span className="flex min-w-0 items-center gap-2">
                              <StatusDot status={ad.status} />
                              <span className="truncate text-navy" title={ad.name}>{ad.name}</span>
                            </span>
                          </td>
                          <td className={`py-1.5 pr-3 text-right font-bold ${ad.leads ? "text-koralle" : "text-muted"}`}>
                            {ad.leads == null ? "n. v." : ad.leads}
                          </td>
                          <td className="py-1.5 pr-3 text-right text-navy">{cpl(ad.spend, ad.leads)}</td>
                          <td className="py-1.5 pr-3 text-right text-navy">{fmtEur(ad.spend)}</td>
                          <td className="py-1.5 pr-3 text-right text-navy">{fmtNum(ad.clicks)}</td>
                          <td className="py-1.5 pr-3 text-right text-navy">{fmtNum(ad.reach)}</td>
                          <td className="py-1.5 text-right text-navy">{fmtNum(ad.impressions)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {set.note && <p className="mt-1.5 text-[11px] text-muted">{set.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Agency campaigns, shown below the in-house report with their own totals — never mixed into the report's numbers. */
export function AgencySection() {
  const report = useAgencyReport();
  const spend = report.campaigns.reduce((s, c) => s + c.spend, 0);
  const leads = report.campaigns.reduce((s, c) => s + (c.leads ?? 0), 0);
  const leadSpend = report.campaigns.filter((c) => c.leads != null).reduce((s, c) => s + c.spend, 0);
  const active = report.campaigns.filter((c) => c.status === "active").length;
  const statuses = report.campaigns.flatMap((c) => (c.leadStatus ? [c.leadStatus] : []));
  const closing = statuses.reduce((s, x) => s + x.closing, 0);
  const disq = statuses.reduce((s, x) => s + x.disqualifiziert, 0);

  return (
    <section className="border-t-4 border-gold/60 bg-white px-5 py-10 sm:px-8 lg:px-11">
      <div className="mx-auto max-w-[1240px]">
        <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
          Agentur · separat ausgewiesen
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif-display text-[26px] text-navy sm:text-[30px]">Agentur-Kampagnen: {report.agency}</h2>
          <span className="rounded-[2px] bg-navy/[0.06] px-3 py-1.5 text-[12px] font-bold text-navy">Stand: {report.asOf}</span>
        </div>
        <p className="mt-2 max-w-[820px] text-[12.5px] leading-relaxed text-muted">
          Meta-Werbekonto „{report.account.name}“. Nicht in den Kennzahlen oben enthalten. {report.note}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Ausgegeben" value={fmtEur(spend)} sub={`über ${report.campaigns.length} Kampagnen, ${active} aktiv`} />
          <Kpi label="Leads (Meta)" value={fmtNum(leads)} sub="Lead-Formular, gesamte Laufzeit" accent />
          <Kpi
            label="CPL"
            value={leads > 0 ? fmtEur(leadSpend / leads) : "n. v."}
            sub={leads > 0 ? `${fmtEur(spend / leads)} inkl. aller Agentur-Kosten` : undefined}
          />
          <Kpi
            label="Im Closing"
            value={statuses.length ? fmtNum(closing) : "n. v."}
            sub={
              statuses.length
                ? `${disq} disqualifiziert${closing + disq > 0 ? ` (${fmtPct(disq / (closing + disq))})` : ""} · HubSpot`
                : "keine CRM-Daten"
            }
          />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {report.campaigns.map((c) => (
            <AgencyCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
