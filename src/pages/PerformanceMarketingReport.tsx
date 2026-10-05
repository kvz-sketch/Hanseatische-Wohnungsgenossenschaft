import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { CampaignRow } from "../components/performanceReport/CampaignRow";
import { reportMeta, campaigns } from "../data/performanceReport";

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");

type FunnelGroup = {
  funnel: string;
  funnelUrl: string;
  campaigns: typeof campaigns;
};

function groupByFunnel(items: typeof campaigns): FunnelGroup[] {
  const groups: FunnelGroup[] = [];
  for (const c of items) {
    let group = groups.find((g) => g.funnel === c.perspectiveFunnel);
    if (!group) {
      group = { funnel: c.perspectiveFunnel, funnelUrl: c.perspectiveFunnelUrl, campaigns: [] };
      groups.push(group);
    }
    group.campaigns.push(c);
  }
  return groups;
}

export function PerformanceMarketingReport() {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalPerspectiveLeads = campaigns.reduce((s, c) => s + c.perspectiveLeads, 0);
  const blendedCplPerspective = totalPerspectiveLeads > 0 ? totalSpend / totalPerspectiveLeads : null;
  const funnelGroups = groupByFunnel(campaigns);

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <RoofIcon color="#141A46" className="h-6 w-9" />
            <span className="subheading text-[13px] leading-none text-navy">Performance Marketing Report</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="bg-[#fdf3da] px-5 py-2.5 text-center text-[12px] font-semibold leading-relaxed text-[#8a6a1f] sm:px-8">
        {reportMeta.note}
      </div>

      <section className="bg-navy px-5 py-12 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1240px]">
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Gerlach Immobilien Gruppe · Intern
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif-display text-[30px] text-white sm:text-[38px]">Performance Marketing Report</h1>
            <span className="rounded-[2px] bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white">
              Stand: {reportMeta.asOf}
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-navy/8 bg-white p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fog">Ausgegeben gesamt</span>
              <div className="mt-3 font-serif-display text-[28px] text-navy [font-variant-numeric:tabular-nums]">
                {fmtEur(totalSpend)}
              </div>
              <div className="mt-1.5 text-[11px] text-muted">über {campaigns.length} Kampagnen</div>
            </div>
            <div className="rounded-md border-2 border-koralle/30 bg-white p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-koralle">Leads</span>
              <div className="mt-3 font-serif-display text-[28px] text-navy [font-variant-numeric:tabular-nums]">
                {fmtNum(totalPerspectiveLeads)}
              </div>
            </div>
            <div className="rounded-md border border-navy/8 bg-white p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fog">CPL</span>
              <div className="mt-3 font-serif-display text-[28px] text-navy [font-variant-numeric:tabular-nums]">
                {blendedCplPerspective != null ? fmtEur(blendedCplPerspective) : "—"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {funnelGroups.map((group) => {
              const funnelSpend = group.campaigns.reduce((s, c) => s + c.spend, 0);
              const funnelLeads = group.campaigns.reduce((s, c) => s + c.perspectiveLeads, 0);
              return (
                <div key={group.funnel} className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy/10 pb-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-fog">Funnel</span>
                      <a
                        href={group.funnelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="subheading text-[14px] text-navy underline decoration-koralle/30 underline-offset-2 hover:text-koralle hover:decoration-koralle"
                      >
                        {group.funnel} ↗
                      </a>
                      <span className="text-[11px] text-muted">
                        · {group.campaigns.length} {group.campaigns.length === 1 ? "Kampagne" : "Kampagnen"}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted [font-variant-numeric:tabular-nums]">
                      {fmtEur(funnelSpend)} · {fmtNum(funnelLeads)} Leads
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {group.campaigns.map((c) => (
                      <CampaignRow key={c.id} campaign={c} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-navy/8 px-5 py-8 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-3 text-[11.5px] text-muted sm:flex-row sm:items-center">
          <span>Performance Marketing Report · Stand {reportMeta.asOf} — Gerlach Immobilien Gruppe</span>
          <Link to="/dashboard" className="font-bold uppercase tracking-[0.08em] text-navy hover:text-koralle">
            ← Zurück zum Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
