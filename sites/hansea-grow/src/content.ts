// Content taken from https://www.hanseagrow.de/ (fetched Nov 2026). Copy is
// kept as published there; only the presentation follows the GIG design.

import heroImg from "./assets/hero.jpg";
import arbeitsortImg from "./assets/arbeitsort.jpg";
import familieImg from "./assets/familie.jpg";
import zukunftImg from "./assets/zukunft.jpg";

import logoGig from "./assets/brands/logo-0.png";
import logoHanseaInvest from "./assets/brands/logo-1.png";
import logoHwg from "./assets/brands/logo-2.png";
import logoHanseaGrow from "./assets/brands/logo-3.png";
import logoPsk from "./assets/brands/logo-4.png";
import logoClub from "./assets/brands/logo-5.png";
import logoSponsern from "./assets/brands/logo-6.png";
import logoMieten from "./assets/brands/logo-7.png";
import logoOptimieren from "./assets/brands/logo-8.png";
import logoRente from "./assets/brands/logo-9.png";

export { heroImg };

export const links = {
  beitritt:
    "https://powerforms.docusign.net/76eab2c5-8e72-4bb3-95d3-e7336488c94f?env=eu&acct=c6682570-a52d-4503-ab48-9453e2669601&accountId=c6682570-a52d-4503-ab48-9453e2669601",
  genossenschaft: "https://www.diefamiliengenossenschaft.de/",
  gig: "https://gerlachgroup.de/",
  blog: "https://blog.gerlachgroup.de/%C3%B6ffentlichkeit-pr-blog",
  buch: "https://www.remote-verlag.de/products/immobilien-investitionen-leicht-gemacht",
};

export const nav = [
  { label: "Vorteile", href: "/#vorteile" },
  { label: "Über uns", href: "/#ueber-uns" },
  { label: "FAQ", href: "/#faq" },
  { label: "Mitgliederportal", href: "/mitgliederportal/" },
  { label: "Blog & PR", href: links.blog, external: true },
  { label: "Kontakt", href: "/#kontakt" },
];

export const company = {
  name: "Hansea Grow",
  legalName: "Hanseatische Wohnungsgenossenschaft eG",
  tagline: "Ein Produkt der Gerlach Immobilien Gruppe",
  street: "Langenhorner Chaussee 155",
  city: "22415 Hamburg",
  phone: "+49 40 22862372-0",
  phoneHref: "tel:+4940228623720",
  email: "info@hanseagrow.de",
};

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/gig.hansea/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61586793939078" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/93640700" },
];

export const marquee = [
  "Ab 100 € monatlich",
  "Einmalzahlungen ab 500 €",
  "7 % p.a.*",
  "Genossenschaftlich",
  "Digitales Mitgliederportal",
  "Bezahlbarer Wohnraum",
];

export const stats = [
  { value: "100 €", label: "Einstieg pro Monat" },
  { value: "500 €", label: "Einmalzahlung ab" },
  { value: "7%", label: "p.a.* vorgesehene Zinsen" },
  { value: "6–12", label: "Monate Projektlaufzeit" },
];

export const story = [
  {
    eyebrow: "Freiheit",
    title: ["Dein Arbeitsort?", "Deine Entscheidung!"],
    text: "Wahre Freiheit beginnt, wenn dein Einkommen nicht mehr nur von deiner Zeit abhängt. Durch kluge Investments kann dein Geld für dich wachsen und Erträge erzielen, sodass nicht mehr du für dein Geld arbeitest, sondern dein Geld für dich. Das bedeutet mehr Flexibilität, mehr Unabhängigkeit und die Möglichkeit, deinen Alltag selbstbestimmt zu gestalten.",
    image: arbeitsortImg,
    alt: "Frau arbeitet mit dem Laptop an einem Strandcafé",
  },
  {
    eyebrow: "Familie",
    title: ["Mehr Zeit fürs", "Wesentliche."],
    text: "Finanzielle Freiheit ist mehr als nur ein Kontostand. Wer heute investiert, schafft sich langfristig mehr Zeit für Familie, persönliche Ziele und die Menschen, die am wichtigsten sind. Gleichzeitig baust du eine sichere Zukunft auf und investierst in die Chancen der nächsten Generation.",
    image: familieImg,
    alt: "Familie beim Picknick im Park",
  },
  {
    eyebrow: "Zukunft",
    title: ["Früh investiert.", "Zukunft gebaut."],
    text: "Wenn du heute in Immobilien investierst, lässt du dein Geld für dich arbeiten. So baust du Schritt für Schritt Vermögen auf und schaffst dir eine starke finanzielle Basis für deine Zukunft. Gleichzeitig profitierst du von langfristigem Wertzuwachs und stabilen Einnahmen, die dir mehr finanzielle Freiheit ermöglichen.",
    image: zukunftImg,
    alt: "Schlüsselübergabe in einem Büro",
  },
];

