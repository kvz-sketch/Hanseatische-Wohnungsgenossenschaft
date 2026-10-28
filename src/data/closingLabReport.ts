import { useEffect, useState } from "react";
import bundledReport from "./closinglab-report.json";

// Agency Closing Lab — kept separate from the in-house report and from the
// ImmoMarketer section, like ./agencyReport.ts. For now only HubSpot deal
// counts per pipeline stage (no names, no personal data); campaign, spend and
// ad data are added once we have access. Published as /data/closinglab-report.json.

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
