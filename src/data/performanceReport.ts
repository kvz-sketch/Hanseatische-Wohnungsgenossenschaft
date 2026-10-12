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
import kaiTanemVideo1 from "../assets/ads/081026_Kai_Tanem_Video_1.jpg";
import kaiTanemVideo2 from "../assets/ads/081026_Kai_Tanem_Video_2.jpg";
import kaiTanemVideo3 from "../assets/ads/081026_Kai_Tanem_Video_3.jpg";

// Performance Marketing Report — Meta Ads campaign data.
//
// Meta-side numbers (spend, reach, impressions, metaResults, metaCostPerResult)
// refreshed from screenshots provided 2026-10-12 — campaign- and ad-set-level
// totals were cross-checked against the sum of their own ad-level rows before
// being entered here (all sums matched exactly except Hohenfelde's impressions,
// a known minor Meta reporting discrepancy between ad-set and ad-level windows).
//
// Perspective-side numbers (perspectiveLeads, leadDates) were pulled live via
// list_funnels + list_contacts (mcp__Perspective_Funnel_Landing_Page_Builder)
// on 2026-10-12, once the connector was reauthorized mid-session — real
// per-contact UTM data (utm_content, and for a few older contacts a stray
// hidden-field property carrying the ad name) for all 4 funnels, matched to
// individual ads. ad11 (081026_Kai & Tanem Video 3) now has its first real
// Perspective attribution (4 leads; Meta only reports 1). One Bergedorf
// contact (30.09.) has an unresolved UTM template placeholder in its link
// and stays unattributed; 3 Investor-Landing-Page contacts remain under
// `funnelExtraLeads` (a distinct, now-inactive predecessor Meta campaign ID,
// confirmed from their own utm_campaign value). leadStatus (neu/qualifiziert/
// etc.) was not re-pulled — it's a separate CRM pipeline field, out of scope
// for this lead-count refresh.
//
// `unattributedLeadsCount` (campaign) and `funnelExtraLeads[...].undatedCount`
// (funnel) remain available as an honest fallback for a future refresh that
// only yields a funnel-level total (e.g. a screenshot) without per-contact
// detail — see `src/lib/periodFilter.ts`. Nothing currently uses them.
//
// 051026_HSWG_FullService_Leadform is a new campaign using Meta's native lead
// form (not the Perspective-hosted funnel page), so it has no Perspective
// attribution at all — see its `note`.
//
// The Meta connector was unavailable in this session (no mcp__Meta__ tools
// were loadable) — all figures above are as last captured in the screenshots,
// not live. Once Meta is reachable from a session, re-pull via the Meta MCP
// tools to refresh everything below and fill the one known gap (the
// qualified-lead campaign's ad list is incomplete — see its `note`).