export type IconName =
  | "euro"
  | "repeat"
  | "doc"
  | "trend"
  | "screen"
  | "hands"
  | "home"
  | "shield"
  | "spark";

export const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "euro",
    title: "Einstieg ab 100 €/Monat",
    text: "Einfacher Start – jederzeit flexibel anpassen.",
  },
  {
    icon: "repeat",
    title: "Flexible Einmalzahlungen",
    text: "Einmalzahlung ab 500€ möglich, beliebig oft.",
  },
  {
    icon: "doc",
    title: "Genossenschaftliches Modell",
    text: "Realer Immobilienbezug, langfristig orientiert ohne Spekulation.",
  },
  {
    icon: "trend",
    title: "Vorgesehene Zinsen",
    text: "7% p. a. * gemäß Allgemeine Geschäftsordnung.",
  },
  {
    icon: "screen",
    title: "Digitale Transparenz",
    text: "Alles im Mitgliederportal: Anteile, Guthaben, Dokumente, Dividenden.",
  },
  {
    icon: "hands",
    title: "Impakt mit Substanz",
    text: "Vermögensaufbau + Unterstützung von bezahlbarem Wohnraum.",
  },
];

export const steps = [
  {
    step: "1",
    title: "Ab 100 € monatlich investieren",
    paragraphs: [
      "Du entscheidest selbst, mit welchem Betrag du dich jeden Monat beteiligst. Zusätzlich kannst du auch Einmalzahlungen ab 500€ jederzeit leisten, um dein Geschäftsguthaben weiter zu erhöhen und so noch mehr von deiner Beteiligung zu profitieren.",
    ],
  },
  {
    step: "2",
    title: "Mitglied der Genossenschaft werden",
    paragraphs: [
      "Sobald du dich eingetragen hast, bekommst du von uns das Beitragsformular zugesendet und kannst ganz einfach Mitglied werden.",
      "Nachdem du das Beitrittsformular ausgefüllt hast, bekommst du eine E-Mail zum Mitgliederportal sowie eine Beitrittsbenachrichtigung und eine Kopie des ausgefüllten Formulars.",
    ],
  },
  {
    step: "3",
    title: "An Immobilienprojekten teilhaben",
    paragraphs: [
      "Wir bieten dir als investierendes Mitglied eine angestrebte Verzinsung von 7% p.a.* auf deine Beteiligung, die jährlich ausgezahlt wird. Dazu erhältst du auch eine jährliche Steuerbescheinigung.",
    ],
  },
];

export const problems = [
  {
    title: "Intransparente Produkte",
    text: "Viele klassische Finanzprodukte sind komplex aufgebaut und enthalten Kosten oder Risiken, die für Anleger nur schwer nachvollziehbar sind.",
  },
  {
    title: "Geringe Flexibilität und lange Bindungsfristen",
    text: "Viele traditionelle Anlageformen binden Kapital langfristig und sind oft nur mit Abschlägen oder Zusatzkosten vorzeitig kündbar.",
  },
  {
    title: "Geringe Renditen bei gleichzeitig hoher Inflation",
    text: "Konservative Anlagen erzielen oft Zinsen unterhalb der Inflationsrate – die Kaufkraft des Vermögens sinkt.",
  },
];

export const values: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "home",
    title: "Niedrigschwelliger Einstieg",
    text: "Starte ab 100 € – digital und einfach. Stocke jederzeit und so viel du möchtest deine Beteiligung auf.",
  },
  {
    icon: "shield",
    title: "Vertrauen & Transparenz",
    text: "Genossenschaftlich, nachvollziehbar, geprüft.",
  },
  {
    icon: "spark",
    title: "Rendite + Verantwortung",
    text: "Vermögen aufbauen und Wohnraum erhalten.",
  },
];

