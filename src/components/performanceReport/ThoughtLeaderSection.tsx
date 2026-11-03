import { useEffect, useState } from "react";
import { Lightbox } from "./AdCard";
import { Kpi } from "./AgencySection";

// LinkedIn Thought Leader Ads, read live from the Redaktionsplan
// (/api/redaktionsplan.php, collection "linkedin", format "tla"). An ad shows
// up here once its planned date has been reached. Results are typed into the
// planner by hand from the LinkedIn Campaign Manager; empty means "not yet
// entered", which is not the same as 0.

type PlannerAd = {
  id: string;
  date: string;
  format?: string;
  status?: string;
  title?: string;
  text?: string;
  leadMagnet?: string;
  media?: { id: string }[];
  spend?: string;
  impressions?: string;
  clicks?: string;
  leads?: string;
};

type Ad = PlannerAd & { n: { spend: number | null; impressions: number | null; clicks: number | null; leads: number | null } };

const fmtEur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (v: number) => v.toLocaleString("de-DE");

/** "1.234,56" or "1234.56" → 1234.56; empty → null. */
function num(v?: string): number | null {
  const s = (v ?? "").trim().replace(/\s|€/g, "");
  if (!s) return null;
  const n = Number(/,\d{1,2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/[.,](?=\d{3}(\D|$))/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Calendar week (ISO 8601) of a YYYY-MM-DD date. */
function isoWeek(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - start.getTime()) / 864e5 + 1) / 7);
}

/** "26.10.–30.10." for the Monday–Friday of the week containing the date. */
function weekRange(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const mon = new Date(y, m - 1, d - ((new Date(y, m - 1, d).getDay() + 6) % 7));
  const fri = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 4);
  const f = (x: Date) => `${String(x.getDate()).padStart(2, "0")}.${String(x.getMonth() + 1).padStart(2, "0")}.`;
  return `${f(mon)}–${f(fri)}`;
}

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
const fileUrl = (id: string) => `/api/redaktionsplan.php?file=${encodeURIComponent(id)}`;

function useThoughtLeaderAds() {
  const [state, setState] = useState<{ live: Ad[]; upcoming: number; error: boolean; loaded: boolean }>({
    live: [],
    upcoming: 0,
    error: false,
    loaded: false,
  });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/redaktionsplan.php", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { docs?: { linkedin?: Record<string, PlannerAd> } }) => {
        if (cancelled) return;
        const all = Object.entries(d.docs?.linkedin ?? {})
          .map(([id, a]) => ({ ...a, id }))
          .filter((a) => a.format === "tla" && /^\d{4}-\d{2}-\d{2}$/.test(a.date ?? ""));
        const t = today();
        const live = all
          .filter((a) => a.date <= t)
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((a) => ({ ...a, n: { spend: num(a.spend), impressions: num(a.impressions), clicks: num(a.clicks), leads: num(a.leads) } }));
        setState({ live, upcoming: all.length - live.length, error: false, loaded: true });
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, error: true, loaded: true })));
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-bold text-navy">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  const [open, setOpen] = useState(false);
  const img = ad.media?.[0] ? fileUrl(ad.media[0].id) : null;
  const { spend, impressions, clicks, leads } = ad.n;
  const hasResults = [spend, impressions, clicks, leads].some((v) => v != null);
  const nv = "n. v.";
  return (
    <div className="flex flex-col rounded-md border border-navy/8 bg-white p-3">
      {img ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[3px] border border-navy/8"
          >
            <img src={img} alt={ad.title || "Thought Leader Ad"} className="h-full w-full object-cover" />
          </button>
          {open && <Lightbox src={img} alt={ad.title || "Thought Leader Ad"} onClose={() => setOpen(false)} />}
        </>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-[3px] border border-dashed border-navy/15 text-[11px] text-muted">
          Kein Motiv hinterlegt
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#0a66c2]">KW {isoWeek(ad.date)}</span>
        <span className="text-[10.5px] text-muted">{weekRange(ad.date)}</span>
      </div>
      <div className="mt-1 text-[12.5px] font-bold leading-snug text-navy">{ad.title || "Ohne Titel"}</div>
      {ad.text && <p className="mt-1 line-clamp-4 whitespace-pre-line text-[11.5px] leading-relaxed text-muted">{ad.text}</p>}
      {ad.leadMagnet && (
        <a
          href={ad.leadMagnet}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex text-[10.5px] font-bold uppercase tracking-[0.04em] text-koralle underline decoration-koralle/30 underline-offset-2 hover:decoration-koralle"
        >
          Lead-Magnet ↗
        </a>
      )}
      <div className="mt-auto pt-2.5">
        {hasResults ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 border-t border-line pt-2.5 text-[11px] [font-variant-numeric:tabular-nums]">
            <Metric label="Ausgegeben" value={spend != null ? fmtEur(spend) : nv} />
            <Metric label="Impressionen" value={impressions != null ? fmtNum(impressions) : nv} />
            <Metric label="Klicks" value={clicks != null ? fmtNum(clicks) : nv} />
            <Metric label="CTR" value={clicks != null && impressions ? `${((clicks / impressions) * 100).toFixed(2).replace(".", ",")} %` : nv} />
            <Metric label="Leads" value={leads != null ? fmtNum(leads) : nv} />
            <Metric label="CPL" value={spend != null && leads ? fmtEur(spend / leads) : nv} />
          </div>
        ) : (
          <div className="border-t border-line pt-2.5 text-[11px] text-muted">
            Ergebnisse noch nicht eingetragen. Im Redaktionsplan unter „Thought Leader Ads“ nachtragen.
          </div>
        )}
      </div>
    </div>
  );
}

