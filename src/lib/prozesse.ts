import { useCallback, useEffect, useState } from "react";

// Prozesse & Customer Journeys: process boards stored by /api/prozesse.php.
// Viewing is open; editing needs the same team password as the Videoplan,
// remembered under the same browser key so one unlock covers both pages.

export type NodeType = "phase" | "step" | "decision" | "note" | "text" | "frame";
export type NodeColor = "navy" | "gold" | "koralle" | "green" | "blue" | "grey";

export type BoardNode = {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  text: string;
  color: NodeColor;
};

export type BoardEdge = { id: string; from: string; to: string; label: string };

/** The editable part of a board, what "save" sends. With miroUrl set, the process lives in Miro instead. */
export type BoardContent = { title: string; description: string; nodes: BoardNode[]; edges: BoardEdge[]; miroUrl?: string };

export type Board = BoardContent & {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  createdBy?: string;
};

export type BoardSummary = {
  id: string;
  title: string;
  description: string;
  miroUrl: string;
  phases: number;
  elements: number;
  updatedBy: string;
  updatedAt: string;
};

export const NODE_TYPES: { type: NodeType; label: string; hint: string; w: number; h: number; color: NodeColor }[] = [
  { type: "phase", label: "Phase", hint: "Abschnitt im Prozess mit Beschreibung", w: 260, h: 170, color: "navy" },
  { type: "step", label: "Schritt", hint: "Einzelne Aufgabe oder Touchpoint", w: 220, h: 100, color: "navy" },
  { type: "decision", label: "Entscheidung", hint: "Verzweigung: ja / nein", w: 200, h: 110, color: "gold" },
  { type: "note", label: "Notiz", hint: "Haftnotiz für Ideen und Hinweise", w: 200, h: 160, color: "gold" },
  { type: "text", label: "Text", hint: "Überschrift oder freier Text", w: 280, h: 60, color: "navy" },
  { type: "frame", label: "Bereich", hint: "Rahmen um zusammengehörige Elemente", w: 640, h: 380, color: "blue" },
];

export const typeMeta = (t: NodeType) => NODE_TYPES.find((n) => n.type === t)!;

/** Brand colours: strong tone for borders/headers, soft tone for fills, readable text on the strong tone. */
export const COLORS: Record<NodeColor, { label: string; strong: string; soft: string; onStrong: string }> = {
  navy: { label: "Navy", strong: "#141a46", soft: "#e8e9f0", onStrong: "#ffffff" },
  gold: { label: "Gold", strong: "#ddb851", soft: "#fbf3dc", onStrong: "#141a46" },
  koralle: { label: "Koralle", strong: "#f97768", soft: "#feeae7", onStrong: "#ffffff" },
  green: { label: "Grün", strong: "#1f8a5a", soft: "#e3f2ea", onStrong: "#ffffff" },
  blue: { label: "Blau", strong: "#3b6fd8", soft: "#e6eefb", onStrong: "#ffffff" },
  grey: { label: "Grau", strong: "#8a8fa6", soft: "#f0f1f5", onStrong: "#ffffff" },
};

export const newElementId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ---------- Miro ----------

