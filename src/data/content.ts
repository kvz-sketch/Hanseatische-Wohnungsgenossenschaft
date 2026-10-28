import lkAussen from '../assets/expose/langer-kamp-aussen.jpg'
import lkInnen1 from '../assets/expose/langer-kamp-innen-1.jpg'
import lkInnen2 from '../assets/expose/langer-kamp-innen-2.jpg'
import lkInnen3 from '../assets/expose/langer-kamp-innen-3.jpg'
import lkInnen4 from '../assets/expose/langer-kamp-innen-4.jpg'
import obAussen from '../assets/expose/oberbilker-aussen.jpg'
import obInnen1 from '../assets/expose/oberbilker-innen-1.jpg'
import obInnen2 from '../assets/expose/oberbilker-innen-2.jpg'
import obInnen3 from '../assets/expose/oberbilker-innen-3.jpg'
import obInnen4 from '../assets/expose/oberbilker-innen-4.jpg'
import letternkamp from '../assets/expose/letternkamp.jpg'
import brookdeich from '../assets/expose/brookdeich.jpg'
import luelsdorfer from '../assets/expose/luelsdorfer-strasse.jpg'

// All copy and figures for the Hanseatische Invest eG site.
// Source: the reference design at hansea.neo-labs.ai (Stand April 2026).

export const company = {
  name: 'Hanseatische Invest eG',
  street: 'Langenhorner Chaussee 155',
  city: '22415 Hamburg',
  email: 'mitgliederservice@hanseainvest.de',
  register: 'Amtsgericht Hamburg, GnR 1175',
  auditor: 'DIVK Prüfungsverband',
}

export const BOOKING_URL = 'https://calendly.com/dpp-gerlachgroup/30min-erstgesprach-gig'
/** Cornelia Richter, Mitgliederservice: 30-minute appointment. */
export const MEMBER_SERVICE_BOOKING_URL = 'https://calendly.com/mitgliederservice-hanseainvest/30min'

export const callSlots = ['Schnellstmöglich', '9–12 Uhr', '12–15 Uhr', '15–18 Uhr']

// Sample portfolio: the member's Anteile and the projects the Genossenschaft currently invests in.
// Anteile are not assigned to single houses; the member's money works across all projects.
export const memberUnits = 4

export type PortfolioProject = {
  city: string
  name: string
  image?: string // photo on the left of the card; a placeholder is shown until it is set
  progress: number // % of the project completed, from purchase to the last sale
  phase: 'Ankauf' | 'Modernisierung' | 'Vermietung' | 'Verkauf' | 'Abgeschlossen'
  status: string
  updated: string
}

export const portfolioProjects: PortfolioProject[] = [
  { city: 'Hamburg-Bergedorf', name: 'Brookdeich', image: brookdeich, progress: 20, phase: 'Ankauf', status: 'Kaufvertrag beurkundet, Übergabe im Oktober', updated: '30.09.2026' },
  { city: 'Hamburg-Eilbek', name: 'Letternkamp', image: letternkamp, progress: 55, phase: 'Modernisierung', status: 'Dach geschlossen, Bäder in Arbeit', updated: '18.09.2026' },
  { city: 'Köln', name: 'Lülsdorfer Straße', image: luelsdorfer, progress: 85, phase: 'Verkauf', status: 'Wohnungen im Verkauf, erste Verkäufe beurkundet', updated: '26.09.2026' },
]

// One share (Geschäftsanteil) is 10.000 €: 7 % p.a. paid quarterly gives the 175 € per share above.
export const SHARE_PRICE = 10000

/** "1 Anteil", "3 Anteile" */
export const anteile = (n: number) => `${n} ${n === 1 ? 'Anteil' : 'Anteile'}`

export const nextPayout = { date: '31.12.2026', perShare: '175 € je Anteil (vorgesehen)' }

export const trackRecord = {
  completed: 15,
  investedMio: 40.4,
  revenueMio: 52.3,
  facts: [
    { strong: '13 von 15', rest: ' Häusern vollständig verkauft, die übrigen zwei im Verkauf' },
    {
      strong: '13.269 m²',
      rest: ' Wohnfläche in Hamburg, Kiel, Eckernförde, Pinneberg, Oldenburg, Cuxhaven, Lauenburg und Tönning',
    },
    {
      strong: '10 Standorte in 4 Bundesländern',
      rest: ' seit April 2025, die nächsten Häuser in Lübeck, Hamburg, Köln und Bonn',
    },
    {
      strong: '300 neue Käufer und Investoren',
      rest: ' seit April 2025; die Objekte sind zu 30 % mit Kapital der Mitglieder finanziert',
    },
  ],
}