export const reportMeta = {
  asOf: "12. Oktober 2026",
  note:
    "Kampagnen- und Anzeigendaten laut Meta Ads Manager (Screenshots vom 12.10.2026) — der Meta-Connector war in dieser Session nicht erreichbar, daher keine Live-Daten über die API. Lead-Zahlen sind live aus Perspective abgeglichen (echte CRM-Kontakte je Anzeige, über UTM-Parameter zugeordnet, Stand 12.10.2026) und ersetzen die von Meta gemeldeten Zahlen, die Leads durchgehend unterzählen — am deutlichsten bei 081026_Kai & Tanem Video 3 (Meta: 1, Perspective: 4). Die neue Lead-Formular-Kampagne erfasst Leads direkt in Meta und läuft nicht über die Perspective-Funnel-Seite, daher ohne CRM-Zuordnung.",
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
  /** Link to watch the full video creative (Google Drive) — shown next to video ad thumbnails. */
  videoUrl?: string;
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
export const funnelExtraLeads: Record<
  string,
  { dates: string[]; note: string; undatedCount?: number; undatedNote?: string }
> = {
  "Hansea Invest – Investor Landing Page": {
    dates: ["2026-09-28", "2026-09-28", "2026-09-29"],
    note:
      "3 weitere CRM-Kontakte in Perspective sind einer Vorgänger-Kampagne (vor dem 16.09., Meta-Kampagnen-ID 120250297705070344) zugeordnet, die in keiner aktuellen Kampagne mehr auftaucht — im Funnel-Gesamtwert enthalten, aber keiner Kampagne oben zugeordnet.",
  },
};

export const campaigns: Campaign[] = [
  {
    id: "bergedorf",
    name: "290926_HSWG_Bergedorf_Static",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 1952.03,
    reach: 54185,
    impressions: 22142,
    delivery: "29. Sep 2026 – laufend",
    recommendations: 2,
    metaResults: 12,
    metaCostPerResult: 162.67,
    perspectiveLeads: 20,
    perspectiveFunnel: "Hamburg-Bergedorf Off-Market Landing Page",
    perspectiveFunnelUrl: "https://kapitalanlagen.hanseatischewohnungsgenossenschaft.de/bergedorf/",
    leadStatus: { neu: 5, nichtErreicht: 0, disqualifiziert: 2, abschluss: 1 },
    unattributedLeadDates: ["2026-09-30"],
    ads: [
      { id: "ad1", name: "280926_Bergedorf_Ad1", image: bgAd1, metaResults: null, metaCostPerResult: null, spend: 16.10, reach: 1975, impressions: 595 },
      { id: "ad2", name: "280926_Bergedorf_Ad2", image: bgAd2, metaResults: null, metaCostPerResult: null, spend: 33.45, reach: 1624, impressions: 996 },
      { id: "ad3", name: "280926_Bergedorf_Ad3", image: bgAd3, metaResults: 7, metaCostPerResult: 122.92, spend: 860.44, reach: 20212, impressions: 10288, perspectiveLeads: 9, leadDates: ["2026-10-05", "2026-10-05", "2026-10-06", "2026-10-08", "2026-10-08", "2026-10-09", "2026-10-09", "2026-10-10", "2026-10-11"] },
      { id: "ad4", name: "280926_Bergedorf_Ad4", image: bgAd4, metaResults: 4, metaCostPerResult: 156.78, spend: 627.11, reach: 13059, impressions: 6326, perspectiveLeads: 7, leadDates: ["2026-09-29", "2026-10-02", "2026-10-02", "2026-10-06", "2026-10-07", "2026-10-11", "2026-10-11"] },
      { id: "ad5", name: "280926_Bergedorf_Ad5", image: bgAd5, metaResults: 1, metaCostPerResult: 207.96, spend: 207.96, reach: 4852, impressions: 2456, perspectiveLeads: 1, leadDates: ["2026-09-29"] },
      { id: "ad6", name: "280926_Bergedorf_Ad6", image: bgAd6, metaResults: null, metaCostPerResult: null, spend: 68.41, reach: 2680, impressions: 1238, perspectiveLeads: 2, leadDates: ["2026-10-06", "2026-10-06"] },
      { id: "ad7", name: "280926_Bergedorf_Ad7", image: bgAd7, metaResults: null, metaCostPerResult: null, spend: 27.88, reach: 4339, impressions: 1964 },
      { id: "ad8", name: "280926_Bergedorf_Ad8", image: bgAd8, metaResults: null, metaCostPerResult: null, spend: 22.90, reach: 1004, impressions: 552 },
      { id: "ad9", name: "280926_Bergedorf_Ad9", image: bgAd9, metaResults: null, metaCostPerResult: null, spend: 87.78, reach: 4440, impressions: 2579 },
    ],
    note: "1 weiterer Lead im CRM (Alexander Mondani, 30.09.) ließ sich keiner Anzeige zuordnen — defekte UTM-Platzhalter im Linktext — in der Kampagnensumme enthalten. Vollständiger Perspective-Abgleich zum Stand 12.10.: Ad3: 9, Ad4: 7, Ad5: 1, Ad6: 2 (= 19) + 1 nicht zugeordnet = 20.",
  },
  {
    id: "hansea-invest-videos",
    name: "250926_Hansea Invest_Videos",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 389.00,
    reach: 11599,
    impressions: 7638,
    delivery: "25. Sep 2026 – laufend",
    recommendations: 5,
    metaResults: 2,
    metaCostPerResult: 194.50,
    perspectiveLeads: 2,
    perspectiveFunnel: "Hansea Invest – Investor Landing Page",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/invest/",
    leadStatus: { neu: 2, nichtErreicht: 0, disqualifiziert: 0 },
    ads: [
      { id: "video1", name: "250926_Hansea Invest_Videos", image: kaiVideo1, videoUrl: "https://drive.google.com/file/d/1j5hliFDCDd0NRZe8INuwqUecqNGB0D8c/view?usp=sharing", metaResults: 2, metaCostPerResult: 180.16, spend: 360.32, reach: 11142, impressions: 7529, perspectiveLeads: 2, leadDates: ["2026-10-03", "2026-10-04"] },
      { id: "video2", name: "250926_Hansea Invest_Video 2", image: kaiVideo2, videoUrl: "https://drive.google.com/file/d/10dbL2J4DB34mCyb85BSELPx4lFaXcJ_y/view?usp=sharing", metaResults: null, metaCostPerResult: null, spend: 4.17, reach: 90, impressions: 63 },
      { id: "video3", name: "250926_Hansea Invest_Video 3", image: kaiVideo3, videoUrl: "https://drive.google.com/file/d/1fRYAqebui1OPbla3FC_MGmZWpszYK6Lr/view?usp=sharing", metaResults: null, metaCostPerResult: null, spend: 24.51, reach: 367, impressions: 216 },
    ],
    note: "250926_Hansea Invest_Video 2 und 3 liefern mittlerweile aus (nicht mehr „in Vorbereitung“), bisher aber ohne eigene Leads. 250926_Hansea Invest_Videos bleibt die leadstärkste Anzeige der Gruppe.",
  },
  {
    id: "hohenfelde",
    name: "240926_HI_Hohenfelde_Static",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 2659.12,
    reach: 44883,
    impressions: 18705,
    delivery: "24. Sep 2026 – laufend",
    recommendations: 5,
    metaResults: 11,
    metaCostPerResult: 241.74,
    perspectiveLeads: 15,
    perspectiveFunnel: "Hansea Invest – Projekt Hamburg-Hohenfelde (neu)",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/hohenfeld/",
    leadStatus: { neu: 7, nichtErreicht: 3, disqualifiziert: 4 },
    ads: [
      { id: "ad1", name: "240926_HI_Hohenfelde_Ad1", image: hohenfeldeAd1, metaResults: 10, metaCostPerResult: 213.73, spend: 2137.34, reach: 34761, impressions: 15964, perspectiveLeads: 13, leadDates: ["2026-09-26", "2026-09-27", "2026-09-27", "2026-09-29", "2026-09-29", "2026-10-01", "2026-10-01", "2026-10-02", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-04", "2026-10-10"] },
      { id: "ad2", name: "240926_HI_Hohenfelde_Ad2", image: hohenfeldeAd2, metaResults: 1, metaCostPerResult: 521.78, spend: 521.78, reach: 10122, impressions: 5980, perspectiveLeads: 2, leadDates: ["2026-09-26", "2026-10-06"] },
    ],
    note: "Meta meldet zum Stand 12.10. 11 Website-Leads (Ad1: 10, Ad2: 1) bei €241,74 je Lead — Perspective bestätigt 15 echte CRM-Kontakte (Ad1: 13, Ad2: 2), d.h. Meta unterzählt weiterhin.",
  },
  {
    id: "hansea-invest-static",
    name: "160926_Hansea Invest_Static Ads_Funnel",
    status: "active",
    objective: "Website Leads",
    dailyBudget: 150.0,
    spend: 2260.63,
    reach: 296176,
    impressions: 42721,
    delivery: "24. Sep 2026 – laufend",
    recommendations: 6,
    metaResults: 10,
    metaCostPerResult: 226.06,
    perspectiveLeads: 12,
    perspectiveFunnel: "Hansea Invest – Investor Landing Page",
    perspectiveFunnelUrl: "https://hanseainvest.perspectivefunnel.com/invest/",
    leadStatus: { neu: 2, nichtErreicht: 2, disqualifiziert: 4 },
    note: "Meta meldet zum Stand 12.10. 10 Website-Leads (Ad2: 9, Ad6: 1) bei €226,06 je Lead — Perspective bestätigt 12 echte CRM-Kontakte (Ad2: 11, Ad6: 1), d.h. Meta unterzählt weiterhin.",
    ads: [
      { id: "ad01", name: "01-HI_Immobilienwert", badge: "Unveröffentlichte Änderungen", image: hiAd01, metaResults: null, metaCostPerResult: null, spend: 25.18, reach: 2932, impressions: 753 },
      { id: "ad02", name: "02-HI_Immobilienbeteiligung", image: hiAd02, metaResults: 9, metaCostPerResult: 228.94, spend: 2060.45, reach: 120569, impressions: 31737, perspectiveLeads: 11, leadDates: ["2026-09-26", "2026-09-29", "2026-09-29", "2026-10-01", "2026-10-01", "2026-10-03", "2026-10-04", "2026-10-06", "2026-10-09", "2026-10-09", "2026-10-10"] },
      { id: "ad03", name: "03-HI_Kai_Investieren", image: hiAd03, metaResults: null, metaCostPerResult: null, spend: 2.97, reach: 892, impressions: 296 },
      { id: "ad04", name: "04-HI_Connie_Immobilienentwicklung", image: hiAd04, metaResults: null, metaCostPerResult: null, spend: 6.16, reach: 5437, impressions: 915 },
      { id: "ad05", name: "05-HI_So_entsteht_Rendite", image: hiAd05, metaResults: null, metaCostPerResult: null, spend: 24.47, reach: 65120, impressions: 3461 },
      { id: "ad06", name: "06-HI_Selbstvermieter", image: hiAd06, metaResults: 1, metaCostPerResult: 83.11, spend: 83.11, reach: 93150, impressions: 6994, perspectiveLeads: 1, leadDates: ["2026-09-26"] },
      { id: "ad07", name: "07-HI_Kai_Testimonial", image: hiAd07, metaResults: null, metaCostPerResult: null, spend: 0.09, reach: 37, impressions: 19 },
      { id: "ad08", name: "08-HI_Ja_Nein", image: hiAd08, metaResults: null, metaCostPerResult: null, spend: 9.75, reach: 1779, impressions: 498 },
      { id: "ad09", name: "09-HI_EFT_Vergleich", image: hiAd09, metaResults: null, metaCostPerResult: null, spend: 48.45, reach: 6260, impressions: 1758 },
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
    spend: 1044.08,
    reach: 33241,
    impressions: 14891,
    delivery: "Seit 5. Okt 2026 – laufend",
    recommendations: 0,
    metaResults: 6,
    metaCostPerResult: 174.01,
    perspectiveLeads: 11,
    perspectiveFunnel: "Full-Service-Modell für Kapitalanlage-Immobilien",
    perspectiveFunnelUrl: "https://kapitalanlagen.hanseatischewohnungsgenossenschaft.de/fullservice/",
    incomplete: true,
    note: "Meta zeigt zum Stand 12.10. 6 Website-Leads (Ad4: 1, Ad5: 4, Kai & Tanem Video 3: 1) bei €174,01 je Lead — Perspective bestätigt 11 echte CRM-Kontakte (Ad4: 1, Ad5: 5, Ad6: 1, Kai & Tanem Video 3: 4), d.h. Meta unterzählt auch hier deutlich, besonders bei der neuen Video-Anzeige.",
    ads: [
      { id: "ad1", name: "051026_HSWG_FullService_1", image: fsAd1, metaResults: null, metaCostPerResult: null, spend: 32.78, reach: 1992, impressions: 1071 },
      { id: "ad2", name: "051026_HSWG_FullService_2", image: fsAd2, metaResults: null, metaCostPerResult: null, spend: 32.95, reach: 786, impressions: 473 },
      { id: "ad3", name: "051026_HSWG_FullService_3", image: fsAd3, metaResults: null, metaCostPerResult: null, spend: 25.91, reach: 821, impressions: 556 },
      { id: "ad4", name: "051026_HSWG_FullService_4", image: fsAd4, metaResults: 1, metaCostPerResult: 14.72, spend: 14.72, reach: 299, impressions: 178, perspectiveLeads: 1, leadDates: ["2026-10-06"] },
      { id: "ad5", name: "051026_HSWG_FullService_5", image: fsAd5, metaResults: 4, metaCostPerResult: 127.28, spend: 509.13, reach: 23029, impressions: 10858, perspectiveLeads: 5, leadDates: ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-11"] },
      { id: "ad6", name: "051026_HSWG_FullService_6", image: fsAd6, metaResults: null, metaCostPerResult: null, spend: 31.44, reach: 869, impressions: 632, perspectiveLeads: 1, leadDates: ["2026-10-05"] },
      { id: "ad7", name: "051026_HSWG_FullService_7", image: fsAd7, metaResults: null, metaCostPerResult: null, spend: 27.92, reach: 1619, impressions: 773 },
      { id: "ad8", name: "051026_HSWG_FullService_8", image: fsAd8, metaResults: null, metaCostPerResult: null, spend: 6.37, reach: 315, impressions: 199 },
      { id: "ad9", name: "081026_Kai & Tanem Video 1", image: kaiTanemVideo1, videoUrl: "https://drive.google.com/file/d/1VA4FFA3rrN_WSlZonV9JvtGIvP648Js4/view?usp=sharing", metaResults: null, metaCostPerResult: null, spend: 51.96, reach: 565, impressions: 441 },
      { id: "ad10", name: "081026_Kai & Tanem Video 2", image: kaiTanemVideo2, videoUrl: "https://drive.google.com/file/d/1lviaOcHK10y3lPFMsaa1yXS9QDJHmsB8/view?usp=sharing", metaResults: null, metaCostPerResult: null, spend: 7.18, reach: 66, impressions: 52 },
      { id: "ad11", name: "081026_Kai & Tanem Video 3", image: kaiTanemVideo3, videoUrl: "https://drive.google.com/file/d/1IJKysKs-8y_ZJuzxiHDP_WE6Svh7Wb6D/view?usp=sharing", metaResults: 1, metaCostPerResult: 303.72, spend: 303.72, reach: 2880, impressions: 1857, perspectiveLeads: 4, leadDates: ["2026-10-09", "2026-10-10", "2026-10-12", "2026-10-12"] },
    ],
  },
  {
    id: "fullservice-leadform",
    name: "051026_HSWG_FullService_Leadform",
    status: "active",
    objective: "Leads (Formular)",
    dailyBudget: 100.0,
    spend: 335.11,
    reach: 7583,
    impressions: 5769,
    delivery: "Neue Kampagne – genaues Startdatum nicht im Screenshot erkennbar",
    recommendations: 0,
    metaResults: 12,
    metaCostPerResult: 27.93,
    perspectiveLeads: 0,
    perspectiveFunnel: "Full-Service-Modell – Meta Lead-Formular (kein Perspective-Funnel)",
    perspectiveFunnelUrl: "https://kapitalanlagen.hanseatischewohnungsgenossenschaft.de/fullservice/",
    incomplete: true,
    note: "Neue Kampagne mit Meta-nativem Lead-Formular statt Website-Funnel — Leads werden direkt in Meta erfasst, nicht auf der Perspective-Funnel-Seite. Der Perspective-Connector war in dieser Session nicht erreichbar (Autorisierung erforderlich), daher keine CRM-Zuordnung möglich. Gezeigt werden ausschließlich die von Meta gemeldeten Lead-Formular-Ergebnisse.",
    ads: [
      { id: "lf-ad1", name: "051026_HSWG_FullService_1_Leadform", image: fsAd1, metaResults: null, metaCostPerResult: null, spend: 2.03, reach: 94, impressions: 70 },
      { id: "lf-ad2", name: "051026_HSWG_FullService_2_Leadform", image: fsAd2, metaResults: null, metaCostPerResult: null, spend: 0.18, reach: 8, impressions: 5 },
      { id: "lf-ad3", name: "051026_HSWG_FullService_3_Leadform", image: fsAd3, metaResults: null, metaCostPerResult: null, spend: 3.63, reach: 59, impressions: 54 },
      { id: "lf-ad4", name: "051026_HSWG_FullService_4_Leadform", image: fsAd4, metaResults: null, metaCostPerResult: null, spend: 0, reach: 0, impressions: 0 },
      { id: "lf-ad5", name: "051026_HSWG_FullService_5_Leadform", image: fsAd5, metaResults: 2, metaCostPerResult: 8.60, spend: 17.19, reach: 312, impressions: 245 },
      { id: "lf-ad6", name: "051026_HSWG_FullService_6_Leadform", image: fsAd6, metaResults: null, metaCostPerResult: null, spend: 0.36, reach: 13, impressions: 13 },
      { id: "lf-ad7", name: "051026_HSWG_FullService_7_Leadform", image: fsAd7, metaResults: null, metaCostPerResult: null, spend: 1.24, reach: 25, impressions: 23 },
      { id: "lf-ad8", name: "051026_HSWG_FullService_8_Leadform", image: fsAd8, metaResults: 1, metaCostPerResult: 12.55, spend: 12.55, reach: 248, impressions: 211 },
      { id: "lf-ad9", name: "081026_Kai & Tanem Video 1_Leadform", image: kaiTanemVideo1, videoUrl: "https://drive.google.com/file/d/1VA4FFA3rrN_WSlZonV9JvtGIvP648Js4/view?usp=sharing", metaResults: 3, metaCostPerResult: 26.56, spend: 79.68, reach: 910, impressions: 764 },
      { id: "lf-ad10", name: "081026_Kai & Tanem Video 2_Leadform", image: kaiTanemVideo2, videoUrl: "https://drive.google.com/file/d/1lviaOcHK10y3lPFMsaa1yXS9QDJHmsB8/view?usp=sharing", metaResults: null, metaCostPerResult: null, spend: 23.49, reach: 196, impressions: 173 },
      { id: "lf-ad11", name: "081026_Kai & Tanem Video 3_Leadform", image: kaiTanemVideo3, videoUrl: "https://drive.google.com/file/d/1IJKysKs-8y_ZJuzxiHDP_WE6Svh7Wb6D/view?usp=sharing", metaResults: 6, metaCostPerResult: 32.46, spend: 194.76, reach: 5718, impressions: 4737 },
    ],
  },
];
