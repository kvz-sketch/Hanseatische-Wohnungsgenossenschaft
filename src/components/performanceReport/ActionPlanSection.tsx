import type { ActionPlan } from "../../data/performanceReport";

const fmtDate = (ymd: string) => ymd.split("-").reverse().join(".");

/** Measures taken and planned across the campaigns, kept by hand in performance-report.json. */
export function ActionPlanSection({ plan }: { plan?: ActionPlan }) {
  if (!plan || (plan.done.length === 0 && plan.planned.length === 0)) return null;
  return (
    <section className="border-t border-navy/8 bg-mist px-5 py-10 sm:px-8 lg:px-11">
      <div className="mx-auto max-w-[1240px]">
        <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-koralle">Optimierung</span>
        <h2 className="mt-2 font-serif-display text-[26px] text-navy sm:text-[30px]">Maßnahmen &amp; Planung</h2>
        <p className="mt-2 text-[12.5px] text-muted">Stand {fmtDate(plan.updated)}</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-navy/8 bg-white p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#1f8a5a]">Umgesetzt</div>
            <ul className="mt-3 space-y-3">
              {plan.done.map((d, i) => (
                <li key={i} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 text-[12px] leading-relaxed">
                  <span className="font-bold text-navy [font-variant-numeric:tabular-nums]">{fmtDate(d.date)}</span>
                  <span>
                    <span className="mr-1.5 rounded-[2px] bg-navy/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-navy">{d.campaign}</span>
                    <span className="text-muted">{d.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-navy/8 bg-white p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-koralle">Geplant</div>
            <ul className="mt-3 space-y-3">
              {plan.planned.map((p, i) => (
                <li key={i} className="text-[12px] leading-relaxed">
                  <span className="mr-1.5 rounded-[2px] bg-navy/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-navy">{p.campaign}</span>
                  <span className="mr-1.5 rounded-[2px] bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-[#7a5f1c]">{p.status}</span>
                  <span className="text-muted">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