export const steps = [
  { title: 'Sie zeichnen Anteile', text: 'Ab 10.000 €. Digital unterschreiben, überweisen, fertig.' },
  {
    title: 'Ihr Geld arbeitet in echten Häusern',
    text: 'Wir kaufen Bestandsgebäude unter Marktniveau, sanieren, teilen auf und verkaufen.',
  },
  {
    title: 'Ausschüttung jedes Quartal',
    text: 'Ziel: 7 % im Jahr, in vier Raten, abhängig vom Erfolg der Genossenschaft.',
  },
  {
    title: 'Nach 12 Monaten entscheiden Sie',
    text: 'Weiterlaufen lassen, aufstocken oder mit neun Monaten Frist kündigen. Keine Nachschusspflicht.',
  },
]

export type Faq = { q: string; lead: string; body: string; link?: { label: string; href: string } }

export const faqs: Faq[] = [
  {
    q: 'Was ist die Idee dahinter?',
    lead: 'Am Umbau alter Häuser mitverdienen – ohne selbst eins zu kaufen.',
    body: 'Bestandshäuser günstig kaufen, sanieren, in einzelne Wohnungen aufteilen und verkaufen: Dieses Geschäft war bisher Profis mit viel Kapital vorbehalten. Die Genossenschaft bündelt das Geld vieler Mitglieder – so sind Sie schon ab 10.000 € dabei.',
  },
  {
    q: 'Wie wird aus einem alten Haus Gewinn?',
    lead: 'Durch Arbeit am Haus, nicht durch Warten auf steigende Preise.',
    body: 'Ein Beispiel aus Hamburg, Borgfelder Straße: 20 Wohnungen für 4,75 Mio. € gekauft und saniert, in unter sechs Monaten für 6,55 Mio. € verkauft. 1 Mio. € davon kam von Mitgliedern der Genossenschaft, die dafür 7 % im Jahr als Ziel erhielten. Aus solchen Ergebnissen speisen sich die Ausschüttungen.',
  },
  {
    q: 'Warum kaufen Sie günstiger als andere?',
    lead: 'Weil wir kaufen, wo andere nicht wollen.',
    body: 'Erbengemeinschaften, Sanierungsstau, Eigentümer ohne Zeit. Wir entscheiden schnell und sanieren mit eigenen Bauleitern.',
  },
  {
    q: 'Warum eine Genossenschaft und kein Fonds?',
    lead: 'Weil Sie Mitglied werden, nicht Kunde.',
    body: 'Ihr Geld bleibt im Unternehmen und fließt direkt in eigene Projekte. Die Wertschöpfung entsteht durch Arbeit an Häusern, nicht durch Finanzprodukte. Genossenschaften unterliegen dem Genossenschaftsgesetz und der Pflichtprüfung durch einen Prüfungsverband – ein Modell, das es in Deutschland seit über 150 Jahren gibt.',
  },
  {
    q: 'Wo ist mein Geld dann genau?',
    lead: 'In einem konkreten Haus – mit Adresse und Fotos.',
    body: 'Jeder Anteil wird einem Projekt zugeordnet. Im Portal sehen Sie Phase, Baufortschritt und jede Ausschüttung.',
    link: { label: 'Projektstand ansehen', href: '#verfolgen' },
  },
  {
    q: 'Was bringt mir das bei 25.000 €?',
    lead: 'Als Ziel 437,50 € pro Quartal, brutto.',
    body: 'Kein Zinseszins, vor Kapitalertragsteuer, nicht garantiert. Ihren eigenen Betrag rechnen Sie im Rechner.',
    link: { label: 'Zum Rechner', href: '#rechner' },
  },
  {
    q: 'Anteile zeichnen oder selbst eine Wohnung kaufen?',
    lead: 'Beides kann sich rechnen; der Unterschied ist Aufwand und Kredit.',
    body: '200.000 € in Anteilen wachsen bei 7 % im Jahr und Wiederanlage in zehn Jahren auf rund 393.000 €, ohne Kredit, ohne Mieter und ohne Bonitätsprüfung; die Erträge versteuern Sie als Kapitalerträge. Wer lieber eine eigene Wohnung besitzt, bekommt sie über unsere Schwestergenossenschaft mit Mietgarantie: diefamiliengenossenschaft.de.',
  },
  {
    q: 'Was habe ich als Mitglied, außer der Ausschüttung?',
    lead: 'Eine Gemeinschaft, die sich kennt.',
    body: 'Einmal im Jahr laden wir alle Mitglieder ein: Vorstand und Projektleiter berichten, Sie sehen die Häuser und lernen andere Mitglieder kennen. Dazu kommt das Mitgliederportal mit jedem Projekt, jeder Ausschüttung und einem Rückruf-Button.',
  },
  {
    q: 'Wer steckt dahinter?',
    lead: 'Stephan Gerlach und die Gerlach Immobilien Gruppe.',
    body: 'Die Gruppe deckt vom Ankauf über die Sanierung bis zum Verkauf alles mit eigenen Unternehmen ab – das spart Zeit und Kosten. Die Genossenschaft gibt es seit 2018, heute hat sie über 300 Mitglieder.',
  },
  {
    q: 'Und wie sicher ist das?',
    lead: 'Reale Häuser, geprüfte Genossenschaft – und trotzdem eine unternehmerische Beteiligung.',
    body: 'Ihre Investition fließt in reale Wohnimmobilien in Deutschland. Die Hanseatische Invest eG ist eine eingetragene Genossenschaft und wird durch den DIVK Prüfungsverband regelmäßig geprüft. Bitte beachten Sie jedoch, dass es sich um eine unternehmerische Beteiligung handelt und keine gesetzliche Einlagensicherung besteht.',
    link: { label: 'Risikohinweis lesen', href: '#' },
  },
]

