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

/** One Closing Lab invoice (monthly billing period). Amounts in EUR, dates ISO. */
export type ClosingLabInvoice = {
  from: string;
  to: string;
  /** Booked appointments; null when the invoice doesn't itemise them. */
  quantity: number | null;
  unit: string;
  unitPrice: number | null;
  /** One-off setup fee, null or 0 when none. */
  setup: number | null;
  total: number;
  status: "paid" | "open" | "overdue" | "draft";
  paidOn: string | null;
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
  /** What Closing Lab bills per Termin, in EUR. */
  pricePerTermin: number;
  note: string;
};

export type ClosingLabCreativeGroup = { id: string; label: string; period: string };

/** One ad as named in the portal, with the outcome of its Termine. */
export type ClosingLabCreative = {
  id: string;
  name: string;
  group: string;
  /** "Objekt-Anzeige", "Video", "Aktions-Anzeige" or "unbekannt". */
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
  invoicesSource?: string;
  /** Newest first. */
  invoices?: ClosingLabInvoice[];
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