const MIRO_RE = /^https:\/\/miro\.com\/app\/(?:board|live-embed)\/([A-Za-z0-9_=-]+)\/?(?:\?[^\s"<>\\]*)?$/;

/** Board ID from a Miro share or embed link, or null if it isn't one. */
export const miroBoardId = (url: string) => MIRO_RE.exec(url.trim())?.[1] ?? null;

/** Miro's live embed for a board; shows it to everyone the board is shared with. */
export const miroEmbedUrl = (url: string) => {
  const id = miroBoardId(url);
  return id ? `https://miro.com/app/live-embed/${id}/?autoplay=true` : null;
};

// ---------- templates ----------

const node = (type: NodeType, x: number, y: number, title: string, text = "", color?: NodeColor, size?: { w: number; h: number }): BoardNode => {
  const m = typeMeta(type);
  return { id: newElementId(), type, x, y, w: size?.w ?? m.w, h: size?.h ?? m.h, title, text, color: color ?? m.color };
};

/** Chains nodes left to right with arrows. */
const chain = (nodes: BoardNode[]): BoardEdge[] =>
  nodes.slice(1).map((n, i) => ({ id: newElementId(), from: nodes[i].id, to: n.id, label: "" }));

export const TEMPLATES: { id: string; label: string; description: string; build: () => Pick<BoardContent, "nodes" | "edges"> }[] = [
  {
    id: "blank",
    label: "Leeres Board",
    description: "Freie Fläche, alles selbst aufbauen.",
    build: () => ({ nodes: [], edges: [] }),
  },
  {
    id: "journey",
    label: "Customer Journey",
    description: "Sieben Phasen vom ersten Kontakt bis zur Empfehlung, mit Touchpoints und Zuständigkeiten.",
    build: () => {
      const steps: [string, string, string][] = [
        ["Aufmerksamkeit", "Wie wird die Person auf uns aufmerksam?", "Meta Ads, Social Media, Empfehlung"],
        ["Interesse", "Was überzeugt sie, sich näher zu informieren?", "Landingpage, Lead-Formular"],
        ["Erstkontakt", "Wer meldet sich wann und wie?", "Setting-Call, E-Mail, WhatsApp"],
        ["Beratung", "Bedarfsanalyse und passende Objekte vorstellen.", "Termin vor Ort oder per Video"],
        ["Entscheidung", "Was braucht die Person für die Entscheidung?", "Exposé, Finanzierung, Reservierung"],
        ["Abschluss", "Vom Kaufvertrag bis zum Notartermin.", "Notar, Unterlagen, Übergabe"],
        ["Betreuung", "Nach dem Kauf: Vermietung, Verwaltung, Empfehlung.", "Hausverwaltung, Newsletter"],
      ];
      const phases = steps.map(([t, d], i) => node("phase", i * 320, 120, t, d, i === steps.length - 1 ? "green" : "navy"));
      const touch = steps.map(([, , tp], i) => node("note", i * 320 + 30, 340, "Touchpoints", tp, "gold"));
      const owner = steps.map((_, i) => node("step", i * 320 + 20, 540, "Verantwortlich", "Wer kümmert sich?", "grey"));
      const title = node("text", 0, 0, "Customer Journey", "Phasen, Touchpoints und Zuständigkeiten", "navy", { w: 520, h: 70 });
      return { nodes: [title, ...phases, ...touch, ...owner], edges: chain(phases) };
    },
  },
  {
    id: "process",
    label: "Prozess mit Phasen",
    description: "Start, drei Phasen, eine Entscheidung und Ende als Gerüst.",
    build: () => {
      const start = node("step", 0, 140, "Start", "Auslöser des Prozesses", "green", { w: 180, h: 80 });
      const p1 = node("phase", 260, 100, "Phase 1", "Was passiert hier? Wer ist verantwortlich? Welche Tools?");
      const p2 = node("phase", 600, 100, "Phase 2", "Was passiert hier? Wer ist verantwortlich? Welche Tools?");
      const dec = node("decision", 940, 130, "Freigabe?", "Kriterien für ja / nein");
      const p3 = node("phase", 1220, 100, "Phase 3", "Was passiert hier? Wer ist verantwortlich? Welche Tools?");
      const end = node("step", 1560, 140, "Ende", "Ergebnis des Prozesses", "green", { w: 180, h: 80 });
      const edges = chain([start, p1, p2, dec, p3, end]);
      edges[3].label = "ja";
      edges.push({ id: newElementId(), from: dec.id, to: p2.id, label: "nein" });
      return { nodes: [start, p1, p2, dec, p3, end], edges };
    },
  },
];

// ---------- API ----------

const API = "/api/prozesse.php";
const PASS_KEY = "gig-videoplan-pass";
const NAME_KEY = "gig-videoplan-name";

export class LockedError extends Error {}
/** Save rejected because a colleague saved first; carries their version. */
export class ConflictError extends Error {
  board: Board;
  constructor(message: string, board: Board) {
    super(message);
    this.board = board;
  }
}

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
    // Not remembered: the visitor unlocks again next time.
  }
  listeners.forEach((l) => l(next));
}

async function call<T>(query = "", body?: unknown, password?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (password) headers["X-Edit-Password"] = password;
  const res = await fetch(API + query, {
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
  if (res.status === 409 && data.board) throw new ConflictError(data.error, data.board as Board);
  if (!res.ok || data.error) throw new Error(data.error ?? `Fehler ${res.status}`);
  return data as T;
}

const edit = <T,>(body: unknown) => call<T>("", body, editPassword);

export const api = {
  list: () => call<{ boards: BoardSummary[]; editingConfigured: boolean }>(),
  get: (id: string) => call<{ board: Board }>(`?id=${encodeURIComponent(id)}`),
  create: (board: BoardContent, author: string) => edit<{ board: Board }>({ action: "create", board, author }),
  save: (id: string, version: number, board: BoardContent, author: string) =>
    edit<{ board: Board }>({ action: "save", id, version, board, author }),
  remove: (id: string, author: string) => edit<{ ok: true }>({ action: "delete", id, author }),
};

/** Whether this browser holds the team password, plus unlock/lock actions. */
export function useEditAccess() {
  const [pass, setPass] = useState(editPassword);
  useEffect(() => {
    listeners.add(setPass);
    return () => {
      listeners.delete(setPass);
    };
  }, []);
  const unlock = useCallback(async (password: string) => {
    await call("", { action: "unlock" }, password);
    setEditPassword(password);
  }, []);
  const lock = useCallback(() => setEditPassword(""), []);
  return { canEdit: pass !== "", unlock, lock };
}

/** The visitor's name (shared with the Videoplan), used as author of changes. */
export function useAuthorName(): [string, (name: string) => void] {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const save = useCallback((next: string) => {
    setName(next);
    try {
      localStorage.setItem(NAME_KEY, next);
    } catch {
      // Not remembered in private mode.
    }
  }, []);
  return [name, save];
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
