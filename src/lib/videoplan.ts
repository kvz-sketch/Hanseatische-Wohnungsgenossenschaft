import { useCallback, useEffect, useState } from "react";

// Client for public/api/videoplan.php — the shared store behind the
// "Videoplan & Freigaben" page. Every visitor sees and edits the same data.

export type Status = "ungeplant" | "geplant" | "schnitt" | "freigabe" | "freigegeben";
export type Category = "shoot" | "schnitt" | "meeting" | "creative" | "sonstiges";

export const BRIEF_FIELDS = [
  { key: "projekt", label: "Projekt / Marke", rows: 1 },
  { key: "ziel", label: "Ziel des Videos", rows: 2 },
  { key: "botschaft", label: "Kernbotschaft", rows: 2 },
  { key: "zielgruppe", label: "Zielgruppe", rows: 1 },
  { key: "location", label: "Location / Adresse", rows: 2 },
  { key: "ansprechpartner", label: "Ansprechpartner vor Ort", rows: 1 },
  { key: "crew", label: "Crew", rows: 2 },
  { key: "talent", label: "Darsteller / Talent", rows: 2 },
  { key: "shotlist", label: "Shotlist / Szenen", rows: 6 },
  { key: "equipment", label: "Equipment", rows: 2 },
  { key: "formate", label: "Formate (z. B. 9:16, 16:9, 1:1)", rows: 1 },
  { key: "deadline", label: "Deadline Schnitt / Freigabe", rows: 1 },
  { key: "notizen", label: "Notizen", rows: 3 },
] as const;

export type BriefKey = (typeof BRIEF_FIELDS)[number]["key"];
export type Brief = Record<BriefKey, string>;
export type DriveLink = { url: string; label: string };

export type Item = {
  id: string;
  title: string;
  status: Status;
  category: Category;
  /** Local wall time "YYYY-MM-DDTHH:mm", or null when not scheduled. */
  start: string | null;
  end: string | null;
  allDay: boolean;
  brief: Brief;
  links: DriveLink[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type Feedback = { id: string; itemId: string; author: string; text: string; createdAt: string };

export type ItemDraft = Omit<Item, "id" | "createdAt" | "updatedAt">;

export const STATUS_LABEL: Record<Status, string> = {
  ungeplant: "Ungeplant",
  geplant: "Geplant",
  schnitt: "Im Schnitt",
  freigabe: "In Freigabe",
  freigegeben: "Freigegeben",
};

export const CATEGORY_META: Record<Category, { label: string; bg: string; border: string; text: string }> = {
  shoot: { label: "Shoot", bg: "bg-koralle/15", border: "border-koralle", text: "text-[#b8402f]" },
  schnitt: { label: "Schnitt", bg: "bg-navy/10", border: "border-navy", text: "text-navy" },
  meeting: { label: "Meeting", bg: "bg-gold/20", border: "border-gold-deep", text: "text-[#7a5f1c]" },
  creative: { label: "Creative", bg: "bg-[#1f8a5a]/12", border: "border-[#1f8a5a]", text: "text-[#1f6a46]" },
  sonstiges: { label: "Sonstiges", bg: "bg-fog/40", border: "border-muted", text: "text-ink" },
};

export const emptyBrief = (): Brief =>
  Object.fromEntries(BRIEF_FIELDS.map((f) => [f.key, ""])) as Brief;

const API = "/api/videoplan.php";

/** Thrown when the server rejects (or wants) the team edit password. */
export class LockedError extends Error {}

// ---------- edit password ----------
// Editing (create/update/delete) needs the team password; viewing and
// feedback don't. Once unlocked it's remembered in this browser and sent
// with every edit; a rejection clears it again.

const PASS_KEY = "gig-videoplan-pass";
const listeners = new Set<(p: string) => void>();
let editPassword = (() => {
  try {
    return localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    return "";
  }
})();

function setEditPassword(next: string) {
  editPassword = next;
  try {
    if (next) localStorage.setItem(PASS_KEY, next);
    else localStorage.removeItem(PASS_KEY);
  } catch {
    // Not remembered — the visitor just unlocks again next time.
  }
  listeners.forEach((l) => l(next));
}

/** Whether this browser holds the edit password, plus unlock/lock actions. */
export function useEditAccess() {
  const [pass, setPass] = useState(editPassword);
  useEffect(() => {
    listeners.add(setPass);
    return () => {
      listeners.delete(setPass);
    };
  }, []);
  const unlock = useCallback(async (password: string) => {
    await call({ action: "unlock" }, password);
    setEditPassword(password);
  }, []);
  const lock = useCallback(() => setEditPassword(""), []);
  return { canEdit: pass !== "", unlock, lock };
}

async function call<T>(body?: unknown, password?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (password) headers["X-Edit-Password"] = password;
  const res = await fetch(API, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ error: "Server nicht erreichbar." }));
  if (res.status === 403) {
    if (password && password === editPassword) setEditPassword("");
    throw new LockedError(data.error ?? "Zum Bearbeiten bitte das Team-Passwort eingeben.");
  }
  if (!res.ok || data.error) throw new Error(data.error ?? `Fehler ${res.status}`);
  return data as T;
}

