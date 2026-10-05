// Platzhalterdaten — Layout-Vorschau. Wird durch echte Zahlen aus dem
// Meta-Connector (Instagram/Facebook) und LinkedIn ersetzt, sobald die
// Anbindung autorisiert ist. Nichts hier sind reale Unternehmenszahlen.

export const reportMeta = {
  period: "September 2026",
  generatedNote: "Beispieldaten — Platzhalter für das Layout",
};

export type Platform = {
  id: "linkedin" | "instagram" | "facebook";
  name: string;
  color: string; // fixed categorical order — never reassigned/cycled
  follower: number;
  followerDelta: number;
  reach: number;
  engagementRate: number; // percent
};

// Fixed categorical order: LinkedIn -> Navy, Instagram -> Koralle, Facebook -> Gold.
export const platforms: Platform[] = [
  { id: "linkedin", name: "LinkedIn", color: "#141A46", follower: 3480, followerDelta: 126, reach: 48200, engagementRate: 4.1 },
  { id: "instagram", name: "Instagram", color: "#F97768", follower: 5210, followerDelta: 214, reach: 61300, engagementRate: 3.4 },
  { id: "facebook", name: "Facebook", color: "#DDB851", follower: 2190, followerDelta: 18, reach: 19700, engagementRate: 1.6 },
];

export const kpis = [
  { label: "Follower gesamt", value: "10.880", delta: "+358", deltaDirection: "up" as const, sub: "ggü. Vormonat" },
  { label: "Reichweite (30 Tage)", value: "129.200", delta: "+9,4 %", deltaDirection: "up" as const, sub: "ggü. Vormonat" },
  { label: "Ø Engagement-Rate", value: "3,2 %", delta: "+0,3 pp", deltaDirection: "up" as const, sub: "ggü. Vormonat" },
  { label: "Neue Follower", value: "358", delta: "−42", deltaDirection: "down" as const, sub: "ggü. Vormonat" },
];

// Monthly total-reach trend, last 6 months — single series (sequential, one hue).
export const reachTrend = [
  { label: "Apr", value: 86000 },
  { label: "Mai", value: 91500 },
  { label: "Jun", value: 97000 },
  { label: "Jul", value: 104000 },
  { label: "Aug", value: 118100 },
  { label: "Sep", value: 129200 },
];

export type TopPost = {
  id: string;
  platform: Platform["id"];
  excerpt: string;
  reach: number;
  engagementRate: number;
};

export const topPosts: TopPost[] = [
  {
    id: "p1",
    platform: "instagram",
    excerpt: "Vorher/Nachher: Sanierung eines Mehrfamilienhauses in Hamburg-Eimsbüttel.",
    reach: 18400,
    engagementRate: 6.1,
  },
  {
    id: "p2",
    platform: "linkedin",
    excerpt: "7 % Rendite p.a. bei Hanseatische Invest eG — Erklärvideo zur Beteiligung.",
    reach: 12100,
    engagementRate: 5.4,
  },
  {
    id: "p3",
    platform: "instagram",
    excerpt: "Teamvorstellung: Kai Raila über den Vertrieb von Kapitalanlage-Immobilien.",
    reach: 9800,
    engagementRate: 4.8,
  },
  {
    id: "p4",
    platform: "facebook",
    excerpt: "Neue Partnerschaft mit wirmietendeinhaus.de für die 10-Jahres-Mietgarantie.",
    reach: 6200,
    engagementRate: 2.9,
  },
];
