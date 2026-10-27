// Taboola conversion tracking for the Hansea Invest page.
//
// VITE_TABOOLA_ACCOUNT_ID  Taboola advertiser account id. The Taboola pixel
//                          itself is loaded by the consent tool / tag manager
//                          once the visitor has agreed; this only fires the
//                          "lead" event if the pixel is present.

type TaboolaQueue = { push: (event: Record<string, unknown>) => void };

declare global {
  interface Window {
    _tfa?: TaboolaQueue;
  }
}

export function trackLead() {
  const accountId = import.meta.env.VITE_TABOOLA_ACCOUNT_ID as string | undefined;
  if (!window._tfa || !accountId) return;
  window._tfa.push({ notify: "event", name: "lead", id: Number(accountId) });
}
