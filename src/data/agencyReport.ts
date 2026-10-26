import { useEffect, useState } from "react";
import bundledReport from "./agency-report.json";

// Agency campaigns (ImmoMarketer, Meta account GerlachxImmo-Marketer).
//
// Kept completely separate from the in-house Performance Marketing Report:
// its own JSON (./agency-report.json, published as /data/agency-report.json),
// its own totals, never added to the report's headline numbers. Values are
// Meta lifetime figures; `leads: null` means Meta reports no lead count
// (e.g. website leads whose event isn't tracked), which is not the same as 0.

type Status = "active" | "off";

export type AgencyAd = {
  id: string;
  name: string;
  status: Status;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number | null;
};

export type AgencyAdSet = {
  id: string;
  name: string;
  status: Status;
  start: string;
  dailyBudget?: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number | null;
  ads: AgencyAd[];
  note?: string;
};

/** HubSpot status of a campaign's leads — counts only, no personal data. */
export type AgencyLeadStatus = {
  /** Deals in a closing stage (e.g. Bedarfsanalyse-, Objektfindungsphase). */
  closing: number;
  closingStages?: string[];
  disqualifiziert: number;
};

export type AgencyCampaign = {
  id: string;
  name: string;
  status: Status;
  objective: string;
  start: string;
  dailyBudget?: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number | null;
  leadStatus?: AgencyLeadStatus;
  /** Where/when the lead status comes from, e.g. "HubSpot, 26.10.2026". */
  leadStatusSource?: string;
  note?: string;
  adSets: AgencyAdSet[];
};

export type AgencyReport = {
  asOf: string;
  updatedAt: string;
  agency: string;
  account: { name: string; id: string };
  note: string;
  campaigns: AgencyCampaign[];
};

function isAgencyReport(raw: unknown): raw is AgencyReport {
  const r = raw as Partial<AgencyReport> | null;
  return !!r && typeof r.asOf === "string" && Array.isArray(r.campaigns);
}

/** The bundled agency report right away, swapped for the live /data/agency-report.json once it loads. */
export function useAgencyReport(): AgencyReport {
  const [report, setReport] = useState(bundledReport as AgencyReport);
  useEffect(() => {
    let cancelled = false;
    fetch("/data/agency-report.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (!cancelled && isAgencyReport(raw)) setReport(raw);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return report;
}
