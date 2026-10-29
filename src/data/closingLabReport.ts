import { useEffect, useState } from "react";
import bundledReport from "./closinglab-report.json";

// Agency Closing Lab — kept separate from the in-house report and from the
// ImmoMarketer section, like ./agencyReport.ts. For now only HubSpot deal
// counts per pipeline stage (no names, no personal data); campaign, spend and
// ad data are added once we have access. Published as /data/closinglab-report.json.
// Termine per creative come from the Closing Lab portal (counts only); a
// creative's `images` are filename stems in src/assets/ads/, resolved here.

const adImages: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/ads/*.jpg", { eager: true, import: "default" }),
  ).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -".jpg".length), url]),
);

/** Bundled image URL for a stem from the JSON, or undefined if no such file. */
export const creativeImage = (stem: string): string | undefined => adImages[stem];

export type ClosingLabStage = {
  label: string;
  /** HubSpot pipeline the stage belongs to. */
  phase: "Setting" | "Closing";
  /** closing: in the closing pipeline · open: still being set · disqualified. */
  group: "closing" | "open" | "disqualified";
  count: number;
};

/** What Closing Lab costs under the contract. Amounts in EUR, dates ISO. */
export type ClosingLabCosts = {
  source: string;
  /** Monthly fee. */
  monthly: number;
  /** Termine the monthly fee covers. */
  termineProMonat: number;
  since: string;
  /** Paid so far, including the one-off setup. */
  paidToDate: number;
  setup: number;
};

/** Termine from the Closing Lab portal, overall. */
export type ClosingLabTermine = {
  source: string;
  /** All leads: with and without Termin. */
  leads: number;
  ohneTermin: number;
  termine: number;
  stattgefunden: number;
  noShow: number;
  /** Unconfirmed or postponed. */
  offen: number;
  /** Contract price per Termin (monthly fee / Termine per month), in EUR. */
  pricePerTermin: number;
  note: string;
};

export type ClosingLabCreativeGroup = { id: string; label: string; period: string };

/** One ad as named in the portal, with the outcome of its Termine. */
export type ClosingLabCreative = {
  id: string;
  name: string;
  group: string;
  /** "Objekt-Anzeige", "Video", "Aktions-Anzeige", "Steuer-Anzeige" or "unbekannt". */
  type: string;
  /** The ad text the portal records for the Termin. */
  portalAd: string;
  /** Filename stems in src/assets/ads/; empty until the creative is supplied. */
  images: string[];
  firstTermin: string;
  lastTermin: string;
  termine: number;
  stattgefunden: number;
  noShow: number;
  /** Termin unconfirmed or postponed. */
  offen: number;
  /** After the Termin: Bereit fürs 1. Closing, Bedarfsanalyse- or Objektfindungsphase. */
  pipeline: number;
  bereit: number;
  disqualifiziert: number;
  /** Pipeline stage still "Offen". */
  offenStage: number;
  /** Pipeline stage missing in the export. */
  ohneStatus: number;
};

export type ClosingLabReport = {
  asOf: string;
  updatedAt: string;
  agency: string;
  note: string;
  leadStatusSource: string;
  stages: ClosingLabStage[];
  costs?: ClosingLabCosts;
  termine?: ClosingLabTermine;
  creativeGroups?: ClosingLabCreativeGroup[];
  creatives?: ClosingLabCreative[];
};

function isClosingLabReport(raw: unknown): raw is ClosingLabReport {
  const r = raw as Partial<ClosingLabReport> | null;
  return !!r && typeof r.asOf === "string" && Array.isArray(r.stages);
}

/** The bundled report right away, swapped for the live /data/closinglab-report.json once it loads. */
export function useClosingLabReport(): ClosingLabReport {
  const [report, setReport] = useState(bundledReport as ClosingLabReport);
  useEffect(() => {
    let cancelled = false;
    fetch("/data/closinglab-report.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (!cancelled && isClosingLabReport(raw)) setReport(raw);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return report;
}
