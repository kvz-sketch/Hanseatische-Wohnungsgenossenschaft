import type { Faq } from './content'

// Copy for the public landing page, from the "Hansea Invest" wireframe brief.
// Sections marked "copy exactly" in the brief are reproduced verbatim.

export const publicNav = [
  { label: 'Über uns', href: '/#ueber-uns' },
  { label: "So funktioniert's", href: '/#so-funktionierts' },
  { label: 'Case Studies', href: '/#case-studies' },
  { label: 'Team', href: '/#team' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Kontakt', href: '/#kontakt' },
]

export const aboutStats = [
  { value: '45', label: 'Mitarbeiter' },
  { value: '3', label: 'Standorte' },
  { value: '2018', label: 'Gegründet' },
  { value: '300', label: 'Verkaufte Wohnungen' },
]

export const glanceBullets = [
  'Genossenschaftliche Beteiligung',
  'Investition in reale Wohnimmobilien',
  'Teilhabe mit Chancen & Risiken',
  'Mindestlaufzeit: 12 Monate',
  'Verzinsung bis 7 % p.a.*',
]

export const capitalSteps = [
  {
    title: 'Ihr Kapital fließt in mehrere, reale Immobilienprojekte gleichzeitig',
    text: 'Ihr gezeichnetes Kapital wird gezielt in ausgewählte Immobilienprojekte investiert. Der Fokus liegt auf kosteneffizientem Ankauf, Modernisierung, Aufteilung in Einheiten und gewinnbringendem Verkauf. Diese strukturierte Wertschöpfungskette bildet die wirtschaftliche Grundlage für Ihre Rendite innerhalb der Genossenschaft und schafft nachhaltige Perspektiven für Anleger.',
  },
  {
    title: 'Es wird als Eigenkapital eingesetzt',
    text: 'Das eingebrachte Kapital wird als Eigenkapital in die jeweiligen Projektstrukturen eingebracht und stärkt die wirtschaftliche Substanz der Vorhaben. Dadurch entsteht eine belastbare Basis für Finanzierungsgespräche, Investitionsentscheidungen und Umsetzungsschritte entlang der gesamten Wertschöpfungskette, von Ankauf über Modernisierung bis hin zum Verkauf.',
  },
  {
    title: 'Eigenkapital ermöglicht stabile Finanzierungsstrukturen',
    text: 'Eine solide Eigenkapitalausstattung ermöglicht ausgewogene Finanzierungsstrukturen mit klar kalkulierten Risikoabschlägen und ausreichenden Liquiditätsreserven. Durch starke Liquidität können Opportunitäten schnell genutzt und Objekte unter Marktniveau erworben werden, sodass selbst bei Marktveränderungen ausreichende Puffer und Rückzahlungsfähigkeit gewährleistet bleiben.',
  },
  {
    title: 'Erträge entstehen durch Verkauf und laufende Weitervermietung',
    text: 'Die Rendite entsteht aus der erfolgreichen Umsetzung der Projekte, insbesondere durch Modernisierung, Aufteilung und anschließenden gewinnbringenden Verkauf der Immobilien. Ergänzend sichern effiziente Prozesse und klare Laufzeiten ein stimmiges Matching zwischen Projektzeitraum und Kündigungsfrist, wodurch planbare Rückzahlungen und wirtschaftliche Stabilität unterstützt werden.',
  },
]

export const seals = [
  { src: '/media/siegel-top-experte-2026.png', alt: 'Siegel „Top-Experte 2026“, ERFOLG Magazin', label: 'TOP-Experten-Siegel 2026' },
  {
    src: '/media/siegel-top-100-coaches-berater-2025.png',
    alt: 'Siegel „Top 100 Coaches & Berater 2025“, ERFOLG Magazin',
    label: 'EM Top 100 Coaches + Berater',
  },
  {
    src: '/media/siegel-top-100-unternehmer-2024.png',
    alt: 'Siegel „Top 100 Unternehmer 2024“, ERFOLG Magazin',
    label: 'Top 100 Unternehmer-Siegel',
  },
]

export const caseStudies = [
  {
    title: 'Hamburg Eilbek',
    text: 'Wir haben einen Altbau aus dem Jahr 1892 mit sechs Wohneinheiten und einer Gewerbeeinheit erworben und umfassend optimiert. Dazu gehörten die Sanierung und Dämmung der Fassade sowie die Modernisierung der Gemeinschaftsflächen. Die Bestandsmieten und Grundrisse wurden optimiert, während die beiden freien und später frei werdenden Wohnungen nach der Sanierung als möblierte WGs vermietet wurden. Die ehemalige Gastronomiefläche im Souterrain wurde in zwei Ferienwohnungen umgewandelt. Nach Abschluss der Maßnahmen erfolgte der Verkauf an Eigennutzer und Kapitalanleger. Die Projektlaufzeit betrug 20 Monate.',
  },
  {
    title: 'Oldenburg',
    text: 'Wir haben zwei Vierparteienhäuser mit großzügigen Maisonette-Wohnungen erworben, die sich ideal für Studenten-WGs eignen. Die Gemeinschaftsflächen und der Außenbereich wurden überarbeitet, während zwei freie Wohnungen saniert und mit einem WG-Konzept sowie Mietgarantie verkauft wurden. Durch die gezielte Berücksichtigung der Mieterwünsche und Renovierungsmaßnahmen konnte eine einvernehmliche Mietanpassung von über 30 % erreicht werden. Da die Mieter aufgrund der familiären Situation und der attraktiven Lage bleiben wollten, entstanden wertstabile und gut verkäufliche Anlagewohnungen. Die Projektlaufzeit betrug 9 Monate.',
  },
]

export const team = [
  {
    name: 'Stephan Gerlach',
    role: 'Vorstandsvorsitzender',
    photo: '/media/stephan-gerlach-portraet.jpg',
    bio: 'Gründer der Gerlach Immobilien Gruppe und Experte für nachhaltige Kapitalanlage-Immobilien. Mit einem ganzheitlichen Ansatz begleitet er Anleger von der Objektwahl über die Finanzierung bis zur langfristigen Verwaltung.',
  },
  {
    name: 'Vadim Kogan',
    role: 'Aufsichtsrat',
    photo: null,
    bio: 'Experte für das deutsche Gesundheitswesen und die Digitalisierung medizinischer Prozesse. Als Vorstand der ArztData AG und Gründer des ArztData Clubs unterstützt er Ärzte dabei, ihre Praxen wirtschaftlich erfolgreicher und effizienter zu gestalten.',
  },
  {
    name: 'Christine Pistorius',
    role: 'Vorstand',
    photo: null,
    bio: 'Erfahrene Immobilieninvestorin und Expertin für Sprungauflassung im Immobilienhandel. Als Vorstandsmitglied der 100.PlusCommunity und gefragte Sprecherin unterstreicht sie die Bedeutung von Immobilien als sichere Kapitalanlage.',
  },
]

export const caseStudyStats = [
  { value: '2,5 M', label: 'Gesamtinvestition' },
  { value: '2 M', label: 'Kaufpreis' },
  { value: '500.000', label: 'Sanierung' },
  { value: '2 M', label: 'Bankdarlehen' },
  { value: '500.000', label: 'Eigenkapital' },
  { value: '3,2 M', label: 'Verkaufspreis' },
]

// Answers taken from the FAQ and "So funktioniert's" copy of the reference site
export const publicFaqs: Faq[] = [
  {
    q: 'Was bedeutet „investierendes Mitglied“ konkret?',
    lead: 'Sie werden Mitglied, nicht Kunde.',
    body: 'Ihr Geld bleibt im Unternehmen und fließt direkt in eigene Projekte. Die Wertschöpfung entsteht durch Arbeit an Häusern, nicht durch Finanzprodukte. Genossenschaften unterliegen dem Genossenschaftsgesetz und der Pflichtprüfung durch einen Prüfungsverband – ein Modell, das es in Deutschland seit über 150 Jahren gibt. Einmal im Jahr laden wir alle Mitglieder ein: Vorstand und Projektleiter berichten, Sie sehen die Häuser und lernen andere Mitglieder kennen.',
  },
  {
    q: 'Wie wird mein Kapital eingesetzt?',
    lead: 'In konkreten Häusern – mit Adresse und Fotos.',
    body: 'Bestandshäuser günstig kaufen, sanieren, in einzelne Wohnungen aufteilen und verkaufen: Dieses Geschäft war bisher Profis mit viel Kapital vorbehalten. Die Genossenschaft bündelt das Geld vieler Mitglieder – so sind Sie schon ab 10.000 € dabei. Jeder Anteil wird einem Projekt zugeordnet. Im Mitgliederportal sehen Sie Phase, Baufortschritt und jede Ausschüttung.',
  },
  {
    q: 'Welche Rendite kann ich erwarten?',
    lead: 'Ziel sind 7 % im Jahr, ausgezahlt in vier Raten – nicht garantiert.',
    body: 'Bei 25.000 € sind das als Ziel 437,50 € pro Quartal, brutto. Kein Zinseszins, vor Kapitalertragsteuer. Die Ausschüttung hängt vom wirtschaftlichen Erfolg der Genossenschaft ab.',
  },
  {
    q: 'Welche Laufzeiten und Kündigungsfristen gelten?',
    lead: 'Nach 12 Monaten entscheiden Sie.',
    body: 'Weiterlaufen lassen, aufstocken oder mit neun Monaten Frist kündigen. Keine Nachschusspflicht.',
  },
  {
    q: 'Welche Risiken bestehen bei einer Beteiligung?',
    lead: 'Reale Häuser, geprüfte Genossenschaft – und trotzdem eine unternehmerische Beteiligung.',
    body: 'Ihre Investition fließt in reale Wohnimmobilien in Deutschland. Die Hanseatische Invest eG ist eine eingetragene Genossenschaft und wird durch den DIVK Prüfungsverband regelmäßig geprüft. Bitte beachten Sie jedoch, dass es sich um eine unternehmerische Beteiligung handelt: Verlust bis zum Totalverlust ist möglich, und es besteht keine gesetzliche Einlagensicherung.',
    link: { label: 'Risikohinweis lesen', href: '#' },
  },
]

export const referralSources = ['Bitte wählen', 'Empfehlung', 'Google / Suche', 'Social Media', 'Webinar', 'Buch', 'Presse', 'Makler', 'Sonstiges']
