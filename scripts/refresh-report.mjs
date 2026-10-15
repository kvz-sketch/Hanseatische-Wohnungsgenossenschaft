#!/usr/bin/env node
// Daily refresh of the Performance Marketing Report.
//
//   node scripts/refresh-report.mjs <meta.json> <perspective.json> [--date YYYY-MM-DD] [--dry-run]
//
// Merges a fresh Meta Ads pull (GIGxHansea) and a fresh Perspective contact
// pull into src/data/performance-report.json. Both input files are written by
// the refresh agent from MCP tool output — see docs/performance-report-refresh.md
// for their exact shape. They contain personal data (emails/phones, used only to
// spot duplicate submissions) and must never be committed: keep them outside
// the repo or under .report-input/ (git-ignored).
//
// What it does, per report campaign (each one is pinned to a Meta campaign or
// ad set via `meta: { level, id }`):
//   - spend / reach / impressions / Meta results / cost per result, status,
//     daily budget and delivery dates come from Meta;
//   - every Meta ad under that campaign/ad set with spend > 0 is listed (ads are
//     matched by `metaAdId`; new ones are appended with Meta's name);
//   - perspectiveLeads / leadDates are recounted from Perspective contacts,
//     attributed by Meta ad ID (hsa_ad / ad_id / numeric utm_content), then by
//     ad name (utm_content), then by ad set / campaign ID; repeat submissions by
//     the same person (same email or phone) within a campaign count once;
//   - the campaign note is regenerated from those numbers.
// The CPL shown on the page is spend ÷ Perspective leads, computed in the UI.
// Hand-maintained fields (leadStatus, recommendations, videoUrl, image, badge,
// perspectiveFunnel/-Url) are left alone.
//
// Exits non-zero, without writing, if a sanity check fails.

import { readFileSync, writeFileSync } from "node:fs";

const REPORT_PATH = new URL("../src/data/performance-report.json", import.meta.url);

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
const dryRun = args.includes("--dry-run") && args.splice(args.indexOf("--dry-run"), 1);
const dateArg = flag("--date");
const [metaPath, perspectivePath] = args;
if (!metaPath || !perspectivePath) {
  console.error("usage: node scripts/refresh-report.mjs <meta.json> <perspective.json> [--date YYYY-MM-DD] [--dry-run]");
  process.exit(2);
}

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const perspective = JSON.parse(readFileSync(perspectivePath, "utf8"));

const problems = [];
const warnings = [];

