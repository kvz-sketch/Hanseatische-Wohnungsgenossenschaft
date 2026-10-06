import hiAd01 from "../assets/ads/01-HI_Immobilienwert.jpg";
import hiAd02 from "../assets/ads/02-HI_Immobilienbeteiligung.jpg";
import hiAd03 from "../assets/ads/03-HI_Kai_Investieren.jpg";
import hiAd04 from "../assets/ads/04-HI_Connie_Immobilienentwicklung.jpg";
import hiAd05 from "../assets/ads/05-HI_So_entsteht_Rendite.jpg";
import hiAd06 from "../assets/ads/06-HI_Selbstvermieter.jpg";
import hiAd07 from "../assets/ads/07-HI_Kai_Testimonial.jpg";
import hiAd08 from "../assets/ads/08-HI_Ja_Nein.jpg";
import hiAd09 from "../assets/ads/09-HI_EFT_Vergleich.jpg";
import bgAd1 from "../assets/ads/280926_Bergedorf_Ad1.jpg";
import bgAd2 from "../assets/ads/280926_Bergedorf_Ad2.jpg";
import bgAd3 from "../assets/ads/280926_Bergedorf_Ad3.jpg";
import bgAd4 from "../assets/ads/280926_Bergedorf_Ad4.jpg";
import bgAd5 from "../assets/ads/280926_Bergedorf_Ad5.jpg";
import bgAd6 from "../assets/ads/280926_Bergedorf_Ad6.jpg";
import bgAd7 from "../assets/ads/280926_Bergedorf_Ad7.jpg";
import bgAd8 from "../assets/ads/280926_Bergedorf_Ad8.jpg";
import bgAd9 from "../assets/ads/280926_Bergedorf_Ad9.jpg";
import hohenfeldeAd1 from "../assets/ads/240926_HI_Hohenfelde_Ad1.jpg";
import hohenfeldeAd2 from "../assets/ads/240926_HI_Hohenfelde_Ad2.jpg";
import fsAd1 from "../assets/ads/051026_HSWG_FullService_1.jpg";
import fsAd2 from "../assets/ads/051026_HSWG_FullService_2.jpg";
import fsAd3 from "../assets/ads/051026_HSWG_FullService_3.jpg";
import fsAd4 from "../assets/ads/051026_HSWG_FullService_4.jpg";
import fsAd5 from "../assets/ads/051026_HSWG_FullService_5.jpg";
import fsAd6 from "../assets/ads/051026_HSWG_FullService_6.jpg";
import fsAd7 from "../assets/ads/051026_HSWG_FullService_7.jpg";
import fsAd8 from "../assets/ads/051026_HSWG_FullService_8.jpg";
import kaiVideo1 from "../assets/ads/261005_hanseainvest_ads_kai_1.jpg";
import kaiVideo2 from "../assets/ads/261005_hanseainvest_ads_kai_2.jpg";
import kaiVideo3 from "../assets/ads/261005_hanseainvest_ads_kai_3.jpg";

// Performance Marketing Report — Meta Ads campaign data.
//
// Source: screenshots provided 2026-10-05, cross-referenced against each other
// (the two campaign-list screenshots are the same campaigns at two different
// points in time — ad-level spend sums were used to confirm which snapshot
// belongs to which total) and against real lead data pulled from Perspective
// (CRM contacts matched to campaigns/ads via UTM + Meta campaign/adset/ad ID
// on each contact record — no personal lead data is reproduced here, only
// aggregated counts).
//
// The Meta connector was unavailable in this session (shows "needs_reconnect";
// no mcp__Meta__ tools were loadable) — campaign/ad names, budgets, reach and
// impressions below are as last captured in the screenshots, not live. Once
// Meta is reachable from a session, re-pull via the Meta MCP tools to refresh
// everything below and fill the one known gap (the qualified-lead campaign's
// ad list is incomplete — see its `note`).

