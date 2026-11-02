// Copy for the Hanseatische Invest eG Taboola landing page
// (ratgeber.hanseainvest.de/infopaket/).
//
// Product terms follow hanseainvest.de (Satzung and Allgemeine Geschäftsordnung
// as summarised there, Nov 2026): investing membership under § 8 Abs. 2 GenG,
// shares of 10.000 €, 7 % interest p.a. planned (§ 10 AGO, not guaranteed),
// paid quarterly, 12-month term renewing yearly, notice 9 months before the end.

export const offer = {
  issuer: "Hanseatische Invest eG",
  plannedInterest: 7, // % p.a., planned per § 10 AGO, not guaranteed
  shareAmount: 10_000, // € per share; several shares possible
  termMonths: 12, // renews by one year unless cancelled 9 months before the end
  noticeMonths: 9,
};

export const contact = {
  phone: "+49 40 22862372-0",
  phoneHref: "tel:+4940228623720",
  email: "mitgliederservice@hanseainvest.de",
  address: "Langenhorner Chaussee 155, 22415 Hamburg",
};

export const facts = [
  { value: `${offer.plannedInterest} % p. a.*`, label: "Vorgesehene Verzinsung" },
  { value: "10.000 €", label: "Je Anteil" },
  { value: "Alle 3 Monate", label: "Auszahlung" },
  { value: "12 Monate", label: "Laufzeit" },
];

export const steps = [
  {
    title: "Mitglied werden",
    description:
      "Sie übernehmen einen oder mehrere Anteile zu je 10.000 € und werden investierendes Mitglied der Hanseatischen Invest eG.",
  },
  {
    title: "Kapital arbeitet in echten Häusern",
    description:
      "Gemeinsam mit der Gerlach Immobilien Gruppe werden Mehrfamilienhäuser gekauft, modernisiert, vermietet und die Wohnungen einzeln verkauft.",
  },
  {
    title: "Zinsen erhalten",
    description:
      "Vorgesehen sind 7 % Zinsen pro Jahr, ausgezahlt alle drei Monate, erstmals nach dem ersten vollen Quartal. Die Verzinsung ist nicht garantiert.",
  },
];

export const reasons = [
  {
    title: "Sachwert statt Finanzprodukt",
    description:
      "Die Wertschöpfung entsteht durch operative Arbeit an echten Wohnhäusern: kaufen, modernisieren, vermieten, einzeln verkaufen.",
  },
  {
    title: "Gefragte Lagen, breit gestreut",
    description:
      "Investiert wird in deutschen A-Städten und Wachstumsregionen. Das Kapital verteilt sich auf mehrere Projekte an verschiedenen Standorten.",
  },
  {
    title: "Geprüft und ohne Nachschuss",
    description:
      "Eine eingetragene Genossenschaft wird von einem unabhängigen Prüfungsverband geprüft. Eine Nachschusspflicht besteht nicht.",
  },
];

// "Wer dahintersteht": facts as stated on hanseainvest.de (Nov 2026).
export const ceo = {
  name: "Stephan Gerlach",
  role: "Vorstand der Hanseatischen Invest eG",
  heading: "Stephan Gerlach: der Kopf hinter der Hanseatischen Invest eG",
  paragraphs: [
    "Stephan Gerlach ist Vorstand der Hanseatischen Invest eG und Gründer der Gerlach Immobilien Gruppe aus Hamburg. Er gilt als Experte für Kapitalanlage-Immobilien.",
    "Mit der Gerlach Immobilien Gruppe kauft er Mehrfamilienhäuser, modernisiert sie und verkauft die Wohnungen einzeln. Über die Hanseatische Invest eG können sich Anleger an dieser Strategie beteiligen.",
  ],
  linkedin: "https://www.linkedin.com/in/stephan-gerlach-3798ba245/",
  book: {
    badge: "Spiegel-Bestseller",
    title: "Immobilien Investitionen leicht gemacht",
    subtitle: "Passives Einkommen und Dein Weg zur finanziellen Unabhängigkeit",
    text: "Der Spiegel-Bestseller von Stephan Gerlach: Ihr Leitfaden für Immobilien als Kapitalanlage.",
    publisher: "Remote Verlag",
    url: "https://www.remote-verlag.de/products/immobilien-investitionen-leicht-gemacht",
  },
};

export const opportunities = [
  `Vorgesehene Verzinsung von ${offer.plannedInterest} % p. a.`,
  "Auszahlung alle drei Monate",
  "Beteiligung an echten Wohnimmobilien, ohne Kredit und ohne Vermieten",
  "Keine Nachschusspflicht, die Steuer wird direkt abgeführt",
];