// ---------- helpers ----------

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/** Calendar date in Europe/Berlin (YYYY-MM-DD) for an ISO timestamp. */
const berlinDate = (iso) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
const longDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
};
const shortDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d}. ${MONTHS_SHORT[m - 1]} ${y}`;
};
const eur = (v) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const round2 = (v) => Math.round(v * 100) / 100;

/** A real Meta ID (all digits), not an unresolved "{{ad.id}}" template. */
const metaId = (v) => (typeof v === "string" && /^\d{6,}$/.test(v.trim()) ? v.trim() : null);
const firstId = (...vals) => vals.map(metaId).find(Boolean) ?? null;

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const today = dateArg ?? meta.pulledAt ?? new Date().toISOString().slice(0, 10);

// ---------- Meta ----------

const byLevel = (level) => (meta.entities ?? []).filter((e) => e.level === level);
const campaignsById = new Map(byLevel("campaign").map((e) => [e.id, e]));
const adsetsById = new Map(byLevel("adset").map((e) => [e.id, e]));
const ads = byLevel("ad");
const adsById = new Map(ads.map((e) => [e.id, e]));
if (campaignsById.size === 0 || ads.length === 0) problems.push("meta.json has no campaigns or no ads — Meta pull looks empty.");

for (const e of meta.entities ?? []) {
  for (const k of ["spend", "reach", "impressions"]) {
    if (num(e[k]) === null) problems.push(`Meta ${e.level} ${e.id} (${e.name}) has no numeric ${k}.`);
  }
  if (num(e.reach) > num(e.impressions)) problems.push(`Meta ${e.level} ${e.id} (${e.name}): reach ${e.reach} > impressions ${e.impressions} — columns swapped?`);
}

/** Report campaign whose Meta entity contains this ad set / campaign. */
function reportCampaignFor({ adsetId, campaignId }) {
  return (
    report.campaigns.find((c) => c.meta?.level === "adset" && adsetId && c.meta.id === adsetId) ??
    report.campaigns.find((c) => c.meta?.level === "campaign" && campaignId && c.meta.id === campaignId) ??
    null
  );
}

// ---------- Perspective ----------

// Only completed form submissions count as leads.
const contacts = (perspective.contacts ?? []).filter((c) => c.convertedAt).map((c) => {
  const p = c.properties ?? {};
  const u = c.utmParams ?? {};
  let adId = firstId(p.hsa_ad, p.ad_id, u.utm_content);
  if (!adId && u.utm_content) {
    const byName = ads.filter((a) => a.name === u.utm_content.trim());
    if (byName.length === 1) adId = byName[0].id;
  }
  const ad = adId ? adsById.get(adId) : null;
  if (adId && !ad) warnings.push(`Perspective contact (${berlinDate(c.convertedAt)}) points to Meta ad ${adId}, which the Meta pull doesn't contain.`);
  const adsetId = ad?.parentId ?? firstId(p.hsa_grp, p.adset_id, u.utm_term);
  const campaignId = ad?.campaignId ?? adsetsById.get(adsetId)?.parentId ?? firstId(p.hsa_cam, p.campaign_id, p.utm_id, u.utm_id, u.utm_campaign);
  return {
    funnelId: c.funnelId,
    date: berlinDate(c.convertedAt),
    convertedAt: c.convertedAt,
    adId: ad ? adId : null,
    adsetId,
    campaignId,
    email: (c.email ?? "").trim().toLowerCase() || null,
    phone: (c.phone ?? "").replace(/\D/g, "").slice(-9) || null,
  };
});

const funnelIds = new Set(report.campaigns.map((c) => c.perspectiveFunnelId).filter(Boolean));
for (const id of funnelIds) {
  if (!(perspective.funnelsPulled ?? []).includes(id)) problems.push(`Perspective funnel ${id} was not pulled (missing from funnelsPulled).`);
}

/** Drops repeat submissions by the same person (email or phone), keeping the earliest. */
function dedupe(list) {
  const kept = [];
  let dropped = 0;
  for (const c of [...list].sort((a, b) => a.convertedAt.localeCompare(b.convertedAt))) {
    const same = kept.some((k) => (c.email && k.email === c.email) || (c.phone && c.phone.length >= 6 && k.phone === c.phone));
    if (same) dropped++;
    else kept.push(c);
  }
  return { kept, dropped };
}

// ---------- merge ----------

const assignedContacts = new Set();

