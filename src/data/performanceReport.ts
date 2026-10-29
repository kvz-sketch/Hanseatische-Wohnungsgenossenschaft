import { useEffect, useState } from "react";
import bundledReport from "./performance-report.json";

// Performance Marketing Report — Meta Ads campaign data, reconciled with
// Perspective CRM leads.
//
// The numbers live in ./performance-report.json, not in code. The build
// bundles that file as a fallback and also publishes it as
// /data/performance-report.json (see vite.config.ts); the page fetches the
// published copy on every load, so the daily refresh only has to replace that
// one file on the server — no rebuild. See docs/performance-report-refresh.md.
//
// In the JSON, an ad's `image` is a filename stem from src/assets/ads/
// (e.g. "280926_Bergedorf_Ad1"); it is resolved to the bundled image URL here.
// An ad whose stem has no matching file simply shows no thumbnail.

const adImages: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/ads/*.jpg", { eager: true, import: "default" }),
  ).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -".jpg".length), url]),
);

export type AdStat = {
  id: string;
  name: string;
  /** Meta ad ID — how the daily refresh matches this row to Meta and to Perspective contacts. */
  metaAdId?: string;
  badge?: string; // "Unveröffentlichte Änderungen", "Kopie", "Keine Auslieferung"
  /** Creative thumbnail URL, resolved from the JSON's image key (a filename stem in src/assets/ads/). */
  image?: string;
  metaResults: number | null;
  metaCostPerResult: number | null;
  spend: number;
  reach: number;
  impressions: number;
  perspectiveLeads?: number;
  /** Real Perspective contact conversion dates (YYYY-MM-DD, no personal data) — powers the week/month filter. */
  leadDates?: string[];
  /** Link to watch the full video creative (Google Drive) — shown next to video ad thumbnails. */
  videoUrl?: string;
};

export type LeadStatus = {
  neu: number;
  nichtErreicht: number;
  disqualifiziert: number;
  abschluss?: number;
  /** In the HubSpot closing pipeline ("Bereit fürs 1. Closing" and later stages): qualified, handed over to closing. */
  closing?: number;
  /** HubSpot "Wiedervorlage" — follow-up scheduled. */
  wiedervorlage?: number;
};

/** Disqualification rate from a lead-status breakdown: of all deals, and of worked deals (all except "neu"). */
export function disqualificationRate(s: LeadStatus) {
  const total = s.neu + s.nichtErreicht + s.disqualifiziert + (s.wiedervorlage ?? 0) + (s.closing ?? 0) + (s.abschluss ?? 0);
  const worked = total - s.neu;
  return {
    total,
    worked,
    disqualified: s.disqualifiziert,
    ofAll: total > 0 ? s.disqualifiziert / total : null,
    ofWorked: worked > 0 ? s.disqualifiziert / worked : null,
  };
}

export type Campaign = {
  id: string;
  name: string;
  /** The Meta campaign or ad set this report row is pulled from (account GIGxHansea). */
  meta?: { level: "campaign" | "adset"; id: string };
  status: "active" | "off";
  objective: string;
  dailyBudget: number;
  spend: number;
  reach: number;
  impressions: number;
  delivery: string;
  recommendations: number;
  metaResults: number;
  metaCostPerResult: number | null;
  perspectiveLeads: number;
  perspectiveFunnel: string;
  perspectiveFunnelUrl: string;
  /** Perspective funnel whose contacts are counted as this campaign's leads. */
  perspectiveFunnelId?: string;
  /** "meta-form": leads come from Meta's own lead form, so there is no Perspective count. */
  leadSource?: "meta-form";
  leadStatus?: LeadStatus;
  /** Where/when the lead status counts come from, e.g. "HubSpot, 18.10.2026". */
  leadStatusSource?: string;
  ads: AdStat[];
  incomplete?: boolean;
  note?: string;
  /** Leads counted in perspectiveLeads that aren't tied to one specific ad (dates only, no personal data). */
  unattributedLeadDates?: string[];
  /**
   * Real, Perspective-verified leads confirmed only as a funnel-level total
   * (e.g. from a contact-count screenshot) with no individual conversion
   * date or ad attribution yet. Included in the all-time ("Gesamt") total
   * so the headline count is accurate, but excluded from week/month views
   * since there's no real date to place them in — never a fabricated one.
   */
  unattributedLeadsCount?: number;
};

/**
 * Leads that belong to a funnel but not to any currently-tracked campaign
 * (e.g. a pre-16.09 predecessor campaign) — shown in the funnel-group total
 * but excluded from every individual campaign's numbers.
 */
export type FunnelExtraLeads = Record<
  string,
  { dates: string[]; note: string; undatedCount?: number; undatedNote?: string }
>;

export type Report = {
  asOf: string;
  updatedAt: string;
  note: string;
  funnelExtraLeads: FunnelExtraLeads;
  campaigns: Campaign[];
};

function resolveImages(raw: unknown): Report {
  const report = raw as Report;
  return {
    ...report,
    campaigns: report.campaigns.map((c) => ({
      ...c,
      ads: c.ads.map((a) => ({ ...a, image: a.image ? adImages[a.image] : undefined })),
    })),
  };
}

function isReport(raw: unknown): boolean {
  const r = raw as Partial<Report> | null;
  return !!r && typeof r.asOf === "string" && Array.isArray(r.campaigns) && typeof r.funnelExtraLeads === "object";
}

const fallbackReport = resolveImages(bundledReport);

/** The bundled report right away, swapped for the live /data/performance-report.json once it loads. */
export function useReport(): Report {
  const [report, setReport] = useState(fallbackReport);
  useEffect(() => {
    let cancelled = false;
    fetch("/data/performance-report.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (!cancelled && isReport(raw)) setReport(resolveImages(raw));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return report;
}
