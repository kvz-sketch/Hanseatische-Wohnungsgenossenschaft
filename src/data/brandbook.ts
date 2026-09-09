// Content transcribed from "Gerlach Markenbuch" (Markenbuch · Ausgabe 01 · 2026).
// Hex/RGB values are taken verbatim from the book's Farbsystem page (09).

export type PaletteColor = {
  name: string;
  hex: string;
  role: string;
};

export const paletteColors: Record<string, PaletteColor> = {
  navy: { name: "Navy", hex: "#141A46", role: "Primärfarbe · Dachfarbe · Text" },
  gold: { name: "Gold", hex: "#DDB851", role: "Akzent · Auszeichnung" },
  koralle: { name: "Koralle", hex: "#F97768", role: "Sekundärakzent · sparsam" },
  hellgrau: { name: "Hellgrau", hex: "#F5F5F5", role: "Helle Flächen · Neutral" },
  minze: { name: "Minze", hex: "#46B794", role: "Akzent · Wirsponserndeinteam" },
  schwarz: { name: "Schwarz", hex: "#000000", role: "Text · Wirsponserndeinteam" },
};

export const masterPalette: PaletteColor[] = [
  paletteColors.navy,
  paletteColors.gold,
  paletteColors.koralle,
  paletteColors.hellgrau,
];

// The four sanctioned Farbvarianten of the GIG dachmarke lockup (section 05).
export const gigColorVariants = [
  { id: "schwarz-weiss", label: "Schwarz auf Weiß", bg: "#FFFFFF", fg: "#111318" },
  { id: "schwarz-grau", label: "Schwarz auf Grau", bg: "#E4E7EB", fg: "#111318" },
  { id: "weiss-navy", label: "Weiß auf Navy", bg: paletteColors.navy.hex, fg: "#FFFFFF" },
  { id: "navy-gold", label: "Navy auf Gold", bg: paletteColors.gold.hex, fg: paletteColors.navy.hex },
];

export type LogoConfig = {
  id: string;
  lines: string[];
  tagline?: string;
  accent?: { line: number; match: string; color: string };
};

export const gigLogo: LogoConfig = {
  id: "gig",
  lines: ["GIG"],
  tagline: "GERLACH IMMOBILIEN GRUPPE",
};

export type Submark = LogoConfig & {
  name: string;
  category: string;
  description: string;
  palette: PaletteColor[];
  status?: "arbeitstitel";
};