export const reportMeta = {
  asOf: "6. Oktober 2026",
  note:
    "Kampagnen- und Anzeigendaten laut Meta Ads Manager (Screenshots vom 05.10.2026) — der Meta-Connector war in dieser Session nicht erreichbar (Status „needs_reconnect“), daher keine Live-Daten. Lead-Zahlen sind mit den echten CRM-Kontakten aus Perspective abgeglichen (Zuordnung über Meta Campaign/Adset/Ad-ID je Kontakt) und ersetzen die von Meta gemeldeten Pixel-Zahlen, die Leads durchgehend unterzählen.",
};

export type AdStat = {
  id: string;
  name: string;
  badge?: string; // "Unveröffentlichte Änderungen", "Kopie", "Keine Auslieferung"
  image?: string;
  metaResults: number | null;
  metaCostPerResult: number | null;
  spend: number;
  reach: number;
  impressions: number;
  perspectiveLeads?: number;
  /** Real Perspective contact conversion dates (YYYY-MM-DD, no personal data) — powers the week/month filter. */
  leadDates?: string[];
};

export type LeadStatus = {
  neu: number;
  nichtErreicht: number;
  disqualifiziert: number;
  abschluss?: number;
};

export type Campaign = {
  id: string;
  name: string;
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
  leadStatus?: LeadStatus;
  ads: AdStat[];
  incomplete?: boolean;
  note?: string;
  /** Leads counted in perspectiveLeads that aren't tied to one specific ad (dates only, no personal data). */
  unattributedLeadDates?: string[];
};

/**
 * Leads that belong to a funnel but not to any currently-tracked campaign
 * (e.g. a pre-16.09 predecessor campaign) — shown in the funnel-group total
 * but excluded from every individual campaign's numbers.
 */
export const funnelExtraLeads: Record<string, { dates: string[]; note: string }> = {
  "Hansea Invest – Investor Landing Page": {
    dates: ["2026-09-28", "2026-09-28", "2026-09-29"],
    note:
      "3 weitere CRM-Kontakte in Perspective sind einer Vorgänger-Kampagne (vor dem 16.09.) zugeordnet, die in keiner aktuellen Kampagne mehr auftaucht — im Funnel-Gesamtwert enthalten, aber keiner Kampagne oben zugeordnet.",
  },
};