export const risks = [
  "Die vorgesehenen Zinsen sind nicht garantiert. Sie können niedriger ausfallen oder entfallen.",
  "Bei Kündigung wird Ihr Guthaben aus der Bilanz ermittelt (§ 73 Abs. 2 GenG) und kann unter Ihrer Einzahlung liegen.",
  "Der Geschäftsanteil ist keine Bankeinlage, nicht durch ein gesetzliches Entschädigungssystem geschützt und nicht täglich verfügbar.",
  "Es besteht ein Totalverlustrisiko des eingesetzten Kapitals.",
];

export const faq = [
  {
    q: "Woran beteilige ich mich genau?",
    a: "An der Genossenschaft selbst. Sie übernehmen einen oder mehrere Anteile zu je 10.000 € und werden damit Mitglied der Hanseatischen Invest eG. Eine eigene Wohnung gehört Ihnen nicht; um Mieter und Reparaturen kümmert sich die Genossenschaft.",
  },
  {
    q: "Was bedeutet „investierendes Mitglied“?",
    a: "Sie stellen Geld zur Verfügung und erhalten dafür Zinsen. Sie arbeiten nicht im Betrieb mit und haben kein Stimmrecht in der Mitgliederversammlung.",
  },
  {
    q: "Wie hoch sind die Zinsen und wann werden sie gezahlt?",
    a: "Vorgesehen sind 7 % pro Jahr laut § 10 der Allgemeinen Geschäftsordnung, ausgezahlt alle drei Monate, erstmals nach dem ersten vollen Quartal Ihrer Mitgliedschaft. Die Verzinsung ist nicht garantiert.",
  },
  {
    q: "Wie lange bin ich gebunden?",
    a: "Zunächst zwölf Monate. Kündigen Sie nicht spätestens neun Monate vor Ablauf, läuft Ihr Anteil ein weiteres Jahr.",
  },
  {
    q: "Was passiert, wenn ich kündige?",
    a: "Nach Ablauf der Laufzeit bekommen Sie Ihren Anteil ausgezahlt. Der Betrag ergibt sich aus dem Jahresabschluss und kann unter Ihrer Einzahlung liegen.",
  },
  {
    q: "Kann ich später zur Kasse gebeten werden?",
    a: "Nein. Mehr als Ihren Anteil zahlen Sie nie ein. Eine Nachschusspflicht besteht nicht; das ist in der Satzung festgeschrieben.",
  },
  {
    q: "Muss ich die Zinsen versteuern?",
    a: "Ja, so wie Zinsen auf einem Konto. Die Genossenschaft führt die Steuer direkt ab; ein Freistellungsauftrag ist möglich.",
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
  region: "na1",
  portalId: "19607021",
  formId: "de2aa5dd-fe20-4c1f-a445-b9ec3efa4c89",
  embed: "frame" as "frame" | "legacy",
};

export const legal = {
  imprint: "https://hanseainvest.de/impressum/",
  privacy: "https://hanseainvest.de/datenschutz/",
  riskNotice:
    "Risikohinweis: Genossenschaftsanteile sind eine unternehmerische Beteiligung und nicht garantiert. Es besteht Totalverlustrisiko des eingesetzten Kapitals. Keine Nachschusspflicht. Die vorgesehenen Zinsen können niedriger ausfallen oder entfallen. Bei Kündigung wird Ihr Guthaben nach § 73 Absatz 2 GenG aus der Bilanz ermittelt und kann unter Ihrer Einzahlung liegen. Der Geschäftsanteil ist keine Bankeinlage, nicht durch ein gesetzliches Entschädigungssystem geschützt und nicht täglich verfügbar.",
  notes:
    "Angeboten wird die investierende Mitgliedschaft nach § 8 Absatz 2 GenG, nicht die Beteiligung an einem einzelnen Objekt. Diese Seite dient der Information und ersetzt keine Anlage-, Rechts- oder Steuerberatung. Maßgeblich sind Satzung, Allgemeine Geschäftsordnung und Beitrittsunterlagen. Geschäftsanteile an eingetragenen Genossenschaften sind nach § 2 Absatz 1 Nummer 1 VermAnlG von der Prospektpflicht ausgenommen, ein Verkaufsprospekt liegt nicht vor. * Vorgesehene Verzinsung laut Geschäftsordnung, keine Zusage.",
};