// ---- Projekte -------------------------------------------------------------

export type ProjectStatus = 'Im Verkauf' | 'Verkauft' | 'Im Ankauf'

export type Project = {
  street?: string
  city: string
  note: string
  date?: string
  status: ProjectStatus
  // Position on the Germany map (viewBox 0 0 600 760); the map shows
  // completed projects and the pipeline only
  pin?: [number, number]
  // Details from the Exposé, shown when the row is opened (projects for sale)
  expose?: { sold: number; summary: string; images: { src: string; alt: string }[]; facts: [string, string][] }
}

export const projectsForSale: Project[] = [
  {
    street: 'Langer Kamp 49',
    city: 'Norderstedt',
    note: 'Mehrfamilienhaus von 1997, Wohnungen von 56 bis 115 m²',
    status: 'Im Verkauf',
    expose: {
      sold: 75,
      summary: 'Gepflegtes Mehrfamilienhaus direkt im Hamburger Umland, mit 18 Garagen und möbliertem Vermietungskonzept.',
      images: [
        { src: lkAussen, alt: 'Langer Kamp 49, Norderstedt: Außenansicht' },
        { src: lkInnen1, alt: 'Langer Kamp: Essbereich' },
        { src: lkInnen2, alt: 'Langer Kamp: Küche' },
        { src: lkInnen3, alt: 'Langer Kamp: Schlafzimmer' },
        { src: lkInnen4, alt: 'Langer Kamp: Bad' },
      ],
      facts: [
        ['Adresse', 'Langer Kamp 49, 49a, 49b, 22850 Norderstedt'],
        ['Gesamtinvestition', 'ab 300.000 €'],
        ['Baujahr', '1997'],
        ['Wohnfläche gesamt', 'ca. 1.722 m²'],
        ['Wohnungsgrößen', '56,2 bis 115 m²'],
        ['Zimmer', '3 bis 4,5'],
        ['Energieklasse', 'C'],
        ['Heizung', 'Gas, Baujahr 2010'],
        ['Mietgarantie', '17,00 € pro m²'],
        ['Garagen und Stellplätze', '18 Garagen, 4 Stellplätze'],
        ['Abschreibung', '2 %'],
      ],
    },
  },
  {
    street: 'Oberbilker Allee 113',
    city: 'Düsseldorf',
    note: 'Gründerzeithaus von 1908, 9 Wohnungen von 41 bis 151 m²',
    status: 'Im Verkauf',
    expose: {
      sold: 68,
      summary: 'Mehrfamilienhaus aus der Gründerzeit in Düsseldorf-Oberbilk, laufend modernisiert, mit möbliertem Vermietungskonzept.',
      images: [
        { src: obAussen, alt: 'Oberbilker Allee 113, Düsseldorf: Außenansicht' },
        { src: obInnen1, alt: 'Oberbilker Allee: Wohnzimmer' },
        { src: obInnen2, alt: 'Oberbilker Allee: Wohn- und Essbereich' },
        { src: obInnen3, alt: 'Oberbilker Allee: Balkon' },
        { src: obInnen4, alt: 'Oberbilker Allee: Küche' },
      ],
      facts: [
        ['Adresse', 'Oberbilker Allee 113, 40227 Düsseldorf'],
        ['Gesamtinvestition', 'ab 171.300 €'],
        ['Baujahr', '1908'],
        ['Wohneinheiten', '9'],
        ['Wohnfläche gesamt', '770 m²'],
        ['Wohnungsgrößen', '40,77 bis 150,71 m²'],
        ['Zimmer', '3 bis 4'],
        ['Energieklasse', 'D'],
        ['Heizung', 'Erdgas, Baujahr 2006'],
        ['Zielmiete', '17,00 € pro m²'],
        ['Abschreibung', '8,33 %'],
      ],
    },
  },
]

