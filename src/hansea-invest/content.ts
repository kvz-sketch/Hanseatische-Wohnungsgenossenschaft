// Copy for the Hansea Invest Taboola landing page (/hansea-invest/).
//
// Product facts (min. amount, target dividend, payout rhythm, minimum term) are
// the ones already stated on the GIG homepage (src/data/content.ts). Everything
// marked "VERIFY" must be checked against the Satzung / Beitrittsunterlagen of
// Hanseatische Invest eG before the campaign goes live.

export const offer = {
  issuer: "Hanseatische Invest eG",
  brand: "Hansea Invest",
  targetDividend: 7, // % p.a., target, not guaranteed — set by the Generalversammlung
  minAmount: 10_000, // € — VERIFY
  payout: "quartalsweise", // VERIFY
  minTermYears: 1, // VERIFY
};

export const contact = {
  phone: "+49 40 22862372-0",
  phoneHref: "tel:+4940228623720",
  email: "info@gerlachgroup.de",
  address: "Langenhorner Chaussee 155, 22415 Hamburg",
};

export const facts = [
  { value: `bis ${offer.targetDividend} %`, label: "Ziel-Dividende p. a." },
  { value: "ab 10.000 €", label: "Beteiligung" },
  { value: "Quartalsweise", label: "Ausschüttung" },
  { value: `${offer.minTermYears} Jahr`, label: "Mindestlaufzeit" },
];

export const steps = [
  {
    title: "Mitglied werden",
    description:
      "Sie zeichnen Genossenschaftsanteile der Hanseatische Invest eG und werden Mitglied mit Stimmrecht in der Generalversammlung.",
  },
  {
    title: "Kapital arbeitet in Hamburg",
    description:
      "Die Genossenschaft investiert in Wohnimmobilien in Hamburg und Norddeutschland, die saniert, vermietet und langfristig gehalten werden.",
  },
  {
    title: "An Mieteinnahmen teilhaben",
    description:
      "Aus dem Überschuss beschließt die Generalversammlung eine Dividende. Ziel sind bis zu 7 % p. a., ausgezahlt quartalsweise.",
  },
];

export const reasons = [
  {
    title: "Sachwert statt Zahlen auf Papier",
    description:
      "Hinter Ihren Anteilen stehen echte Mietwohnungen — keine Aktienkurse, keine komplizierten Finanzprodukte.",
  },
  {
    title: "Wohnraum ist gefragt",
    description:
      "In Hamburg und seinem Umland ist bezahlbarer Wohnraum knapp. Gut gepflegte Bestandswohnungen sind langfristig gesucht.",
  },
  {
    title: "Das Genossenschaftsprinzip",
    description:
      "Eine eG gehört ihren Mitgliedern. Jedes Mitglied hat eine Stimme — unabhängig davon, wie viele Anteile es hält.",
  },
];

export const group = {
  heading: "Hinter Hansea Invest steht die Gerlach Immobilien Gruppe",
  paragraph:
    "Die Gerlach Immobilien Gruppe aus Hamburg erwirbt und entwickelt Mehrfamilienhäuser in Norddeutschland — vom Ankauf über die Sanierung bis zur Vermietung und Verwaltung. Über die Hanseatische Invest eG können sich auch Privatanleger an diesem Bestand beteiligen.",
  points: [
    "Ankauf & Bestand in Norddeutschland",
    "Nachhaltige Sanierung & Entwicklung",
    "Vermietung & Verwaltung aus einer Hand",
  ],
};

export const opportunities = [
  `Ziel-Dividende von bis zu ${offer.targetDividend} % p. a.`,
  "Quartalsweise Ausschüttung",
  "Beteiligung an realen Wohnimmobilien in Hamburg",
  "Mitbestimmung als Genossenschaftsmitglied",
];

// VERIFY: align with the official Risikohinweise in the Beitrittsunterlagen.
export const risks = [
  "Die Dividende ist nicht garantiert. Sie hängt vom wirtschaftlichen Ergebnis ab und wird jährlich von der Generalversammlung beschlossen.",
  "Genossenschaftsanteile sind nicht börsennotiert. Eine Rückzahlung ist nur nach Kündigung unter Einhaltung der satzungsgemäßen Fristen möglich.",
  "Leerstand, Instandhaltungskosten oder sinkende Immobilienwerte können das Ergebnis belasten.",
  "Im ungünstigsten Fall ist ein Verlust des eingesetzten Kapitals bis hin zum Totalverlust möglich.",
];

export const faq = [
  {
    q: "Was genau erwerbe ich?",
    a: "Sie erwerben Genossenschaftsanteile der Hanseatische Invest eG und werden damit Mitglied der Genossenschaft. Die Genossenschaft hält und bewirtschaftet Wohnimmobilien in Hamburg und Norddeutschland.",
  },
  {
    q: "Ab welchem Betrag kann ich mich beteiligen?",
    a: "Eine Beteiligung ist ab 10.000 € möglich. Die genauen Konditionen erhalten Sie mit dem kostenlosen Infopaket.",
  },
  {
    q: "Wie kommen die bis zu 7 % zustande?",
    a: "Die Dividende wird aus den Überschüssen der Genossenschaft, vor allem aus Mieteinnahmen, gezahlt und jedes Jahr von der Generalversammlung beschlossen. 7 % p. a. sind das Ziel, keine feste Zusage.",
  },
  {
    q: "Wann und wie oft wird ausgezahlt?",
    a: "Die Ausschüttung erfolgt quartalsweise. Die Mindestlaufzeit beträgt ein Jahr.",
  },
  {
    q: "Wie komme ich wieder an mein Geld?",
    a: "Sie können Ihre Mitgliedschaft bzw. Ihre Anteile kündigen. Die Auszahlung des Auseinandersetzungsguthabens erfolgt nach den Fristen der Satzung — Details stehen im Infopaket.",
  },
  {
    q: "Ist das Infopaket wirklich kostenlos und unverbindlich?",
    a: "Ja. Sie erhalten alle Unterlagen kostenlos und entscheiden danach in Ruhe, ob eine Beteiligung zu Ihnen passt.",
  },
];

// HubSpot form embedded in the hero card. Copy the values from the form's
// embed code in HubSpot (Marketing → Forms → Share → Embed code):
//   region   → data-region / "region" (e.g. "eu1", "na1")
//   portalId → data-portal-id / "portalId"
//   formId   → data-form-id / "formId"
// embed: "frame" for forms built in the new forms editor (embed code contains
// class="hs-form-frame"), "legacy" for old forms (hbspt.forms.create(...)).
export const hubspot = {
  region: "eu1",
  portalId: "",
  formId: "",
  embed: "frame" as "frame" | "legacy",
};

export const legal = {
  imprint: "https://gerlachgroup.de/impressum/",
  privacy: "https://gerlachgroup.de/datenschutzerklarung/",
  riskNotice:
    "Risikohinweis: Der Erwerb von Genossenschaftsanteilen ist mit Risiken verbunden und kann zum teilweisen oder vollständigen Verlust des eingesetzten Kapitals führen. Die angegebene Ziel-Dividende von bis zu 7 % p. a. ist keine Garantie; frühere oder geplante Ausschüttungen sind kein verlässlicher Indikator für künftige Ergebnisse. Maßgeblich sind ausschließlich die Satzung und die Beitrittsunterlagen der Hanseatische Invest eG.",
};
