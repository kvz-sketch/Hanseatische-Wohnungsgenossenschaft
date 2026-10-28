import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, navigate, usePath } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { BoardEditor } from "../components/prozesse/BoardEditor";
import {
  ConflictError,
  LockedError,
  TEMPLATES,
  api,
  fmtDateTime,
  miroBoardId,
  miroEmbedUrl,
  useAuthorName,
  useEditAccess,
  type Board,
  type BoardContent,
  type BoardSummary,
} from "../lib/prozesse";

// Prozesse & Customer Journeys: /dashboard/prozesse lists every saved process,
// /dashboard/prozesse/<id> opens one on the board editor. Changes save
// automatically for anyone who unlocked editing with the team password.

const BASE = "/dashboard/prozesse";

function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="border-b border-navy/8 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link to={BASE} className="flex min-w-0 items-center gap-2.5">
          <RoofIcon color="#141A46" className="h-6 w-6 shrink-0" />
          <span className="subheading truncate text-[13.5px] leading-none text-navy">{title}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-4">
          {children}
          <Link to="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle">
            ← Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Team password field, or the "editing unlocked" state with the author's name. */
function EditBar({ hint, compact = false }: { hint?: string | null; compact?: boolean }) {
  const { canEdit, unlock, lock } = useEditAccess();
  const [author, setAuthor] = useAuthorName();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (canEdit) {
    return (
      <div className={`flex flex-wrap items-center gap-3 rounded-md border border-[#1f8a5a]/25 bg-[#1f8a5a]/[0.07] px-4 ${compact ? "py-2" : "py-3"}`}>
        <span className="text-[12.5px] font-semibold text-[#1f6a46]">🔓 Bearbeitungsmodus</span>
        <label className="flex items-center gap-2 text-[12px] text-ink">
          Dein Name
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="für die Änderungshistorie"
            maxLength={80}
            className="w-44 rounded-md border border-navy/15 bg-white px-2.5 py-1 text-[12.5px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
          />
        </label>
        <button type="button" onClick={lock} className="ml-auto text-[11px] font-bold uppercase tracking-[0.06em] text-muted hover:text-navy">
          Sperren
        </button>
      </div>
    );
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await unlock(password);
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className={`flex flex-wrap items-center gap-3 rounded-md border px-4 ${compact ? "py-2" : "py-3"} ${hint ? "border-koralle/40 bg-koralle/[0.07]" : "border-navy/10 bg-white"}`}>
      <span className="flex-1 basis-[240px] text-[12.5px] text-ink">
        <span className="font-bold text-navy">🔒 Ansichtsmodus.</span>{" "}
        {hint ?? "Ansehen kann jede:r. Zum Gestalten das Team-Passwort eingeben (dasselbe wie im Videoplan)."}
      </span>
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Team-Passwort"
        className="w-44 rounded-md border border-navy/15 px-3 py-1.5 text-[12.5px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
      />
      <button type="submit" disabled={busy || !password} className="rounded-md bg-navy px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:bg-navy-light disabled:opacity-50">
        {busy ? "Prüft …" : "Entsperren"}
      </button>
      {error && <span className="w-full text-[11.5px] font-semibold text-[#b8402f]">{error}</span>}
    </form>
  );
}

// ---------- list ----------