export const campaigns: Campaign[] = [
  {
    id: "bergedorf",
    name: "290926_HSWG_Bergedorf_Static",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 879.32,
    reach: 39057,
    impressions: 16260,
    delivery: "29. Sep 2026 – laufend",
    recommendations: 2,
    metaResults: 2,
    metaCostPerResult: 439.66,
    perspectiveLeads: 8,
    perspectiveFunnel: "Hamburg-Bergedorf Off-Market Landing Page",
    perspectiveFunnelUrl: "https://kapitalanlagen.hanseatischewohnungsgenossenschaft.de/bergedorf/",
    leadStatus: { neu: 5, nichtErreicht: 0, disqualifiziert: 2, abschluss: 1 },
    unattributedLeadDates: ["2026-09-30"],
    ads: [
      { id: "ad1", name: "280926_Bergedorf_Ad1", image: bgAd1, metaResults: null, metaCostPerResult: null, spend: 15.75, reach: 1973, impressions: 593 },
      { id: "ad2", name: "280926_Bergedorf_Ad2", image: bgAd2, metaResults: null, metaCostPerResult: null, spend: 32.74, reach: 1580, impressions: 977 },
      { id: "ad3", name: "280926_Bergedorf_Ad3", image: bgAd3, metaResults: null, metaCostPerResult: null, spend: 286.29, reach: 14598, impressions: 7619, perspectiveLeads: 2, leadDates: ["2026-10-05", "2026-10-05"] },
      { id: "ad4", name: "280926_Bergedorf_Ad4", image: bgAd4, metaResults: 1, metaCostPerResult: 258.05, spend: 258.05, reach: 5972, impressions: 3278, perspectiveLeads: 4, leadDates: ["2026-09-29", "2026-10-02", "2026-10-02", "2026-10-06"] },
      { id: "ad5", name: "280926_Bergedorf_Ad5", image: bgAd5, metaResults: 1, metaCostPerResult: 139.24, spend: 139.24, reach: 4269, impressions: 2207, perspectiveLeads: 1, leadDates: ["2026-09-29"] },
      { id: "ad6", name: "280926_Bergedorf_Ad6", image: bgAd6, metaResults: null, metaCostPerResult: null, spend: 24.7, reach: 1712, impressions: 814 },
      { id: "ad7", name: "280926_Bergedorf_Ad7", image: bgAd7, metaResults: null, metaCostPerResult: null, spend: 26.23, reach: 4202, impressions: 1920 },
      { id: "ad8", name: "280926_Bergedorf_Ad8", image: bgAd8, metaResults: null, metaCostPerResult: null, spend: 21.8, reach: 806, impressions: 453 },
      { id: "ad9", name: "280926_Bergedorf_Ad9", image: bgAd9, metaResults: null, metaCostPerResult: null, spend: 74.52, reach: 3945, impressions: 2381 },
    ],
    note: "1 weiterer Lead im CRM ließ sich keiner einzelnen Anzeige zuordnen (Tracking-Parameter nicht aufgelöst) — in der Kampagnensumme enthalten.",
  },
  {
    id: "hansea-invest-videos",
    name: "250926_Hansea Invest_Videos",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 292.38,
    reach: 9567,
    impressions: 6858,
    delivery: "25. Sep 2026 – laufend",
    recommendations: 5,
    metaResults: 2,
    metaCostPerResult: 151.89,
    perspectiveLeads: 2,
    perspectiveFunnel: "Hansea Invest – Investor Landing Page",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/invest/",
    leadStatus: { neu: 2, nichtErreicht: 0, disqualifiziert: 0 },
    ads: [
      { id: "video1", name: "250926_Hansea Invest_Videos", image: kaiVideo1, metaResults: 2, metaCostPerResult: 151.89, spend: 292.38, reach: 9567, impressions: 6858, perspectiveLeads: 2, leadDates: ["2026-10-03", "2026-10-04"] },
      { id: "video2", name: "250926_Hansea Invest_Video 2", badge: "In Vorbereitung", image: kaiVideo2, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 },
      { id: "video3", name: "250926_Hansea Invest_Video 3", badge: "In Vorbereitung", image: kaiVideo3, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 },
    ],
    note: "2 neue Video-Anzeigen (250926_Hansea Invest_Video 2 und 3) wurden angelegt und befinden sich laut Meta noch in Vorbereitung (noch keine Auslieferung). 250926_Hansea Invest_Videos ist die bereits laufende Original-Anzeige.",
  },
  {
    id: "hohenfelde",
    name: "240926_HI_Hohenfelde_Static",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 1592.61,
    reach: 27297,
    impressions: 12841,
    delivery: "24. Sep 2026 – laufend",
    recommendations: 5,
    metaResults: 9,
    metaCostPerResult: 176.96,
    perspectiveLeads: 14,
    perspectiveFunnel: "Hansea Invest – Projekt Hamburg-Hohenfelde (neu)",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/hohenfeld/",
    leadStatus: { neu: 7, nichtErreicht: 3, disqualifiziert: 4 },
    ads: [
      { id: "ad1", name: "240926_HI_Hohenfelde_Ad1", image: hohenfeldeAd1, metaResults: 9, metaCostPerResult: 162.39, spend: 1461.5, reach: 25163, impressions: 12320, perspectiveLeads: 12, leadDates: ["2026-09-26", "2026-09-27", "2026-09-27", "2026-09-29", "2026-09-29", "2026-10-01", "2026-10-01", "2026-10-02", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-04"] },
      { id: "ad2", name: "240926_HI_Hohenfelde_Ad2", image: hohenfeldeAd2, metaResults: null, metaCostPerResult: null, spend: 131.11, reach: 2134, impressions: 1288, perspectiveLeads: 2, leadDates: ["2026-09-26", "2026-10-06"] },
    ],
  },
  {
    id: "hansea-invest-static",
    name: "160926_Hansea Invest_Static Ads_Funnel",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 1319.75,
    reach: 270530,
    impressions: 31798,
    delivery: "24. Sep 2026 – laufend",
    recommendations: 6,
    metaResults: 8,
    metaCostPerResult: 164.97,
    perspectiveLeads: 8,
    perspectiveFunnel: "Hansea Invest – Investor Landing Page",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/invest/",
    leadStatus: { neu: 2, nichtErreicht: 2, disqualifiziert: 4 },
    ads: [
      { id: "ad01", name: "01-HI_Immobilienwert", badge: "Unveröffentlichte Änderungen", image: hiAd01, metaResults: null, metaCostPerResult: null, spend: 24.36, reach: 2909, impressions: 746 },
      { id: "ad02", name: "02-HI_Immobilienbeteiligung", image: hiAd02, metaResults: 7, metaCostPerResult: 160.17, spend: 1121.21, reach: 94975, impressions: 21095, perspectiveLeads: 7, leadDates: ["2026-09-26", "2026-09-29", "2026-09-29", "2026-10-01", "2026-10-01", "2026-10-03", "2026-10-04"] },
      { id: "ad03", name: "03-HI_Kai_Investieren", image: hiAd03, metaResults: null, metaCostPerResult: null, spend: 2.76, reach: 890, impressions: 294 },
      { id: "ad04", name: "04-HI_Connie_Immobilienentwicklung", image: hiAd04, metaResults: null, metaCostPerResult: null, spend: 6.16, reach: 5437, impressions: 915 },
      { id: "ad05", name: "05-HI_So_entsteht_Rendite", image: hiAd05, metaResults: null, metaCostPerResult: null, spend: 24.14, reach: 65105, impressions: 3461 },
      { id: "ad06", name: "06-HI_Selbstvermieter", image: hiAd06, metaResults: 1, metaCostPerResult: 83.01, spend: 83.01, reach: 93147, impressions: 6994, perspectiveLeads: 1, leadDates: ["2026-09-26"] },
      { id: "ad07", name: "07-HI_Kai_Testimonial", image: hiAd07, metaResults: null, metaCostPerResult: null, spend: 0.05, reach: 32, impressions: 16 },
      { id: "ad08", name: "08-HI_Ja_Nein", image: hiAd08, metaResults: null, metaCostPerResult: null, spend: 9.75, reach: 1779, impressions: 498 },
      { id: "ad09", name: "09-HI_EFT_Vergleich", image: hiAd09, metaResults: null, metaCostPerResult: null, spend: 48.31, reach: 6256, impressions: 1753 },
    ],
  },
  {
    id: "hansea-invest-qualified",
    name: "160926_Hansea Invest_Static Ads_Funnel_qualified Lead",
    status: "off",
    objective: "Marketing-qualifizierter Lead",
    dailyBudget: 150.0,
    spend: 796.72,
    reach: 151863,
    impressions: 27005,
    delivery: "21. Sep 2026 – laufend",
    recommendations: 2,
    metaResults: 0,
    metaCostPerResult: null,
    perspectiveLeads: 0,
    perspectiveFunnel: "Hansea Invest – Investor Landing Page",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/invest/",
    incomplete: true,
    note: "8 von vermutlich 9 Anzeigen bekannt (bekannte Anzeigen summieren sich auf 423,08 € von 796,72 € Gesamtausgabe) — wahrscheinlich fehlt noch „09-HI_EFT_Vergleich_qualified Lead“. Vollständige Anzeigenliste folgt, sobald Meta in einer neuen Session erreichbar ist.",
    ads: [
      { id: "q-ad01", name: "01-HI_Immobilienwert_qualified Lead", badge: "Kopie", image: hiAd01, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 },
      { id: "q-ad02", name: "02-HI_Immobilienbeteiligung_qualified Lead", image: hiAd02, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 },
      { id: "q-ad03", name: "03-HI_Kai_Investieren_qualified Lead", image: hiAd03, metaResults: null, metaCostPerResult: null, spend: 150.97, reach: 44484, impressions: 10529 },
      { id: "q-ad04", name: "04-HI_Connie_Immobilienentwicklung_qualified Lead", image: hiAd04, metaResults: null, metaCostPerResult: null, spend: 16.25, reach: 1299, impressions: 413 },
      { id: "q-ad05", name: "05-HI_So_entsteht_Rendite_qualified Lead", image: hiAd05, metaResults: null, metaCostPerResult: null, spend: 42.55, reach: 23734, impressions: 2970 },
      { id: "q-ad06", name: "06-HI_Selbstvermieter_qualified Lead", image: hiAd06, metaResults: null, metaCostPerResult: null, spend: 125.69, reach: 35285, impressions: 6078 },
      { id: "q-ad07", name: "07-HI_Kai_Testimonial_qualified Lead", image: hiAd07, metaResults: null, metaCostPerResult: null, spend: 12.96, reach: 1768, impressions: 484 },
      { id: "q-ad08", name: "08-HI_Ja_Nein_qualified Lead", image: hiAd08, metaResults: null, metaCostPerResult: null, spend: 74.66, reach: 13933, impressions: 4955 },
    ],
  },
  {
    id: "fullservice",
    name: "051026_HSWG_FullService_Leads",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 72.18,
    reach: 1248,
    impressions: 1027,
    delivery: "Seit 5. Okt 2026 – laufend",
    recommendations: 0,
    metaResults: 1,
    metaCostPerResult: 72.18,
    perspectiveLeads: 4,
    perspectiveFunnel: "Full-Service-Modell für Kapitalanlage-Immobilien",
    perspectiveFunnelUrl: "https://kapitalanlagen.hanseatischewohnungsgenossenschaft.de/fullservice/",
    incomplete: true,
    note: "Neue Kampagne. Meta zeigt nur 1 Lead bei 051026_HSWG_FullService_5 — die tatsächliche Anzeigen-Zuordnung der 4 Perspective-Leads (Ad4: 1, Ad5: 2, Ad6: 1) kommt aus den echten UTM-Parametern je CRM-Kontakt, da Meta Leads durchgehend unterzählt.",
    ads: [
      { id: "ad1", name: "051026_HSWG_FullService_1", image: fsAd1, metaResults: null, metaCostPerResult: null, spend: 25.31, reach: 526, impressions: 423 },
      { id: "ad2", name: "051026_HSWG_FullService_2", image: fsAd2, metaResults: null, metaCostPerResult: null, spend: 0.23, reach: 6, impressions: 6 },
      { id: "ad3", name: "051026_HSWG_FullService_3", image: fsAd3, metaResults: null, metaCostPerResult: null, spend: 0.08, reach: 11, impressions: 11 },
      { id: "ad4", name: "051026_HSWG_FullService_4", image: fsAd4, metaResults: null, metaCostPerResult: null, spend: 3.23, reach: 106, impressions: 64, perspectiveLeads: 1, leadDates: ["2026-10-06"] },
      { id: "ad5", name: "051026_HSWG_FullService_5", image: fsAd5, metaResults: 1, metaCostPerResult: 18.70, spend: 18.70, reach: 338, impressions: 300, perspectiveLeads: 2, leadDates: ["2026-10-05", "2026-10-06"] },
      { id: "ad6", name: "051026_HSWG_FullService_6", image: fsAd6, metaResults: null, metaCostPerResult: null, spend: 12.57, reach: 205, impressions: 167, perspectiveLeads: 1, leadDates: ["2026-10-05"] },
      { id: "ad7", name: "051026_HSWG_FullService_7", image: fsAd7, metaResults: null, metaCostPerResult: null, spend: 11.86, reach: 49, impressions: 49 },
      { id: "ad8", name: "051026_HSWG_FullService_8", image: fsAd8, metaResults: null, metaCostPerResult: null, spend: 0.20, reach: 7, impressions: 7 },
    ],
  },
];