export function ThoughtLeaderSection() {
  const { live, upcoming, error, loaded } = useThoughtLeaderAds();
  const sum = (k: keyof Ad["n"]) => live.reduce((s, a) => s + (a.n[k] ?? 0), 0);
  const spend = sum("spend");
  const impressions = sum("impressions");
  const clicks = sum("clicks");
  const leads = sum("leads");
  const withResults = live.filter((a) => Object.values(a.n).some((v) => v != null)).length;

  return (
    <section className="border-t-4 border-[#0a66c2]/50 bg-mist px-5 py-10 sm:px-8 lg:px-11">
      <div className="mx-auto max-w-[1240px]">
        <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-[#0a66c2]">LinkedIn · separat ausgewiesen</span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif-display text-[26px] text-navy sm:text-[30px]">Thought Leader Ads</h2>
          <a
            href="/tools/redaktionsplan/#tla"
            className="rounded-[2px] bg-navy/[0.06] px-3 py-1.5 text-[12px] font-bold text-navy hover:text-koralle"
          >
            Im Redaktionsplan öffnen ↗
          </a>
        </div>
        <p className="mt-2 max-w-[820px] text-[12.5px] leading-relaxed text-muted">
          Thought Leader Ads aus dem Redaktionsplan, eine pro Kalenderwoche, sobald ihre Woche begonnen hat. Die Ergebnisse
          werden aus dem LinkedIn Campaign Manager im Redaktionsplan nachgetragen. Nicht in den Kennzahlen oben enthalten.
          {upcoming > 0 && ` ${upcoming} weitere ${upcoming === 1 ? "ist" : "sind"} bereits geplant.`}
        </p>

        {!loaded ? null : error ? (
          <p className="mt-6 text-[12.5px] text-muted">Der Redaktionsplan ist gerade nicht erreichbar.</p>
        ) : live.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-navy/15 bg-white p-6 text-[12.5px] text-muted">
            Noch keine Thought Leader Ad ausgespielt. Im Redaktionsplan unter „Thought Leader Ads“ den Wochen-Slot füllen; die
            Anzeige erscheint hier ab ihrem Datum.
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                label="Ausgegeben"
                value={withResults ? fmtEur(spend) : "n. v."}
                sub={`${live.length} ${live.length === 1 ? "Anzeige" : "Anzeigen"}, ${withResults} mit Ergebnissen`}
              />
              <Kpi label="Leads" value={withResults ? fmtNum(leads) : "n. v."} sub="laut LinkedIn Campaign Manager" accent />
              <Kpi label="CPL" value={leads > 0 ? fmtEur(spend / leads) : "n. v."} />
              <Kpi
                label="Klicks"
                value={withResults ? fmtNum(clicks) : "n. v."}
                sub={impressions > 0 ? `CTR ${((clicks / impressions) * 100).toFixed(2).replace(".", ",")} % bei ${fmtNum(impressions)} Impressionen` : undefined}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {live.map((a) => (
                <AdCard key={a.id} ad={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
