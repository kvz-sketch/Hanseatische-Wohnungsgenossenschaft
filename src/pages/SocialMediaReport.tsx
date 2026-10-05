import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { StatTile } from "../components/socialReport/StatTile";
import { ReachTrendChart } from "../components/socialReport/ReachTrendChart";
import { PlatformBreakdown } from "../components/socialReport/PlatformBreakdown";
import { TopPostsList } from "../components/socialReport/TopPostsList";
import { reportMeta, kpis, platforms, reachTrend, topPosts } from "../data/socialReport";

export function SocialMediaReport() {
  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <RoofIcon color="#141A46" className="h-6 w-9" />
            <span className="subheading text-[13px] leading-none text-navy">
              Social Media Report
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="bg-[#fdf3da] px-5 py-2.5 text-center text-[12px] font-semibold text-[#8a6a1f] sm:px-8">
        {reportMeta.generatedNote} — echte Zahlen folgen, sobald der Meta-Connector (Instagram/Facebook) autorisiert ist.
      </div>

      <section className="bg-navy px-5 py-12 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Gerlach Immobilien Gruppe · Intern
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif-display text-[30px] text-white sm:text-[38px]">Social Media Report</h1>
            <span className="rounded-[2px] bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white">
              {reportMeta.period}
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <StatTile key={k.label} {...k} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-md border border-navy/8 bg-white p-6 sm:p-7">
              <h3 className="subheading text-[15px] text-navy">Gesamtreichweite — letzte 6 Monate</h3>
              <div className="mt-5">
                <ReachTrendChart data={reachTrend} />
              </div>
            </div>
            <PlatformBreakdown platforms={platforms} />
          </div>

          <div className="mt-5">
            <TopPostsList posts={topPosts} platforms={platforms} />
          </div>
        </div>
      </section>

      <footer className="border-t border-navy/8 px-5 py-8 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 text-[11.5px] text-muted sm:flex-row sm:items-center">
          <span>Social Media Report · {reportMeta.period} — Gerlach Immobilien Gruppe</span>
          <Link to="/dashboard" className="font-bold uppercase tracking-[0.08em] text-navy hover:text-koralle">
            ← Zurück zum Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