export const projectsCompleted: Project[] = [
  { street: 'Im Bans 20A–B', city: 'Pinneberg', note: 'Mehrfamilienhaus, 18 Wohnungen', date: 'vsl. Mai 26', status: 'Im Verkauf', pin: [258.7, 144] },
  { street: 'Diestelkamp 23–33', city: 'Eckernförde', note: '6 Hauseingänge, 36 Wohnungen', date: 'vsl. Apr 26', status: 'Im Verkauf', pin: [261.1, 68.1] },
  { street: 'Borgfelder Straße 52', city: 'Hamburg', note: '20 Wohnungen, Baujahr 1955, saniert, aufgeteilt und vermietet', date: 'Apr 26', status: 'Verkauft', pin: [269.9, 154.3] },
  { street: 'Diestelkamp 43–45', city: 'Eckernförde', note: 'Mehrfamilienhaus, 16 Wohnungen, Verkauf als Kapitalanlage', date: 'Apr 26', status: 'Verkauft', pin: [247.1, 58.1] },
  { street: 'Eppendorfer Weg 155', city: 'Hamburg', note: '7 von 10 Einheiten erworben, Baujahr 1958', date: 'Apr 26', status: 'Verkauft', pin: [255.9, 144.3] },
  { street: 'Tiefe Allee 23', city: 'Kiel', note: 'Mehrfamilienhaus, 9 Einheiten, Baujahr 1900', date: 'Mär 26', status: 'Verkauft', pin: [278.7, 82.2] },
  { street: 'Rendsburger Landstraße 47', city: 'Kiel', note: 'Mehrfamilienhaus, 10 Wohnungen, Baujahr 1906', date: 'Feb 26', status: 'Verkauft', pin: [264.7, 72.2] },
  { street: 'Seehofallee 19', city: 'Hamburg', note: 'Mehrfamilienhaus, 8 Wohnungen, Baujahr 1982', date: 'Jan 26', status: 'Verkauft', pin: [283.9, 144.3] },
  { street: 'Mühlenweg 176', city: 'Kiel', note: 'Mehrfamilienhaus, 21 Wohnungen und 6 Garagen, Baujahr 1930', date: 'Okt 25', status: 'Verkauft', pin: [292.7, 72.2] },
  { street: 'Eichhofstraße 10', city: 'Kiel', note: '8 Einheiten von 1904 und 4 Neubauten im Hinterhof', date: 'Okt 25', status: 'Verkauft', pin: [278.7, 98.2] },
  { street: 'Marienthaler Straße 91', city: 'Hamburg', note: 'Mehrfamilienhaus, 8 Wohnungen, Baujahr 1956, Dachausbau und Balkone', date: 'Aug 25', status: 'Verkauft', pin: [269.9, 170.3] },
  { street: 'Cloppenburger Straße 155a+b', city: 'Oldenburg', note: 'Aufgeteiltes Mehrfamilienhaus, Baujahr 2006', date: 'Aug 25', status: 'Verkauft', pin: [165.3, 192.8] },
  { street: 'Schillerstraße 32', city: 'Cuxhaven', note: 'Wohn- und Geschäftshaus, Baujahr 1933', date: 'Jul 25', status: 'Verkauft', pin: [194.1, 124.3] },
  { street: 'Mühlenberg 10, 10a', city: 'Lauenburg', note: 'Mehrfamilienhaus, 9 Wohnungen mit Elbblick', date: 'Feb 25', status: 'Verkauft', pin: [303.4, 171.2] },
  { street: 'Deichgrafenstraße 51+52', city: 'Tönning', note: '9 Ferienwohnungen, renoviert und einzeln verkauft', date: 'Feb 25', status: 'Verkauft', pin: [208.2, 82.2] },
]