function NewBoardDialog({ onClose }: { onClose: () => void }) {
  const [author] = useAuthorName();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("journey");
  const [mode, setMode] = useState<"build" | "miro">("build");
  const [miroUrl, setMiroUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "miro" && !miroBoardId(miroUrl)) {
      setError("Bitte den Link eines Miro-Boards einfügen (https://miro.com/app/board/…).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const t = TEMPLATES.find((x) => x.id === template) ?? TEMPLATES[0];
      const content =
        mode === "miro"
          ? { nodes: [], edges: [], miroUrl: miroUrl.trim() }
          : { ...t.build(), miroUrl: "" };
      const { board } = await api.create({ title: title.trim(), description: description.trim(), ...content }, author);
      navigate(`${BASE}/${board.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="font-serif-display text-[24px] text-navy">Neuer Prozess</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ["build", "Hier gestalten", "Mit dem Board-Editor im Dashboard aufbauen."],
              ["miro", "Miro-Board verlinken", "Der Prozess liegt in Miro (z. B. aus Teams) und wird hier angezeigt."],
            ] as const
          ).map(([m, label, text]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md border p-3 text-left transition-colors ${mode === m ? "border-navy bg-navy/[0.04] ring-1 ring-navy" : "border-navy/12 hover:border-navy/40"}`}
            >
              <div className="text-[13px] font-bold text-navy">{label}</div>
              <div className="mt-1 text-[11.5px] leading-snug text-muted">{text}</div>
            </button>
          ))}
        </div>
        <label className="mt-5 block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Name</span>
          <input
            autoFocus
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Customer Journey Kapitalanleger"
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-[13.5px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Kurzbeschreibung (optional)</span>
          <textarea
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[70px] w-full rounded-md border border-navy/15 px-3 py-2 text-[13px] text-navy focus:border-navy focus:outline-none"
          />
        </label>
        {mode === "miro" ? (
          <label className="mt-4 block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Link zum Miro-Board</span>
            <input
              type="url"
              required
              value={miroUrl}
              onChange={(e) => setMiroUrl(e.target.value)}
              placeholder="https://miro.com/app/board/…"
              className="w-full rounded-md border border-navy/15 px-3 py-2 text-[13px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
            />
            <span className="mt-1.5 block text-[11.5px] leading-snug text-muted">
              In Miro oben rechts auf „Teilen“ und „Link kopieren“. Damit das Board hier angezeigt wird, muss es für alle mit dem Link oder für euer Team sichtbar sein.
            </span>
          </label>
        ) : (
          <div className="mt-4">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Vorlage</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-md border p-3 text-left transition-colors ${template === t.id ? "border-navy bg-navy/[0.04] ring-1 ring-navy" : "border-navy/12 hover:border-navy/40"}`}
                >
                  <div className="text-[13px] font-bold text-navy">{t.label}</div>
                  <div className="mt-1 text-[11.5px] leading-snug text-muted">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="mt-4 rounded-md bg-koralle/10 px-3 py-2 text-[12.5px] font-semibold text-[#b8402f]">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted hover:text-navy">
            Abbrechen
          </button>
          <button type="submit" disabled={busy || !title.trim()} className="rounded-md bg-koralle px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-white hover:brightness-95 disabled:opacity-50">
            {busy ? "Legt an …" : "Anlegen und öffnen"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProzessList() {
  const { canEdit } = useEditAccess();
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .list()
      .then((d) => !cancelled && setBoards(d.boards))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const startCreate = () => {
    if (!canEdit) {
      setHint("Zum Anlegen eines Prozesses bitte zuerst das Team-Passwort eingeben.");
      return;
    }
    setCreating(true);
  };

  return (
    <div className="min-h-screen bg-mist">
      <Header title="Prozesse & Customer Journeys" />
      <section className="bg-navy px-5 py-12 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-4">
          <div>
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">Gerlach Immobilien Gruppe · Intern</span>
            <h1 className="font-serif-display mt-3 text-[30px] text-white sm:text-[38px]">Prozesse & Customer Journeys</h1>
            <p className="mt-2 max-w-[600px] text-[13.5px] leading-relaxed text-fog">
              Alle Abläufe der Gruppe an einem Ort: Phasen, Schritte, Entscheidungen und Zuständigkeiten auf einem Board gestalten und gemeinsam pflegen.
            </p>
          </div>
          <button type="button" onClick={startCreate} className="rounded-md bg-gold px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-navy hover:brightness-95">
            + Neuer Prozess
          </button>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <EditBar hint={hint} />
          {error && <p className="mt-6 rounded-md bg-koralle/10 px-4 py-3 text-[13px] font-semibold text-[#b8402f]">{error}</p>}
          {boards === null && !error && <p className="mt-8 text-[13px] text-muted">Lädt …</p>}
          {boards && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((b) => (
                <Link key={b.id} to={`${BASE}/${b.id}`} className="block h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-md border border-navy/10 bg-white p-6 shadow-[0_2px_10px_rgba(20,26,70,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,26,70,0.14)]">
                    <h3 className="subheading text-[18px] text-navy">{b.title}</h3>
                    {b.description && <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">{b.description}</p>}
                    <div className="mt-auto flex flex-wrap gap-2 pt-5 text-[11px] font-bold text-navy">
                      {b.miroUrl ? (
                        <span className="rounded-[2px] bg-[#ffd02f]/40 px-2 py-1 text-[#4a3b00]">Miro-Board</span>
                      ) : (
                        <>
                          <span className="rounded-[2px] bg-navy/[0.06] px-2 py-1">{b.phases} Phasen</span>
                          <span className="rounded-[2px] bg-navy/[0.06] px-2 py-1">{b.elements} Elemente</span>
                        </>
                      )}
                    </div>
                    <div className="mt-3 text-[11px] text-muted">
                      Zuletzt geändert {fmtDateTime(b.updatedAt)}
                      {b.updatedBy ? ` von ${b.updatedBy}` : ""}
                    </div>
                    <div className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={startCreate}
                className="flex min-h-[180px] flex-col items-center justify-center rounded-md border-2 border-dashed border-navy/15 text-navy/60 transition-colors hover:border-koralle hover:text-koralle"
              >
                <span className="text-[30px] leading-none">+</span>
                <span className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em]">Neuer Prozess</span>
              </button>
            </div>
          )}
          {boards && boards.length === 0 && (
            <p className="mt-6 text-[13px] text-muted">Noch keine Prozesse gespeichert. Leg den ersten an, zum Beispiel mit der Vorlage „Customer Journey“.</p>
          )}
        </div>
      </section>
      {creating && <NewBoardDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

// ---------- one board ----------

type SaveState = { kind: "saved" | "dirty" | "saving" | "error" | "locked"; message?: string; at?: string };

const sameContent = (a: BoardContent, b: BoardContent) => JSON.stringify(a) === JSON.stringify(b);
const contentOf = (b: Board): BoardContent => ({
  title: b.title,
  description: b.description,
  nodes: b.nodes,
  edges: b.edges,
  miroUrl: b.miroUrl ?? "",
});

const fieldCls =
  "w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-[13px] text-navy placeholder:text-fog focus:border-navy focus:outline-none disabled:bg-mist disabled:text-ink";
const fieldLabel = "mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted";

/** A process that lives in Miro: the board embedded, plus name, description and link. */
function MiroView({
  content,
  canEdit,
  onChange,
  onBuildHere,
}: {
  content: BoardContent;
  canEdit: boolean;
  onChange: (content: BoardContent) => void;
  onBuildHere: () => void;
}) {
  const [link, setLink] = useState(content.miroUrl ?? "");
  const valid = miroBoardId(link) !== null;
  const embed = miroEmbedUrl(content.miroUrl ?? "");

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[460px] flex-1 bg-mist">
        {embed ? (
          <iframe
            key={embed}
            src={embed}
            title={`Miro-Board: ${content.title}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; clipboard-read; clipboard-write"
            allowFullScreen
          />
        ) : (
          <p className="p-8 text-[13px] text-muted">Kein gültiger Miro-Link hinterlegt.</p>
        )}
      </div>
      <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-navy/8 bg-white p-5 lg:w-[320px] lg:border-l lg:border-t-0">
        <a
          href={content.miroUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-[#ffd02f] px-4 py-2.5 text-center text-[12px] font-bold uppercase tracking-[0.06em] text-[#050038] hover:brightness-95"
        >
          In Miro öffnen ↗
        </a>
        <p className="text-[11.5px] leading-relaxed text-muted">
          Bearbeitet wird dieses Board direkt in Miro (auch über Teams). Wird es links nicht angezeigt, ist es in Miro nicht für alle mit dem Link freigegeben oder du bist nicht angemeldet: dann über den Button öffnen.
        </p>
        <label>
          <span className={fieldLabel}>Name des Prozesses</span>
          <input
            className={fieldCls}
            value={content.title}
            disabled={!canEdit}
            maxLength={120}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
          />
        </label>
        <label>
          <span className={fieldLabel}>Kurzbeschreibung</span>
          <textarea
            className={`${fieldCls} min-h-[90px] resize-y`}
            value={content.description}
            disabled={!canEdit}
            maxLength={1000}
            placeholder={canEdit ? "Wofür ist dieser Prozess, wer arbeitet damit?" : ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
          />
        </label>
        {canEdit && (
          <>
            <label>
              <span className={fieldLabel}>Link zum Miro-Board</span>
              <input
                type="url"
                className={fieldCls}
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  if (miroBoardId(e.target.value)) onChange({ ...content, miroUrl: e.target.value.trim() });
                }}
              />
              {!valid && <span className="mt-1 block text-[11.5px] font-semibold text-[#b8402f]">Kein gültiger Miro-Board-Link, die Änderung wird nicht gespeichert.</span>}
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Den Miro-Link entfernen und den Prozess stattdessen hier im Dashboard aufbauen?")) onBuildHere();
              }}
              className="self-start text-[11px] font-bold uppercase tracking-[0.06em] text-muted hover:text-navy"
            >
              Stattdessen hier gestalten
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

function BoardPage({ id }: { id: string }) {
  const { canEdit } = useEditAccess();
  const [author] = useAuthorName();
  const [board, setBoard] = useState<Board | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [save, setSave] = useState<SaveState>({ kind: "saved" });
  const [conflict, setConflict] = useState<Board | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  // What the editor or Miro view starts from, and the current content for the Miro view.
  const [initial, setInitial] = useState<BoardContent | null>(null);
  const [current, setCurrent] = useState<BoardContent | null>(null);

  const latest = useRef<BoardContent | null>(null);
  const version = useRef(0);
  const saving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedContent = useRef<BoardContent | null>(null);
  // Lets flush schedule a retry of itself.
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const authorRef = useRef(author);
  useEffect(() => {
    authorRef.current = author;
  }, [author]);

  const load = useCallback(async () => {
    try {
      const { board: b } = await api.get(id);
      setBoard(b);
      setTitle(b.title);
      version.current = b.version;
      latest.current = contentOf(b);
      savedContent.current = contentOf(b);
      setInitial(contentOf(b));
      setCurrent(contentOf(b));
      setEditorKey((k) => k + 1);
      setSave({ kind: "saved", at: b.updatedAt });
      setConflict(null);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const content = latest.current;
    if (!content || saving.current || (savedContent.current && sameContent(content, savedContent.current))) return;
    if (!content.title.trim()) {
      setSave({ kind: "error", message: "Der Prozess braucht einen Namen, sonst wird nicht gespeichert." });
      return;
    }
    saving.current = true;
    setSave({ kind: "saving" });
    try {
      const { board: b } = await api.save(id, version.current, content, authorRef.current);
      version.current = b.version;
      savedContent.current = content;
      saving.current = false;
      if (latest.current && !sameContent(latest.current, content)) {
        setSave({ kind: "dirty" });
        timer.current = setTimeout(() => void flushRef.current(), 400);
      } else {
        setSave({ kind: "saved", at: b.updatedAt });
      }
    } catch (e) {
      saving.current = false;
      if (e instanceof ConflictError) {
        setConflict(e.board);
        setSave({ kind: "error", message: "Nicht gespeichert: Konflikt mit einer neueren Version." });
      } else if (e instanceof LockedError) {
        setSave({ kind: "locked", message: e.message });
      } else {
        setSave({ kind: "error", message: (e as Error).message });
        timer.current = setTimeout(() => void flushRef.current(), 5000);
      }
    }
  }, [id]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const onChange = useCallback(
    (content: BoardContent) => {
      latest.current = content;
      setCurrent(content);
      setTitle(content.title);
      setSave((s) => (s.kind === "saving" ? s : { kind: "dirty" }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1000);
    },
    [flush],
  );

  // Unlocking after edits were made in between saves them.
  useEffect(() => {
    if (!canEdit || save.kind !== "locked") return;
    const t = setTimeout(() => void flush(), 0);
    return () => clearTimeout(t);
  }, [canEdit, flush, save.kind]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (latest.current && savedContent.current && !sameContent(latest.current, savedContent.current)) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  // In view mode, pick up colleagues' changes every 30 s.
  useEffect(() => {
    if (canEdit) return;
    const t = setInterval(async () => {
      try {
        const { board: b } = await api.get(id);
        if (b.version !== version.current) void load();
      } catch {
        // Keep showing what we have.
      }
    }, 30_000);
    return () => clearInterval(t);
  }, [canEdit, id, load]);

  const overwrite = async () => {
    if (!conflict) return;
    version.current = conflict.version;
    setConflict(null);
    await flush();
  };

  const remove = async () => {
    if (!board || !window.confirm(`„${title}“ wirklich löschen? Der Prozess verschwindet für alle.`)) return;
    try {
      await api.remove(board.id, authorRef.current);
      savedContent.current = latest.current;
      navigate(BASE);
    } catch (e) {
      setSave({ kind: "error", message: (e as Error).message });
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-mist">
        <Header title="Prozesse & Customer Journeys" />
        <div className="mx-auto max-w-[700px] px-5 py-16 text-center">
          <p className="text-[15px] font-bold text-navy">{loadError}</p>
          <Link to={BASE} className="mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.08em] text-koralle">
            ← Alle Prozesse
          </Link>
        </div>
      </div>
    );
  }

  const status =
    save.kind === "saving"
      ? { text: "Speichert …", cls: "text-muted" }
      : save.kind === "dirty"
        ? { text: "Ungespeicherte Änderungen", cls: "text-[#7a5f1c]" }
        : save.kind === "saved"
          ? { text: save.at ? `Gespeichert · ${fmtDateTime(save.at)}` : "Gespeichert", cls: "text-[#1f6a46]" }
          : { text: save.message ?? "Fehler", cls: "text-[#b8402f]" };

  return (
    <div className="flex h-screen flex-col bg-mist">
      <Header title={title || "Prozess"}>
        {board && <span className={`hidden text-[11.5px] font-semibold md:inline ${status.cls}`}>{status.text}</span>}
        {board && canEdit && (
          <button type="button" onClick={remove} className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted hover:text-koralle">
            Löschen
          </button>
        )}
      </Header>
      <div className="border-b border-navy/8 bg-white px-5 py-2.5 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2">
          <EditBar compact hint={hint} />
          <span className={`text-[11.5px] font-semibold md:hidden ${status.cls}`}>{status.text}</span>
          {conflict && (
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-koralle/40 bg-koralle/[0.07] px-4 py-2.5 text-[12.5px] text-ink">
              <span className="flex-1 basis-[300px]">
                <b className="text-navy">{conflict.updatedBy || "Jemand"}</b> hat diesen Prozess um {fmtDateTime(conflict.updatedAt)} geändert, während du bearbeitet hast.
              </span>
              <button type="button" onClick={() => void load()} className="rounded-md bg-navy px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                Neueste Version laden
              </button>
              <button type="button" onClick={() => void overwrite()} className="rounded-md border border-navy/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-navy">
                Meine Version speichern
              </button>
            </div>
          )}
        </div>
      </div>
      {board && initial && current?.miroUrl ? (
        <MiroView
          key={editorKey}
          content={current}
          canEdit={canEdit}
          onChange={onChange}
          onBuildHere={() => {
            const next = { ...current, miroUrl: "" };
            onChange(next);
            setInitial(next);
            setEditorKey((k) => k + 1);
          }}
        />
      ) : board && initial ? (
        <BoardEditor
          key={editorKey}
          initial={initial}
          canEdit={canEdit}
          onChange={onChange}
          onRequestEdit={() => setHint("Zum Bearbeiten bitte zuerst das Team-Passwort eingeben.")}
        />
      ) : (
        <p className="p-8 text-[13px] text-muted">Lädt …</p>
      )}
    </div>
  );
}

export function Prozesse() {
  const path = usePath();
  const id = path.startsWith(`${BASE}/`) ? decodeURIComponent(path.slice(BASE.length + 1)) : "";
  return id ? <BoardPage key={id} id={id} /> : <ProzessList />;
}