export const brands: { name: string; logo: string; href?: string }[] = [
  { name: "Gerlach Immobilien Gruppe", logo: logoGig, href: "https://gerlachgroup.de/" },
  { name: "Hansea Invest eG", logo: logoHanseaInvest, href: "https://www.hanseainvest.de/" },
  {
    name: "Hanseatische Wohnungsgenossenschaft",
    logo: logoHwg,
    href: "https://www.diefamiliengenossenschaft.de/",
  },
  { name: "Hansea Grow", logo: logoHanseaGrow },
  { name: "projektsuchtkapital.de", logo: logoPsk, href: "https://projektsuchtkapital.de/" },
  { name: "Club der Kapitalanleger", logo: logoClub },
  { name: "wirsponserndeinteam.de", logo: logoSponsern, href: "https://wirsponserndeinteam.de/" },
  { name: "wirmietendeinhaus.de", logo: logoMieten },
  {
    name: "wiroptimierendeinhaus.de",
    logo: logoOptimieren,
    href: "https://www.wiroptimierendeinhaus.de/",
  },
  { name: "wirrettendeinerente.de", logo: logoRente },
];

export type FaqItem = { q: string; intro?: string; bullets?: string[]; outro?: string };

export const faq: FaqItem[] = [
  {
    q: "Was ist der „Hansea Grow“ Beteiligungsplan?",
    bullets: [
      "Mit Hansea Grow investierst du monatlich in Genossenschaftsanteile.",
      "Mit jeder Einzahlung wächst dein Geschäftsguthaben",
      "Perspektivisch kann dein Guthaben auch als Eigenkapital für Ankäufe von Immobilien eingesetzt werden.",
    ],
  },
  {
    q: "Wie hoch sind die monatlichen Einzahlungen?",
    intro: "Bereits ab 100 € pro Monat möglich.",
    bullets: [
      "1 Geschäftsanteil = 100 €",
      "Höhe wird bei Beitritt festgelegt",
      "Zahlung per SEPA-Lastschrift oder Überweisung",
    ],
  },
  {
    q: "Was geschieht mit meinem Geld?",
    intro: "Dein Kapital fließt in Immobilienprojekte der Gerlach Immobilien Gruppe:",
    bullets: [
      "Ankauf von Mehrfamilienhäusern",
      "Modernisierung & energetische Optimierung",
      "Verkauf an Kapitalanleger",
    ],
    outro:
      "Die Projekte laufen meist 6–12 Monate, dein Kapital ist parallel in mehrere Projekte investiert.",
  },
];

export const portalDownloads = [
  {
    title: "Antragsformular",
    text: "Mit diesem Dokument kannst du unseren Antrag ausfüllen und Mitglied werden. Es enthält alle wichtigen Unterlagen und Informationen rund um den Beitritt, darunter den Risikohinweis, die Allgemeinen Geschäftsbedingungen (AGO), die Satzung, den Beitrittsfragebogen sowie – optional – das SEPA-Lastschriftmandat und den Freistellungsauftrag.",
    href: links.beitritt,
    action: "Öffnen",
  },
  {
    title: "Antrag auf Ausstellung einer Nichtveranlagungs-Bescheinigung (NV-Bescheinigung)",
    text: "Mit diesem Dokument kannst du eine NV-Bescheinigung beim Finanzamt beantragen, um zu bestätigen, dass du keine Einkommensteuer zahlen musst und somit keine Kapitalertragsteuer abgeführt wird.",
    href: "/downloads/nv-bescheinigung-antrag.pdf",
    action: "Download",
  },
  {
    title: "Auftrag zur Einmalzahlung",
    text: "Dieses Dokument ermöglicht es dir, eine einmalige Zahlung an Hansea Grow zu veranlassen und die entsprechenden Zahlungsdetails verbindlich festzulegen.",
    href: "/downloads/auftrag-einmalzahlung.pdf",
    action: "Download",
  },
  {
    title: "Kündigung der Mitgliedschaft",
    text: "Mit diesem Formular kannst du deine Mitgliedschaft offiziell kündigen und den Austrittsprozess einleiten.",
    href: "/downloads/kuendigung-mitgliedschaft.pdf",
    action: "Download",
  },
  {
    title: "FAQ's",
    text: "Hier findest du alle relevanten Informationen und Unterlagen rund um den Beitritt. Sollte noch etwas unklar sein, stehen wir dir jederzeit zur weiteren Orientierung zur Verfügung.",
    href: "/downloads/hansea-grow-faq.pdf",
    action: "Download",
  },
];