export const submarks: Submark[] = [
  {
    id: "hansea-invest",
    name: "Hansea Invest eG",
    category: "Genossenschaft",
    lines: ["HANSEA", "INVEST eG"],
    tagline: "GERLACH IMMOBILIEN GRUPPE",
    description:
      "Vermögensaufbau mit Immobilien — auf Wachstum und langfristige Rendite ausgerichtet.",
    palette: [paletteColors.navy, paletteColors.gold, paletteColors.hellgrau],
  },
  {
    id: "hanseatische-wohnungsgenossenschaft",
    name: "Hanseatische Wohnungsgenossenschaft",
    category: "Wohneigentum",
    lines: ["HANSEATISCHE", "WOHNUNGSGENOSSENSCHAFT"],
    tagline: "GERLACH IMMOBILIEN GRUPPE",
    description:
      "Genossenschaftlicher Wohnungsbau und -bestand mit hanseatischem Anspruch an Qualität.",
    palette: [paletteColors.navy, paletteColors.koralle, paletteColors.gold, paletteColors.hellgrau],
  },
  {
    id: "hansea-grow",
    name: "Hansea Grow",
    category: "Digitaler Einstieg",
    lines: ["HANSEA", "GROW"],
    tagline: "GERLACH IMMOBILIEN GRUPPE",
    description:
      "Vermögensaufbau mit Immobilien — auf Wachstum und langfristige Rendite ausgerichtet.",
    palette: [paletteColors.navy, paletteColors.gold, paletteColors.hellgrau],
  },
  {
    id: "kapitalanlagevertrieb",
    name: "Kapitalanlagevertrieb.de",
    category: "Kapitalanlagevertrieb",
    lines: ["KAPITALANLAGEVERTRIEB.DE"],
    tagline: "GERLACH IMMOBILIEN GRUPPE",
    description:
      "Digitale Anlaufstelle für den Vertrieb steueroptimierter Kapitalanlage-Immobilien.",
    palette: [paletteColors.navy, paletteColors.koralle, paletteColors.hellgrau],
  },
  {
    id: "immo-affiliate-network",
    name: "Immo Affiliate Network",
    category: "Partnernetzwerk",
    lines: ["IMMO", "AFFILIATE NETWORK"],
    description:
      "Partner- und Vertriebsnetzwerk der Gruppe für die Vermittlung von Anlageimmobilien.",
    palette: [paletteColors.navy, paletteColors.gold, paletteColors.hellgrau],
  },
  {
    id: "projektsuchtkapital",
    name: "Projektsuchtkapital.de",
    category: "Kapitalanlagevertrieb",
    lines: ["PROJEKTSUCHTKAPITAL.DE"],
    description:
      "Digitale Anlaufstelle für den Vertrieb steueroptimierter Kapitalanlage-Immobilien.",
    palette: [paletteColors.navy, paletteColors.hellgrau],
  },
  {
    id: "wirsponserndeinteam",
    name: "Wirsponserndeinteam",
    category: "Partnernetzwerk",
    lines: ["WIRSPONSERNDEINTEAM"],
    tagline: "GERLACH IMMOBILIEN GRUPPE",
    accent: { line: 0, match: "DEIN", color: paletteColors.minze.hex },
    description:
      "Partner- und Vertriebsnetzwerk der Gruppe für die Vermittlung von Anlageimmobilien.",
    palette: [paletteColors.minze, paletteColors.schwarz, paletteColors.hellgrau],
  },
  {
    id: "hansea-living",
    name: "Hansea Living",
    category: "Wohnen & Verwaltung",
    lines: ["HANSEA LIVING"],
    description:
      "Digitale Anlaufstelle für den Vertrieb steueroptimierter Kapitalanlage-Immobilien.",
    palette: [paletteColors.navy, paletteColors.koralle, paletteColors.hellgrau],
    status: "arbeitstitel",
  },
];

export const fehlanwendungen = [
  { id: "verzerren", caption: "Nicht verzerren oder stauchen.", demo: "stretch" },
  { id: "fremdfarben", caption: "Nicht in fremde Farben setzen.", demo: "wrong-color" },
  { id: "drehen", caption: "Nicht drehen oder kippen.", demo: "rotate" },
  { id: "unruhig", caption: "Nicht auf unruhige Flächen ohne Kontrast.", demo: "busy-bg" },
  { id: "schatten", caption: "Keine Schatten oder Effekte.", demo: "shadow" },
  { id: "schutzraum", caption: "Schutzraum nicht unterschreiten.", demo: "cramped" },
] as const;

export const logoConstruction = [
  {
    n: 1,
    title: "Dachsymbol",
    body: "Die abstrahierte Dachlinie. Referenz auf Immobilie und Zuhause und zugleich das verbindende Zeichen der Gruppe.",
  },
  {
    n: 2,
    title: "Wortmarke",
    body: "Der Markenname in einer hochwertigen Times New Roman. Zentriert unter dem Dachsymbol.",
  },
  {
    n: 3,
    title: "Namenszusatz",
    body: '„Gerlach Immobilien Gruppe" in Inter — bindet jede Submarke an die Dachmarke.',
  },
];

export const typography = {
  display: {
    label: "Display / Wortmarke",
    family: "Times New Roman",
    stack: "'Times New Roman', Times, Georgia, serif",
    sample: "Mehr Rendite. Weniger Risiko. Kein Aufwand.",
  },
  text: {
    label: "Namenszusatz / UI / Fließtext",
    family: "Inter",
    stack: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    weights: [
      { name: "Light", n: 300 },
      { name: "Regular", n: 400 },
      { name: "Medium", n: 500 },
      { name: "Semibold", n: 600 },
    ],
  },
};

export const claim = "Mehr Rendite. Weniger Risiko. Kein Aufwand.";

/** Strip a Submark down to the fields BrandLogo needs, optionally dropping the tagline
 * (used in compact lockups like the architecture tree or combination logos). */
export function toLogoConfig(mark: Submark, opts: { withTagline?: boolean } = {}): LogoConfig {
  return {
    id: mark.id,
    lines: mark.lines,
    tagline: opts.withTagline ? mark.tagline : undefined,
    accent: mark.accent,
  };
}
