import { useClosingLabReport, type ClosingLabCosts as Costs, type ClosingLabStage } from "../../data/closingLabReport";
import { Kpi } from "./AgencySection";
import { ClosingLabCreatives } from "./ClosingLabCreatives";

const fmtNum = (v: number) => v.toLocaleString("de-DE");
const fmtPct = (v: number) => `${Math.round(v * 100)} %`;
const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtDate = (iso: string) => iso.split("-").reverse().join(".");

/** What Closing Lab costs us: the monthly fee, the Termine it covers and what has been paid so far. */
function ClosingLabCosts({ costs }: { costs: Costs }) {
  const perTermin = costs.monthly / costs.termineProMonat;
  return (
    <div className="mt-6 rounded-md border border-navy/8 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[14px] font-bold text-navy">Kosten</span>
        <span className="text-[11px] text-muted">{costs.source}</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Pro Monat" value={fmtEur(costs.monthly)} sub="Pauschale Closing Lab" />
        <Kpi label="Termine laut Vertrag" value={`${fmtNum(costs.termineProMonat)} / Monat`} sub="Erhaltene Termine siehe unten" />
        <Kpi label="Preis je Termin" value={fmtEur(perTermin)} sub={`${fmtEur(costs.monthly)} / ${costs.termineProMonat} Termine`} />
        <Kpi
          label="Bisher bezahlt"
          value={fmtEur(costs.paidToDate)}
          sub={`seit ${fmtDate(costs.since)}${costs.setup ? `, inkl. ${fmtEur(costs.setup)} Setup` : ""}`}
        />
      </div>
    </div>
  );
}

const GROUPS: { key: ClosingLabStage["group"]; title: string; bar: string; text: string }[] = [
  { key: "closing", title: "Im Closing", bar: "bg-[#1f8a5a]", text: "text-[#1f8a5a]" },
  { key: "open", title: "Offen im Setting", bar: "bg-gold", text: "text-[#7a5f1c]" },
  { key: "disqualified", title: "Disqualifiziert", bar: "bg-koralle", text: "text-koralle" },
];

/** Agency Closing Lab — own section with its own totals; for now HubSpot lead status only. */
export function ClosingLabSection() {
  const report = useClosingLabReport();
  const total = report.stages.reduce((s, x) => s + x.count, 0);
  const sum = (group: ClosingLabStage["group"]) =>
    report.stages.filter((x) => x.group === group).reduce((s, x) => s + x.count, 0);
  const closing = sum("closing");
  const open = sum("open");
  const disq = sum("disqualified");
  const share = (n: number) => (total > 0 ? fmtPct(n / total) : "n. v.");

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
          Nicht in den Kennzahlen oben enthalten. {report.note}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Deals (HubSpot)" value={fmtNum(total)} sub="Leads der Agentur, gesamt" accent />
          <Kpi label="Im Closing" value={fmtNum(closing)} sub={`${share(closing)} der Deals`} />
          <Kpi label="Offen im Setting" value={fmtNum(open)} sub={`${share(open)} der Deals`} />
          <Kpi label="Disqualifiziert" value={fmtNum(disq)} sub={`Disqualifizierungsrate ${share(disq)}`} />
        </div>

        <div className="mt-6 rounded-md border border-navy/8 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[14px] font-bold text-navy">Lead-Status nach Phase</span>
            <span className="text-[11px] text-muted">{report.leadStatusSource}</span>
          </div>
          <div className="mt-4 flex flex-col gap-5">
            {GROUPS.map((g) => {
              const stages = report.stages.filter((x) => x.group === g.key);
              if (stages.length === 0) return null;
              return (
                <div key={g.key}>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.1em] ${g.text}`}>
                    {g.title} · {fmtNum(sum(g.key))}
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {stages.map((st) => (
                      <div
                        key={`${st.phase}-${st.label}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[12px] sm:grid-cols-[260px_minmax(0,1fr)_88px]"
                      >
                        <span className="text-navy">
                          {st.label} <span className="text-[10.5px] text-fog">({st.phase})</span>
                        </span>
                        <span className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-navy/[0.06] sm:order-none sm:col-span-1">
                          <span
                            className={`block h-full rounded-full ${g.bar}`}
                            style={{ width: total > 0 ? `${(st.count / total) * 100}%` : 0 }}
                          />
                        </span>
                        <span className="text-right font-bold text-navy [font-variant-numeric:tabular-nums]">
                          {fmtNum(st.count)} <span className="text-[10.5px] font-normal text-muted">· {share(st.count)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {report.costs && <ClosingLabCosts costs={report.costs} />}

        {report.termine && report.creatives && report.creatives.length > 0 && (
          <ClosingLabCreatives termine={report.termine} groups={report.creativeGroups ?? []} creatives={report.creatives} />
        )}

        <div className="mt-4 rounded-md border border-dashed border-navy/15 bg-mist px-5 py-4 text-[12px] text-muted">
          Ausgaben, Reichweite und Leads je Anzeige aus Meta folgen, sobald wir Zugriff auf das Werbekonto von {report.agency} haben.
        </div>
      </div>
    </section>
  );
}
