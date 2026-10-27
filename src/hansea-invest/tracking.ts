// Lead submission + Taboola conversion tracking for the Hansea Invest page.
//
// VITE_LEAD_ENDPOINT   URL that accepts a JSON POST with the lead (CRM webhook,
//                      Zapier/Make, form backend …). Without it the form falls
//                      back to opening a pre-filled e-mail.
// The Taboola pixel itself is loaded by the consent tool / tag manager once the
// visitor has agreed; this file only fires the "lead" event if it is present.

type TaboolaQueue = { push: (event: Record<string, unknown>) => void };

declare global {
  interface Window {
    _tfa?: TaboolaQueue;
  }
}

export type Lead = {
  name: string;
  email: string;
  phone: string;
  amount: string;
};

const TRACKING_PARAMS = ["tblci", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// Taboola click id + UTM params, so leads can be matched to campaigns/ads.
export function campaignParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of TRACKING_PARAMS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export async function submitLead(lead: Lead, mailtoAddress: string): Promise<"sent" | "mailto"> {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT as string | undefined;
  const payload = { ...lead, ...campaignParams(), page: window.location.href, source: "taboola-hansea-invest" };

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Lead endpoint responded ${res.status}`);
    trackLead();
    return "sent";
  }

  const body = [
    "Bitte senden Sie mir das kostenlose Infopaket zu Hansea Invest.",
    "",
    `Name: ${lead.name}`,
    `E-Mail: ${lead.email}`,
    lead.phone ? `Telefon: ${lead.phone}` : null,
    `Geplanter Betrag: ${lead.amount}`,
    ...Object.entries(campaignParams()).map(([k, v]) => `${k}: ${v}`),
  ]
    .filter((line) => line !== null)
    .join("\n");
  window.location.href = `mailto:${mailtoAddress}?subject=${encodeURIComponent(
    "Infopaket Hansea Invest",
  )}&body=${encodeURIComponent(body)}`;
  trackLead();
  return "mailto";
}

export function trackLead() {
  const accountId = import.meta.env.VITE_TABOOLA_ACCOUNT_ID as string | undefined;
  if (!window._tfa || !accountId) return;
  window._tfa.push({ notify: "event", name: "lead", id: Number(accountId) });
}