export const projectsPipeline: Project[] = [
  { city: 'Lübeck', note: '40 Wohnungen · 1.454 m²', status: 'Im Ankauf', pin: [311, 124.3] },
  { city: 'Hamburg-Eilbek', note: '12 Wohnungen · 660 m²', status: 'Im Ankauf', pin: [253.9, 164.3] },
  { city: 'Hamburg-Bergedorf', note: '12 Wohnungen · 971 m²', status: 'Im Ankauf', pin: [285.9, 164.3] },
  { city: 'Köln', note: '5 Wohnungen · 63 m²', status: 'Im Ankauf', pin: [91.9, 399] },
  { city: 'Bonn', note: '5 Wohnungen · 1.800 m²', status: 'Im Ankauf', pin: [100.1, 418.7] },
]

export const legalNotice =
  'Genossenschaftsanteile sind eine unternehmerische Beteiligung. Die Zielrendite von 7 % p.a. ist nicht garantiert und hängt vom wirtschaftlichen Erfolg der Genossenschaft ab. Kein Anspruch auf Ausschüttung oder Rückzahlung; Verlust bis zum Totalverlust möglich. Keine gesetzliche Einlagensicherung. Keine Anlageberatung. Bitte lesen Sie vor einer Entscheidung Risikohinweis und Satzung.'

// ---- Mitgliederbereich: Dokumente und Termine (Beispieldaten) ------------------

export type MemberDocument = { title: string; note: string; kind: 'Persönlich' | 'Genossenschaft' }

export const memberDocuments: MemberDocument[] = [
  { title: 'Mitgliedsbestätigung', note: 'Ihre Aufnahme in die Genossenschaft', kind: 'Persönlich' },
  { title: 'Steuerbescheinigung 2025', note: 'Für Ihre Steuererklärung', kind: 'Persönlich' },
  { title: 'Zinsabrechnung Q3 2026', note: 'Auszahlung vom 30.09.2026', kind: 'Persönlich' },
  { title: 'Satzung', note: 'Grundordnung der Genossenschaft', kind: 'Genossenschaft' },
  { title: 'Allgemeine Geschäftsordnung', note: 'Verzinsung, Laufzeit, Kündigung', kind: 'Genossenschaft' },
  { title: 'Jahresabschluss 2025', note: 'Geprüft durch den DIVK e. V.', kind: 'Genossenschaft' },
]

export type MemberEvent = { day: string; month: string; title: string; place: string; note: string }

export const memberEvents: MemberEvent[] = [
  { day: '14', month: 'Nov', title: 'Besichtigung Kiel, Schreventeich', place: 'Kiel · 14:00 Uhr', note: 'Rundgang mit der Projektleitung vor Baubeginn' },
  { day: '03', month: 'Dez', title: 'Online-Projektbericht', place: 'Video · 18:30 Uhr', note: 'Stand aller Projekte, mit Fragerunde' },
  { day: '20', month: 'Dez', title: 'Heimspiel HSV Handball Hamburg', place: 'Hamburg · Sporthalle', note: 'Gemeinsam mit anderen Mitgliedern' },
  { day: '12', month: 'Jun', title: 'Mitgliederversammlung 2027', place: 'Hamburg · Langenhorner Chaussee 155', note: 'Bericht von Vorstand und Aufsichtsrat' },
]
