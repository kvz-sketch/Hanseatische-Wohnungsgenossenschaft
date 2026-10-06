import type { Campaign } from "../data/performanceReport";

export type PeriodMode = "all" | "week" | "month";
export type PeriodOption = { key: string; label: string };

const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTHS_DE_FULL = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function toDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mondayOf(d: Date): Date {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  return monday;
}

export function getWeekKey(dateStr: string): string {
  return toIso(mondayOf(toDate(dateStr)));
}

export function getWeekLabel(key: string): string {
  const monday = toDate(key);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const d1 = monday.getUTCDate();
  const m1 = MONTHS_DE[monday.getUTCMonth()];
  const d2 = sunday.getUTCDate();
  const m2 = MONTHS_DE[sunday.getUTCMonth()];
  const y = sunday.getUTCFullYear();
  return m1 === m2 ? `${d1}.–${d2}. ${m2} ${y}` : `${d1}. ${m1} – ${d2}. ${m2} ${y}`;
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function getMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_DE_FULL[m - 1]} ${y}`;
}

export function collectAllLeadDates(campaigns: Campaign[], funnelExtra: Record<string, { dates: string[] }>): string[] {
  const dates: string[] = [];
  for (const c of campaigns) {
    for (const ad of c.ads) {
      if (ad.leadDates) dates.push(...ad.leadDates);
    }
    if (c.unattributedLeadDates) dates.push(...c.unattributedLeadDates);
  }
  for (const key in funnelExtra) {
    dates.push(...funnelExtra[key].dates);
  }
  return dates;
}

export function buildPeriodOptions(dates: string[]): { weeks: PeriodOption[]; months: PeriodOption[] } {
  const weekMap = new Map<string, string>();
  const monthMap = new Map<string, string>();
  for (const d of dates) {
    const wk = getWeekKey(d);
    weekMap.set(wk, getWeekLabel(wk));
    const mk = getMonthKey(d);
    monthMap.set(mk, getMonthLabel(mk));
  }
  const weeks = [...weekMap.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([key, label]) => ({ key, label }));
  const months = [...monthMap.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([key, label]) => ({ key, label }));
  return { weeks, months };
}

export function makeInPeriod(mode: PeriodMode, key: string | null): (dateStr: string) => boolean {
  if (mode === "all" || !key) return () => true;
  if (mode === "week") return (d: string) => getWeekKey(d) === key;
  return (d: string) => getMonthKey(d) === key;
}

export function leadsInPeriod(dates: string[] | undefined, inPeriod: (d: string) => boolean): number {
  return (dates ?? []).filter(inPeriod).length;
}

export function campaignLeadsInPeriod(c: Campaign, inPeriod: (d: string) => boolean): number {
  const adSum = c.ads.reduce((s, a) => s + leadsInPeriod(a.leadDates, inPeriod), 0);
  return adSum + leadsInPeriod(c.unattributedLeadDates, inPeriod);
}
