import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { CampaignRow } from "../components/performanceReport/CampaignRow";
import { reportMeta, campaigns } from "../data/performanceReport";

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");

export function PerformanceMarketingReport() {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalPerspectiveLeads = campaigns.reduce((s, c) => s + c.perspectiveLeads, 0);
  const blendedCplPerspective = totalPerspectiveLeads > 0 ? totalSpend / totalPerspectiveLeads : null;

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

          <div className="mt-8 flex flex-col gap-4">
            {campaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
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