const edit = <T,>(body: unknown) => call<T>(body, editPassword);

export const api = {
  create: (item: ItemDraft) => edit<{ item: Item }>({ action: "create", item }),
  update: (id: string, item: Partial<ItemDraft>) => edit<{ item: Item }>({ action: "update", id, item }),
  remove: (id: string, author: string) => edit<{ ok: true }>({ action: "delete", id, author }),
  feedback: (itemId: string, author: string, text: string) =>
    call<{ feedback: Feedback }>({ action: "feedback", itemId, author, text }),
};

/** All items + feedback, refreshed on demand, every 30 s and when the tab regains focus. */
export function useVideoplan() {
  const [items, setItems] = useState<Item[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await call<{ items: Item[]; feedback: Feedback[] }>();
      setItems(data.items);
      setFeedback(data.feedback);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Initial load plus polling, so changes by colleagues show up without a reload.
    const first = setTimeout(reload, 0);
    const timer = setInterval(reload, 30_000);
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [reload]);

  return { items, feedback, error, loaded, reload };
}

/** The visitor's name, remembered in this browser, used as author for edits and feedback. */
export function useAuthorName(): [string, (name: string) => void] {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("gig-videoplan-name") ?? "";
    } catch {
      return "";
    }
  });
  const save = useCallback((next: string) => {
    setName(next);
    try {
      localStorage.setItem("gig-videoplan-name", next);
    } catch {
      // Private mode etc. — the name just isn't remembered.
    }
  }, []);
  return [name, save];
}

// ---------- Google Drive ----------

/** File ID from the usual Drive/Docs link shapes, or null (e.g. for folders). */
export function driveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([\w-]{10,})/,
    /\/(?:document|presentation|spreadsheets|drawings)\/d\/([\w-]{10,})/,
    /[?&]id=([\w-]{10,})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export const isDriveFolder = (url: string) => /\/drive\/(?:u\/\d+\/)?folders\//.test(url);

/** Thumbnail image for a Drive file. Only loads if the file is shared via link. */
export const driveThumbnail = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w800`;

// ---------- dates ----------

export const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toLocal = (date: string, time: string) => `${date}T${time}`;
export const datePart = (v: string) => v.slice(0, 10);
export const timePart = (v: string) => v.slice(11, 16);
export const parseLocal = (v: string) => {
  const [d, t = "00:00"] = v.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, min);
};

export const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function formatRange(item: Pick<Item, "start" | "end" | "allDay">): string {
  if (!item.start) return "Noch kein Termin";
  const s = parseLocal(item.start);
  const day = s.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
  if (item.allDay) {
    if (item.end && datePart(item.end) !== datePart(item.start)) {
      const e = parseLocal(item.end);
      return `${day} bis ${e.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })} · ganztägig`;
    }
    return `${day} · ganztägig`;
  }
  return `${day} · ${timePart(item.start)}${item.end ? ` bis ${timePart(item.end)}` : ""} Uhr`;
}
