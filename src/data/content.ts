// Content sourced from https://gerlachgroup.de/ and its linked subsidiary sites
// (fetched Aug 2026). Figures are the ones publicly stated by the group; nothing
// below is invented.

import stephanGerlach from "../assets/team/stephan-gerlach.jpg";
import sophiaDobuch from "../assets/team/sophia-dobuch.jpg";
import rainerBartlau from "../assets/team/rainer-bartlau.jpg";
import kaiRaila from "../assets/team/kai-raila.jpg";
import clemensLoescher from "../assets/team/clemens-loescher.jpg";
import falkOstermann from "../assets/team/falk-ostermann.jpg";

export const nav = [
  { label: "Gruppe", href: "#gruppe" },
  { label: "Marken", href: "#marken" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Wissen", href: "#wissen" },
  { label: "Kontakt", href: "#kontakt" },
];

export const stats = [
  { value: "9", label: "Gesellschaften unter einem Dach" },
  { value: "7%", label: "Rendite p.a. bei Hanseatische Invest eG" },
  { value: "10 J.", label: "Mietgarantie auf vermittelte Wohnungen" },
  { value: "HH · K", label: "Standorte Hamburg und Köln" },
];

export type Brand = {
  category: string;
  name: string;
  description: string;
  href: string;
  accent: "gold" | "koralle" | "flat";
};

export const brands: Brand[] = [
  {
    category: "Wohneigentum",
    name: "Hanseatische Wohnungsgenossenschaft eG",
    description:
      "Kapitalanlage-Wohnungen kaufen — wir übernehmen Vermietung und Verwaltung, inklusive 10 Jahren Mietgarantie.",
    href: "https://hansea.immo",
    accent: "gold",
  },
  {
    category: "Genossenschaft",
    name: "Hanseatische Invest eG",
    description:
      "Genossenschaftlich investieren ab 10.000 € — 7 % Rendite p.a. mit quartalsweiser Ausschüttung nach einem Jahr Mindestlaufzeit.",
    href: "https://www.hanseainvest.de/",
    accent: "gold",
  },
  {
    category: "Familien-Vorsorge",
    name: "Die Familiengenossenschaft",
    description:
      "Vermögen aufbauen, ohne Privileg zu sein: den Fremdkapitalhebel nutzen und die Altersvorsorge von Mietern abzahlen lassen.",
    href: "https://www.diefamiliengenossenschaft.de/",
    accent: "koralle",
  },
  {
    category: "Investoren-Netzwerk",
    name: "Club der Kapitalanleger",
    description:
      "Exklusiver Zugang zu geprüften Immobilien, einem Expertennetzwerk und Investoren-Events.",
    href: "https://clubderkapitalanleger.de/",
    accent: "flat",
  },
  {
    category: "Miete & Verwaltung",
    name: "wirmietendeinhaus.de",
    description:
      "Wir mieten Ihr Haus, sanieren und vermieten möbliert weiter — als Serviced Apartment oder Gewerbefläche.",
    href: "https://wirmietendeinhaus.de/",
    accent: "flat",
  },
  {
    category: "Projektentwicklung",
    name: "wiroptimierendeinhaus.de",
    description:
      "Projektentwicklung mit der Erfahrung aus mehreren hundert Transaktionen — Wertsteigerung für Ihre Immobilie.",
    href: "https://wiroptimierendeinhaus.de/",
    accent: "flat",
  },
  {
    category: "Unternehmensnachfolge",
    name: "wirkaufendeinenhandwerksbetrieb.de",
    description:
      "Wir übernehmen Handwerksbetriebe und sichern Nachfolge, Fortführung und Arbeitsplätze.",
    href: "https://wirkaufendeinenhandwerksbetrieb.de/",
    accent: "flat",
  },
  {
    category: "Digitaler Einstieg",
    name: "deintausender.de",
    description:
      "Der niedrigschwellige, digitale Einstieg in Immobilien — einfach und transparent erklärt.",
    href: "https://deintausender.de/",
    accent: "flat",
  },
  {
    category: "Sportsponsoring",
    name: "wirsponserndeinteam.de",
    description:
      "Sponsoring für Sportmannschaften und Athleten in Norddeutschland — mehr als ein Dutzend Teams.",
    href: "https://wirsponserndeinteam.de/",
    accent: "flat",
  },
];

export const valueProps = [
  {
    title: "Geprüfte Objekte",
    description:
      "Jede Immobilie durchläuft dieselbe Prüfung, unabhängig davon, welche Gesellschaft der Gruppe sie vermittelt.",
    accent: "gold" as const,
  },
  {
    title: "Ein Ansprechpartner",
    description:
      "Von der Beratung über die Finanzierung bis zur Verwaltung bleibt Ihr Team innerhalb der Gruppe dasselbe.",
    accent: "koralle" as const,
  },
  {
    title: "Transparente Verträge",
    description:
      "Klare Konditionen und offen kommunizierte Renditen — ohne versteckte Gebühren.",
    accent: "gold" as const,
  },
];

export const process = [
  {
    step: "1",
    title: "Erstgespräch",
    description:
      "Wir klären Ihre Ziele, Ihr Budget und welche Gesellschaft der Gruppe zu Ihnen passt.",
  },
  {
    step: "2",
    title: "Konzept & Auswahl",
    description:
      "Eigene Wohnung, genossenschaftliche Beteiligung oder digitaler Einstieg — auf Sie zugeschnitten.",
  },
  {
    step: "3",
    title: "Umsetzung & Betreuung",
    description:
      "Die zuständige Gesellschaft übernimmt Finanzierung, Abwicklung und die laufende Betreuung danach.",
  },
];

export const testimonials = [
  {
    name: "Sebastian W.",
    meta: "38, München",
    quote:
      "Ich hatte schon lange den Wunsch, in Immobilien zu investieren, zögerte jedoch wegen des erwarteten Aufwands — nach dem ersten Kauf war ich überzeugt.",
  },
  {
    name: "Manfred K.",
    meta: "45, Hamburg",
    quote:
      "Meine Frau war zunächst skeptisch. Heute besitzen wir drei Wohnungen und sichern damit unseren Ruhestand ab.",
  },
  {
    name: "Sophia D.",
    meta: "36, Bremen",
    quote:
      "Von der Finanzierung bis zur Schlüsselübergabe vergingen nur 9 Wochen — ich war die Erste in meinem Freundeskreis mit eigener Immobilie.",
  },
];

export const faq = [
  {
    q: "Was unterscheidet die einzelnen Gesellschaften der Gruppe?",
    a: "Jede Gesellschaft bedient einen eigenen Einstiegspunkt in den Vermögensaufbau mit Immobilien — vom Kauf einer eigenen Kapitalanlage-Wohnung über die genossenschaftliche Beteiligung bis zum digitalen Einstieg. Prüfstandard, Ansprechpartner und Qualitätsversprechen sind gruppenweit identisch.",
  },
  {
    q: "Wie finde ich den richtigen Einstieg für mich?",
    a: "Im kostenlosen Erstgespräch klären wir Ihre Ziele, Ihr verfügbares Budget und Ihre Risikobereitschaft und empfehlen Ihnen die passende Gesellschaft der Gruppe.",
  },
  {
    q: "Ist das Erstgespräch wirklich kostenlos?",
    a: "Ja. Das Erstgespräch ist unverbindlich und kostenfrei — Sie entscheiden danach, ob und mit welcher Gesellschaft Sie weitermachen möchten.",
  },
  {
    q: "Was beinhaltet die Mietgarantie?",
    a: "Auf vermittelte Wohnungen gilt eine Mietgarantie von 10 Jahren: Sie erhalten Mieteinnahmen auch bei Leerstand oder Mietausfall, gesichert über die Partnergesellschaft wirmietendeinhaus.de.",
  },
  {
    q: "Ab welchem Betrag kann ich mich beteiligen?",
    a: "Eine genossenschaftliche Beteiligung bei Hanseatische Invest eG ist bereits ab 10.000 € möglich, mit 7 % Rendite p.a. und quartalsweiser Ausschüttung nach einem Jahr Mindestlaufzeit.",
  },
];

export const aboutIntro = {
  eyebrow: "Über uns",
  heading: "Wir haben unsere Geschäftsbereiche in den letzten Jahren strategisch erweitert",
  paragraph:
    "Die GIG spezialisiert sich auf den Erwerb und die Entwicklung von Mehrfamilienhäusern in Norddeutschland und verfolgt die Vision, sanierungsbedürftige Häuser nachhaltig zu gestalten. Durch unser umfangreiches Netzwerk erkennen wir schnell Potenziale und setzen Projekte effizient um, um moderne Wohnträume zu schaffen. Mit Beteiligungen und der Einbindung ausgewählter externer Investoren decken wir zusammen mit unseren Tochterunternehmen die gesamte Wertschöpfungskette von Bestandsimmobilien bis hin zu Kapitalanlagen ab. So tragen wir aktiv zur Klimawende bei und erweitern unser Portfolio um nachhaltig gestaltete Objekte.",
};

export const serviceModel = [
  {
    step: "1",
    title: "Ankauf & Bestand",
    description:
      "Wir identifizieren Mehrfamilienhäuser mit Potenzial in den Wachstumsregionen Norddeutschlands.",
  },
  {
    step: "2",
    title: "Sanierung & Entwicklung",
    description:
      "Sanierungsbedürftige Objekte werden nachhaltig modernisiert und in zeitgemäßen Wohnraum verwandelt.",
  },
  {
    step: "3",
    title: "Vermietung & Verwaltung",
    description:
      "Tochterunternehmen wie wirmietendeinhaus.de übernehmen Vermietung, Betreuung und laufende Verwaltung.",
  },
  {
    step: "4",
    title: "Kapitalanlage & Beteiligung",
    description:
      "Über Hanseatische Invest eG und ausgewählte externe Investoren öffnen wir das Portfolio für Kapitalanleger.",
  },
];

export const teamIntro = {
  eyebrow: "Unser Team",
  heading: "Passionierte Experten treiben Innovation und Nachhaltigkeit voran",
};

export const team = [
  {
    name: "Stephan Gerlach",
    role: "CEO",
    photo: stephanGerlach,
    linkedin: "https://www.linkedin.com/in/stephan-gerlach-3798ba245/",
  },
  {
    name: "Sophia Dobuch",
    role: "COO",
    photo: sophiaDobuch,
    linkedin: "https://www.linkedin.com/in/sophia-dobuch-93a272306/",
  },
  {
    name: "Rainer Bartlau",
    role: "Chief Rental Officer",
    photo: rainerBartlau,
    linkedin: "https://www.linkedin.com/in/rainer-bartlau-5794b926a/",
  },
  {
    name: "Kai Raila",
    role: "CCO",
    photo: kaiRaila,
    linkedin: "https://www.linkedin.com/in/kai-raila-95a66a1a9/",
  },
  {
    name: "Clemens Löscher",
    role: "CFO",
    photo: clemensLoescher,
    linkedin: "https://www.linkedin.com/in/clemens-loescher-hamburg/",
  },
  {
    name: "Falk Ostermann",
    role: "Director Relationship Management",
    photo: falkOstermann,
    linkedin: "https://www.linkedin.com/in/falk-ostermann-b8943855/",
  },
];

export const company = {
  legalName: "Gerlach Verwaltungs- und Beteiligungsges.mbH",
  address: "Langenhorner Chaussee 155, 22415 Hamburg",
  phone: "+49 40 22862372-0",
  email: "info@gerlachgroup.de",
  linkedin: "https://www.linkedin.com/",
};

export const footerLegal = [
  { label: "Impressum", href: "https://gerlachgroup.de/impressum/" },
  {
    label: "Datenschutzerklärung",
    href: "https://gerlachgroup.de/datenschutzerklarung/",
  },
  {
    label: "Cookie-Richtlinie EU",
    href: "https://gerlachgroup.de/cookie-richtlinie-eu/",
  },
];