for (const c of report.campaigns) {
  if (!c.meta) {
    warnings.push(`Report campaign "${c.name}" has no meta mapping — left unchanged.`);
    continue;
  }
  const entity = (c.meta.level === "adset" ? adsetsById : campaignsById).get(c.meta.id);
  if (!entity) {
    problems.push(`Meta ${c.meta.level} ${c.meta.id} for "${c.name}" is missing from the Meta pull.`);
    continue;
  }
  const parentCampaign = c.meta.level === "adset" ? campaignsById.get(entity.parentId) : entity;

  c.status = entity.status === "ACTIVE" ? "active" : "off";
  c.spend = round2(num(entity.spend));
  c.reach = num(entity.reach);
  c.impressions = num(entity.impressions);
  c.metaResults = num(entity.results) ?? 0;
  c.metaCostPerResult = num(entity.costPerResult);
  const budget = num(entity.dailyBudget) ?? num(parentCampaign?.dailyBudget);
  if (budget !== null) c.dailyBudget = budget;
  const start = entity.startTime ?? parentCampaign?.startTime;
  if (start) c.delivery = `${shortDate(start.slice(0, 10))} – ${c.status === "active" ? "laufend" : "pausiert"}`;

  // Ads: everything Meta has under this entity with spend, plus anything already listed.
  const entityAds = ads.filter((a) => (c.meta.level === "adset" ? a.parentId === c.meta.id : a.campaignId === c.meta.id));
  for (const a of entityAds) {
    let row = c.ads.find((r) => r.metaAdId === a.id);
    if (!row) {
      if (!(num(a.spend) > 0)) continue;
      row = { id: `meta-${a.id}`, name: a.name, metaAdId: a.id, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 };
      c.ads.push(row);
      warnings.push(`New ad "${a.name}" added to "${c.name}" (no thumbnail yet).`);
    }
    row.spend = round2(num(a.spend));
    row.reach = num(a.reach);
    row.impressions = num(a.impressions);
    row.metaResults = num(a.results) || null;
    row.metaCostPerResult = row.metaResults ? num(a.costPerResult) : null;
  }
  for (const row of c.ads) {
    if (!row.metaAdId) warnings.push(`Ad "${row.name}" in "${c.name}" has no metaAdId — numbers not refreshed.`);
    else if (!adsById.has(row.metaAdId)) warnings.push(`Ad "${row.name}" in "${c.name}" not in this Meta pull — kept last known numbers.`);
  }
  const adSpend = round2(c.ads.reduce((s, r) => s + r.spend, 0));
  if (Math.abs(adSpend - c.spend) > 0.05) problems.push(`"${c.name}": ads add up to ${eur(adSpend)} but Meta reports ${eur(c.spend)} — an ad is missing (archived/deleted ads with spend must be included).`);

  // Leads. A Meta lead-form campaign never reaches Perspective, so Meta's own
  // form-lead count is the real count; it has no per-lead dates, so it goes in
  // as undated leads (counted in "Gesamt", left out of week/month views).
  if (c.leadSource === "meta-form") {
    c.perspectiveLeads = 0;
    c.unattributedLeadsCount = c.metaResults;
    continue;
  }
  const mine = contacts.filter((k) => k.funnelId === c.perspectiveFunnelId && reportCampaignFor(k) === c);
  mine.forEach((k) => assignedContacts.add(k));
  const { kept, dropped } = dedupe(mine);
  const perAd = new Map();
  const unattributed = [];
  for (const k of kept) {
    const row = k.adId ? c.ads.find((r) => r.metaAdId === k.adId) : null;
    if (row) perAd.set(row, [...(perAd.get(row) ?? []), k.date]);
    else unattributed.push(k.date);
  }
  for (const row of c.ads) {
    const dates = (perAd.get(row) ?? []).sort();
    if (dates.length) {
      row.perspectiveLeads = dates.length;
      row.leadDates = dates;
    } else {
      delete row.perspectiveLeads;
      delete row.leadDates;
    }
  }
  if (unattributed.length) c.unattributedLeadDates = unattributed.sort();
  else delete c.unattributedLeadDates;
  delete c.unattributedLeadsCount;
  c.perspectiveLeads = kept.length;
  c.incomplete = false;

  const adList = c.ads.filter((r) => r.perspectiveLeads).map((r) => `${r.name}: ${r.perspectiveLeads}`).join(", ");
  const metaPart = c.metaResults
    ? `Meta meldet ${c.metaResults} Website-Leads${c.metaCostPerResult ? ` bei ${eur(c.metaCostPerResult)} je Lead` : ""}`
    : "Meta meldet keine Website-Leads";
  c.note =
    `${metaPart} — Perspective bestätigt ${kept.length} echte Kontakte${adList ? ` (${adList})` : ""}.` +
    (unattributed.length ? ` ${unattributed.length} Kontakt(e) ohne Anzeigen-Zuordnung, in der Kampagnensumme enthalten.` : "") +
    (dropped ? ` ${dropped} doppelte Anfrage(n) derselben Person nicht mitgezählt.` : "") +
    ` Stand ${longDate(today)}.`;
}

