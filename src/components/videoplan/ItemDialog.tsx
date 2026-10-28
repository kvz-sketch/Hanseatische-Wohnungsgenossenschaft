import { useEffect, useState } from "react";
import {
  AVAILABILITY_META,
  BRIEF_FIELDS,
  PRIORITY_META,
  STATUS_LABEL,
  api,
  cleanLink,
  datePart,
  timePart,
  toLocal,
  type Availability,
  type Item,
  type ItemDraft,
  type Priority,
  type Status,
} from "../../lib/videoplan";

// Create/edit dialog for one Videoplan entry: date & time, status, the full
// shooting brief and the links (Google Drive, YouTube, WeTransfer, …) for the approval round.

const inputCls =
  "w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-[13px] text-navy placeholder:text-fog focus:border-navy focus:outline-none";
const labelCls = "mb-1 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted";

export type DialogTarget = { item: Item } | { draft: ItemDraft };

export function ItemDialog({
  target,
  availability = [],
  readOnly = false,
  author,
  onAuthor,
  onClose,
  onSaved,
}: {
  target: DialogTarget;
  /** Cutter availability, to warn when a shoot lands on an editing day. */
  availability?: Availability[];
  /** View-only: the brief can be read but not changed (edit password not entered). */
  readOnly?: boolean;
  author: string;
  onAuthor: (name: string) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = "item" in target ? target.item : null;
  const init = existing ?? (target as { draft: ItemDraft }).draft;

  const [title, setTitle] = useState(init.title);
  // Categories are no longer chosen in the dialog; existing entries keep theirs.
  const category = init.category;
  const [priority, setPriority] = useState<Priority>(init.priority ?? "");
  const [status, setStatus] = useState<Status>(init.status);
  const [date, setDate] = useState(init.start ? datePart(init.start) : "");
  const [endDate, setEndDate] = useState(init.end ? datePart(init.end) : init.start ? datePart(init.start) : "");
  const [from, setFrom] = useState(init.start && !init.allDay ? timePart(init.start) : "09:00");
  const [to, setTo] = useState(init.end && !init.allDay ? timePart(init.end) : "12:00");
  const [allDay, setAllDay] = useState(init.allDay);
  const [brief, setBrief] = useState(init.brief);
  const [links, setLinks] = useState(init.links.length ? init.links : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function build(nextStatus: Status = status): ItemDraft | null {
    if (!title.trim()) {
      setError("Bitte einen Titel angeben.");
      return null;
    }
    let st = nextStatus;
    // Setting a date on an unplanned brief puts it in the calendar; a planned one needs a date.
    if (date && st === "ungeplant") st = "geplant";
    if (!date && st === "geplant") st = "ungeplant";
    if (!allDay && date && to <= from) {
      setError("Das Ende muss nach dem Beginn liegen.");
      return null;
    }
    const cleanLinks = links.map(cleanLink).filter((l) => l.url);
    if ((st === "freigabe" || st === "freigegeben") && cleanLinks.length === 0) {
      setError("Für die Freigabe bitte mindestens einen Link hinzufügen.");
      return null;
    }
    if (cleanLinks.some((l) => !/^https?:\/\/\S+\.\S+/i.test(l.url))) {
      setError("Links müssen mit https:// beginnen.");
      return null;
    }
    return {
      title: title.trim(),
      category,
      priority,
      status: st,
      start: date ? (allDay ? toLocal(date, "00:00") : toLocal(date, from)) : null,
      end: date ? (allDay ? toLocal(endDate && endDate >= date ? endDate : date, "23:59") : toLocal(date, to)) : null,
      allDay,
      brief,
      links: cleanLinks,
      updatedBy: author.trim(),
    };
  }

  async function save(nextStatus?: Status) {
    setError(null);
    const draft = build(nextStatus);
    if (!draft) return;
    setBusy(true);
    try {
      if (existing) await api.update(existing.id, draft);
      else await api.create(draft);
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing) return;
    setBusy(true);
    try {
      await api.remove(existing.id, author.trim());
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // One-click moves along the pipeline (each also saves the current edits).
  const quickActions: { label: string; status: Status }[] = [];
  if (existing) {
    if (status === "ungeplant" || status === "geplant") quickActions.push({ label: "Gedreht → in den Schnitt", status: "schnitt" });
    if (status === "schnitt") quickActions.push({ label: "Zur Freigabe geben", status: "freigabe" });
    if (status === "freigabe") quickActions.push({ label: "Als freigegeben markieren", status: "freigegeben" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-deep/60 p-3 sm:p-8" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={existing ? "Eintrag bearbeiten" : "Neuer Eintrag"}
        className="w-full max-w-[760px] rounded-md bg-white shadow-[0_24px_60px_rgba(15,20,56,0.35)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4 sm:px-6">
          <span className="subheading text-[15px] text-navy">{existing ? "Eintrag & Briefing" : "Neuer Eintrag"}</span>
          <button type="button" onClick={onClose} className="text-[20px] leading-none text-muted hover:text-navy" aria-label="Schließen">
            ×
          </button>
        </div>

        <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-5 px-5 py-5 disabled:[&_input]:bg-mist/60 disabled:[&_select]:bg-mist/60 disabled:[&_textarea]:bg-mist/60 sm:px-6">
          <div>
            <label className={labelCls} htmlFor="vp-title">Titel</label>
            <input id="vp-title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Shoot Bergedorf: Außenaufnahmen" autoFocus />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="vp-prio">Priorität</label>
              <select id="vp-prio" className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="">Keine</option>
                {Object.entries(PRIORITY_META).map(([k, p]) => (
                  <option key={k} value={k}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="vp-status">Status</label>
              <select id="vp-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                {Object.entries(STATUS_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="rounded-md border border-navy/10 bg-mist/40 p-4">
            <legend className="px-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Termin</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr_1fr]">
              <div>
                <label className={labelCls} htmlFor="vp-date">{allDay ? "Von" : "Datum"}</label>
                <input id="vp-date" type="date" min="2026-10-01" max="2026-12-31" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              {allDay ? (
                <div>
                  <label className={labelCls} htmlFor="vp-enddate">Bis</label>
                  <input id="vp-enddate" type="date" min={date || "2026-10-01"} max="2026-12-31" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelCls} htmlFor="vp-from">Von</label>
                    <input id="vp-from" type="time" step={900} className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="vp-to">Bis</label>
                    <input id="vp-to" type="time" step={900} className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            {(() => {
              // Days the Cutter has marked within the chosen date range.
              if (!date) return null;
              const last = allDay && endDate > date ? endDate : date;
              const marked = availability.filter((a) => a.day >= date && a.day <= last);
              const editing = marked.filter((a) => a.status === "schnitt");
              if (editing.length > 0) {
                return (
                  <p className="mt-3 rounded-md border border-koralle/40 bg-koralle/[0.08] px-3 py-2 text-[12px] font-semibold text-[#b8402f]">
                    ⚠ {editing.length === 1 ? "Dieser Tag ist" : `${editing.length} Tage sind`} als {AVAILABILITY_META.schnitt.label} eingetragen: {AVAILABILITY_META.schnitt.hint}.
                  </p>
                );
              }
              if (!allDay || last === date ? marked.some((a) => a.status === "verfuegbar") : false) {
                return <p className="mt-3 text-[12px] font-semibold text-[#1f6a46]">✓ Cutter ist an diesem Tag als verfügbar eingetragen.</p>;
              }
              return null;
            })()}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[12.5px] text-ink">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                Ganztägig
              </label>
              {date && !readOnly && (
                <button type="button" onClick={() => setDate("")} className="text-[11.5px] font-bold text-koralle hover:underline">
                  Termin entfernen (→ ungeplant)
                </button>
              )}
            </div>
          </fieldset>

          <div>
            <h4 className="subheading mb-3 text-[13px] uppercase tracking-[0.04em] text-navy">Shooting-Briefing</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BRIEF_FIELDS.map((f) => (
                <div key={f.key} className={f.rows > 2 ? "sm:col-span-2" : ""}>
                  <label className={labelCls} htmlFor={`vp-${f.key}`}>{f.label}</label>
                  {f.rows === 1 ? (
                    <input id={`vp-${f.key}`} className={inputCls} value={brief[f.key]} onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })} />
                  ) : (
                    <textarea id={`vp-${f.key}`} rows={f.rows} className={`${inputCls} resize-y`} value={brief[f.key]} onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="subheading mb-1 text-[13px] uppercase tracking-[0.04em] text-navy">Links</h4>
            <p className="mb-3 text-[11.5px] text-muted">
              Jeder Link ist möglich (Drive, YouTube, Vimeo, WeTransfer, Frame.io …). Vorschaubilder gibt es für Google Drive (Datei auf „Jeder mit dem Link“ freigeben) und YouTube.
            </p>
            <div className="flex flex-col gap-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inputCls} flex-[2]`} value={l.url} placeholder="https://…" onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                  <input className={`${inputCls} flex-1`} value={l.label} placeholder="Bezeichnung (optional)" onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="px-2 text-[18px] text-muted hover:text-koralle" aria-label="Link entfernen">
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setLinks([...links, { url: "", label: "" }])} className="self-start text-[11.5px] font-bold uppercase tracking-[0.06em] text-koralle hover:underline">
                + Link hinzufügen
              </button>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 border-t border-navy/10 bg-mist/40 px-5 py-4 sm:px-6">
          {readOnly && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12.5px] text-muted">🔒 Nur Ansicht. Zum Bearbeiten oben auf der Seite das Team-Passwort eingeben.</p>
              <button type="button" onClick={onClose} className="rounded-md bg-navy px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-white">
                Schließen
              </button>
            </div>
          )}
          {!readOnly && error && <p className="rounded-md bg-koralle/10 px-3 py-2 text-[12.5px] font-semibold text-[#b8402f]">{error}</p>}
          {!readOnly && (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full sm:w-56">
              <label className={labelCls} htmlFor="vp-author">Dein Name</label>
              <input id="vp-author" className={inputCls} value={author} onChange={(e) => onAuthor(e.target.value)} placeholder="für den Änderungsverlauf" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {existing && !confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)} className="px-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted hover:text-koralle">
                  Löschen
                </button>
              )}
              {confirmDelete && (
                <button type="button" disabled={busy} onClick={remove} className="rounded-md bg-koralle px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-white">
                  Wirklich löschen?
                </button>
              )}
              {quickActions.map((a) => (
                <button key={a.status} type="button" disabled={busy} onClick={() => save(a.status)} className="rounded-md border border-navy/25 bg-white px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-navy hover:border-navy">
                  {a.label}
                </button>
              ))}
              <button type="button" disabled={busy} onClick={() => save()} className="rounded-md bg-navy px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-white hover:bg-navy-light disabled:opacity-60">
                {busy ? "Speichert …" : "Speichern"}
              </button>
            </div>
          </div>
          )}
          {existing?.updatedBy && (
            <p className="text-[10.5px] text-fog">
              Zuletzt geändert von {existing.updatedBy} · {new Date(existing.updatedAt).toLocaleString("de-DE")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