// Funnel contacts not tied to any report campaign (e.g. an unmapped campaign).
const extra = {};
for (const k of contacts) {
  if (assignedContacts.has(k) || !funnelIds.has(k.funnelId)) continue;
  const funnel = report.campaigns.find((c) => c.perspectiveFunnelId === k.funnelId).perspectiveFunnel;
  (extra[funnel] ??= []).push(k);
}
report.funnelExtraLeads = {};
for (const [funnel, list] of Object.entries(extra)) {
  const { kept } = dedupe(list);
  report.funnelExtraLeads[funnel] = {
    dates: kept.map((k) => k.date).sort(),
    note: `${kept.length} weitere CRM-Kontakt(e) in Perspective gehören zu keiner Kampagne dieses Reports (Meta-Kampagne: ${[...new Set(kept.map((k) => k.campaignId ?? "unbekannt"))].join(", ")}) — im Funnel-Gesamtwert enthalten.`,
  };
  warnings.push(`${kept.length} contact(s) in "${funnel}" match no report campaign — shown as funnel extra. Map their Meta campaign if it belongs in the report.`);
}

// Meta campaigns/ad sets with spend that the report doesn't cover.
const covered = (e) =>
  report.campaigns.some((c) => c.meta && (c.meta.id === e.id || (c.meta.level === "campaign" && e.parentId === c.meta.id) || (c.meta.level === "adset" && e.level === "campaign" && adsetsById.get(c.meta.id)?.parentId === e.id)));
for (const e of [...campaignsById.values(), ...adsetsById.values()]) {
  if (num(e.spend) > 0 && !covered(e)) warnings.push(`Meta ${e.level} "${e.name}" (${e.id}) has spend ${eur(num(e.spend))} but is not in the report.`);
}

report.asOf = longDate(today);
report.updatedAt = today;
report.note = `Kampagnen- und Anzeigendaten live aus dem Meta-Werbekonto ${report.metaAdAccount?.name ?? ""} (Stand ${longDate(today)}). Lead-Zahlen aus Perspective — echte CRM-Kontakte je Anzeige, über Meta-Anzeigen-ID bzw. UTM-Parameter zugeordnet, Mehrfach-Anfragen derselben Person einmal gezählt — ersetzen die von Meta gemeldeten Website-Leads. Lead-Formular-Kampagnen erfassen Leads direkt in Meta und haben keine Perspective-Zuordnung.`;

// ---------- output ----------

const totalSpend = round2(report.campaigns.reduce((s, c) => s + c.spend, 0));
const totalLeads =
  report.campaigns.reduce((s, c) => s + (c.leadSource === "meta-form" ? c.metaResults : c.perspectiveLeads), 0) +
  Object.values(report.funnelExtraLeads).reduce((s, f) => s + f.dates.length, 0);
console.log(`Stand ${report.asOf}: ${eur(totalSpend)} spend, ${totalLeads} leads, CPL ${totalLeads ? eur(totalSpend / totalLeads) : "—"}`);
for (const c of report.campaigns) {
  const leads = c.leadSource === "meta-form" ? c.metaResults : c.perspectiveLeads;
  const source = c.leadSource === "meta-form" ? "Meta-Formular" : "Perspective";
  console.log(`  ${c.status === "active" ? "●" : "○"} ${c.name}: ${eur(c.spend)} · Meta ${c.metaResults} · ${source} ${leads} · CPL ${leads ? eur(c.spend / leads) : "—"}`);
}
for (const w of warnings) console.log(`WARN ${w}`);
for (const p of problems) console.error(`FAIL ${p}`);

if (problems.length) {
  console.error("Not written — fix the inputs above and re-run.");
  process.exit(1);
}
if (dryRun) {
  console.log("Dry run — not written.");
} else {
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
  console.log("Wrote src/data/performance-report.json");
}
