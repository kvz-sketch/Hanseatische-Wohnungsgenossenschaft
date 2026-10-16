import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { Calendar } from "../components/videoplan/Calendar";
import { ItemDialog, type DialogTarget } from "../components/videoplan/ItemDialog";
import {
  CATEGORY_META,
  STATUS_LABEL,
  api,
  driveFileId,
  driveThumbnail,
  emptyBrief,
  formatRange,
  isDriveFolder,
  toLocal,
  useAuthorName,
  useVideoplan,
  type Category,
  type DriveLink,
  type Feedback,
  type Item,
  type ItemDraft,
  type Status,
} from "../lib/videoplan";

const newDraft = (patch: Partial<ItemDraft> = {}): ItemDraft => ({
  title: "",
  status: "ungeplant",
  category: "shoot" as Category,
  start: null,
  end: null,
  allDay: false,
  brief: emptyBrief(),
  links: [],
  ...patch,
});

function Section({
  title,
  hint,
  count,
  action,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-navy/10 pb-2">
        <div>
          <h2 className="subheading text-[18px] text-navy">
            {title} <span className="ml-1 text-[13px] text-fog">{count}</span>
          </h2>
          <p className="mt-0.5 text-[12px] text-muted">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-navy/15 bg-white/60 px-5 py-8 text-center text-[12.5px] text-muted">{children}</div>;
}

function BriefCard({ item, onOpen, footer }: { item: Item; onOpen: (i: Item) => void; footer?: ReactNode }) {
  const c = CATEGORY_META[item.category];
  const summary = item.brief.ziel || item.brief.botschaft || item.brief.shotlist || item.brief.notizen;
  return (
    <div className={`flex flex-col rounded-md border border-navy/8 border-l-[3px] bg-white ${c.border}`}>
      <button type="button" onClick={() => onOpen(item)} className="flex flex-1 flex-col gap-2 p-4 text-left hover:bg-mist/40">
        <div className="flex items-center gap-2">
          <span className={`rounded-[2px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${c.bg} ${c.text}`}>{c.label}</span>
          <span className="text-[10.5px] font-semibold text-muted">{formatRange(item)}</span>
        </div>
        <div className="subheading text-[14px] text-navy">{item.title}</div>
        {item.brief.projekt && <div className="text-[11.5px] font-semibold text-ink">{item.brief.projekt}</div>}
        {item.brief.location && <div className="text-[11.5px] text-muted">📍 {item.brief.location}</div>}
        {summary && <p className="line-clamp-3 whitespace-pre-line text-[12px] leading-relaxed text-muted">{summary}</p>}
        <span className="mt-auto pt-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-koralle">Briefing öffnen →</span>
      </button>
      {footer && <div className="border-t border-navy/8 px-4 py-2.5">{footer}</div>}
    </div>
  );
}

function StatusMove({ item, to, label, author, onDone }: { item: Item; to: Status; label: string; author: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await api.update(item.id, { status: to, updatedBy: author });
            onDone();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy hover:text-koralle disabled:opacity-50"
      >
        {busy ? "…" : label}
      </button>
      {error && <span className="text-[11px] text-[#b8402f]">{error}</span>}
    </div>
  );
}

function Thumb({ link }: { link: DriveLink }) {
  const id = driveFileId(link.url);
  const [failed, setFailed] = useState(false);
  const folder = isDriveFolder(link.url);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-video overflow-hidden rounded-[4px] border border-navy/10 bg-mist"
      title={link.label || link.url}
    >
      {id && !failed ? (
        <img
          src={driveThumbnail(id)}
          alt={link.label || "Vorschau"}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center">
          <span className="text-[26px]" aria-hidden="true">{folder ? "📁" : "🎬"}</span>
          <span className="text-[10.5px] font-semibold text-muted">
            {folder ? "Drive-Ordner öffnen" : "Keine Vorschau — Datei in Drive per Link freigeben"}
          </span>
        </div>
      )}
      <span className="absolute bottom-1.5 right-1.5 rounded-[2px] bg-navy/85 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-white">
        In Drive öffnen ↗
      </span>
      {link.label && (
        <span className="absolute left-1.5 top-1.5 max-w-[80%] truncate rounded-[2px] bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-navy">{link.label}</span>
      )}
    </a>
  );
}

function FeedbackThread({
  item,
  feedback,
  author,
  onAuthor,
  onDone,
}: {
  item: Item;
  feedback: Feedback[];
  author: string;
  onAuthor: (n: string) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mine = feedback.filter((f) => f.itemId === item.id);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) {
      setError("Bitte Name und Feedback eintragen.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.feedback(item.id, author.trim(), text.trim());
      setText("");
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Feedback ({mine.length})</div>
      {mine.length > 0 && (
        <ul className="flex flex-col gap-2">
          {mine.map((f) => (
            <li key={f.id} className="rounded-md bg-mist px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-bold text-navy">{f.author}</span>
                <span className="text-[10px] text-fog">{new Date(f.createdAt).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-line text-[12.5px] leading-relaxed text-ink">{f.text}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          value={author}
          onChange={(e) => onAuthor(e.target.value)}
          placeholder="Dein Name"
          className="rounded-md border border-navy/15 px-3 py-1.5 text-[12.5px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Feedback zu diesem Creative …"
          className="resize-y rounded-md border border-navy/15 px-3 py-1.5 text-[12.5px] text-navy placeholder:text-fog focus:border-navy focus:outline-none"
        />
        {error && <span className="text-[11.5px] text-[#b8402f]">{error}</span>}
        <button type="submit" disabled={busy} className="self-start rounded-md bg-koralle px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:bg-[#f2604f] disabled:opacity-60">
          {busy ? "Sendet …" : "Feedback senden"}
        </button>
      </form>
    </div>
  );
}

function ApprovalCard({
  item,
  feedback,
  author,
  onAuthor,
  onOpen,
  onDone,
}: {
  item: Item;
  feedback: Feedback[];
  author: string;
  onAuthor: (n: string) => void;
  onOpen: (i: Item) => void;
  onDone: () => void;
}) {
  const approved = item.status === "freigegeben";
  return (
    <div className="flex flex-col gap-4 rounded-md border border-navy/8 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="subheading text-[15px] text-navy">{item.title}</div>
          {item.brief.projekt && <div className="text-[11.5px] text-muted">{item.brief.projekt}</div>}
        </div>
        <span
          className={`rounded-[2px] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
            approved ? "bg-[#1f8a5a]/10 text-[#1f8a5a]" : "bg-gold/20 text-[#7a5f1c]"
          }`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </div>
      <div className={`grid gap-3 ${item.links.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {item.links.map((l, i) => (
          <Thumb key={`${l.url}-${i}`} link={l} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => onOpen(item)} className="text-[11px] font-bold uppercase tracking-[0.06em] text-koralle hover:underline">
          Briefing & Links bearbeiten
        </button>
        {!approved ? (
          <StatusMove item={item} to="freigegeben" label="✓ Freigeben" author={author} onDone={onDone} />
        ) : (
          <StatusMove item={item} to="freigabe" label="Freigabe zurücknehmen" author={author} onDone={onDone} />
        )}
      </div>
      <div className="border-t border-navy/8 pt-4">
        <FeedbackThread item={item} feedback={feedback} author={author} onAuthor={onAuthor} onDone={onDone} />
      </div>
    </div>
  );
}

export function VideoPlan() {
  const { items, feedback, error, loaded, reload } = useVideoplan();
  const [author, setAuthor] = useAuthorName();
  const [dialog, setDialog] = useState<DialogTarget | null>(null);
  const [showApproved, setShowApproved] = useState(false);

  const open = (item: Item) => setDialog({ item });
  const createAt = (date: string, hour?: number) =>
    setDialog({
      draft: newDraft({
        status: "geplant",
        start: toLocal(date, hour !== undefined ? `${String(hour).padStart(2, "0")}:00` : "09:00"),
        end: toLocal(date, hour !== undefined ? `${String(Math.min(hour + 2, 23)).padStart(2, "0")}:00` : "12:00"),
      }),
    });

  const byUpdated = (a: Item, b: Item) => b.updatedAt.localeCompare(a.updatedAt);
  const unscheduled = items.filter((i) => i.status === "ungeplant").sort(byUpdated);
  const inEdit = items.filter((i) => i.status === "schnitt").sort(byUpdated);
  const inApproval = items.filter((i) => i.status === "freigabe").sort(byUpdated);
  const approved = items.filter((i) => i.status === "freigegeben").sort(byUpdated);

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <RoofIcon color="#141A46" className="h-6 w-9" />
            <span className="subheading text-[13px] leading-none text-navy">Videoplan & Freigaben</span>
          </Link>
          <Link to="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle">
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="bg-navy px-5 py-12 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-4">
          <div>
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">Gerlach Immobilien Gruppe · Intern</span>
            <h1 className="font-serif-display mt-3 text-[30px] text-white sm:text-[38px]">Videoplan & Freigaben</h1>
            <p className="mt-2 max-w-[560px] text-[13.5px] leading-relaxed text-fog">
              Shoots planen, Briefings pflegen, Schnitte verfolgen und Creatives freigeben — Oktober bis Dezember 2026.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDialog({ draft: newDraft() })}
            className="rounded-[2px] bg-gold px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-gold-deep"
          >
            + Neues Briefing
          </button>
        </div>
      </section>

      <main className="px-5 py-10 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-12">
          {error && (
            <div className="rounded-md border border-koralle/30 bg-koralle/10 px-4 py-3 text-[12.5px] font-semibold text-[#b8402f]">
              Daten konnten nicht geladen werden: {error}
            </div>
          )}

          <Section title="Kalender" hint="Klick auf einen Tag oder eine Uhrzeit blockt einen Termin — Klick auf einen Eintrag öffnet das Briefing." count={items.filter((i) => i.start).length}>
            <Calendar items={items} onOpen={open} onCreate={createAt} />
          </Section>

          <Section
            title="Ungeplante Shoots"
            hint="Briefings ohne Termin. Sobald ein Datum eingetragen ist, erscheint der Shoot im Kalender."
            count={unscheduled.length}
            action={
              <button type="button" onClick={() => setDialog({ draft: newDraft() })} className="text-[11px] font-bold uppercase tracking-[0.06em] text-koralle hover:underline">
                + Briefing ohne Termin
              </button>
            }
          >
            {!loaded ? (
              <Empty>Lädt …</Empty>
            ) : unscheduled.length === 0 ? (
              <Empty>Keine ungeplanten Shoots.</Empty>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unscheduled.map((i) => (
                  <BriefCard key={i.id} item={i} onOpen={open} footer={<StatusMove item={i} to="schnitt" label="Gedreht → in den Schnitt" author={author} onDone={reload} />} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Shoots im Schnitt" hint="Gedrehte Shoots in der Postproduktion. Für die Freigabe Drive-Link im Briefing hinterlegen." count={inEdit.length}>
            {inEdit.length === 0 ? (
              <Empty>Aktuell ist nichts im Schnitt. Ein Shoot landet hier, sobald er als „gedreht“ markiert wird.</Empty>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inEdit.map((i) => (
                  <BriefCard
                    key={i.id}
                    item={i}
                    onOpen={open}
                    footer={
                      i.links.length ? (
                        <StatusMove item={i} to="freigabe" label="Zur Freigabe geben →" author={author} onDone={reload} />
                      ) : (
                        <button type="button" onClick={() => open(i)} className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy hover:text-koralle">
                          Drive-Link hinzufügen & zur Freigabe →
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Creatives in Freigabe"
            hint="Vorschau anklicken öffnet die Datei in Google Drive. Feedback kann jede:r hinterlassen."
            count={inApproval.length}
            action={
              <button
                type="button"
                onClick={() => setDialog({ draft: newDraft({ status: "freigabe", category: "creative", links: [{ url: "", label: "" }] }) })}
                className="text-[11px] font-bold uppercase tracking-[0.06em] text-koralle hover:underline"
              >
                + Creative zur Freigabe
              </button>
            }
          >
            {inApproval.length === 0 ? (
              <Empty>Keine offenen Freigaben.</Empty>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {inApproval.map((i) => (
                  <ApprovalCard key={i.id} item={i} feedback={feedback} author={author} onAuthor={setAuthor} onOpen={open} onDone={reload} />
                ))}
              </div>
            )}
            {approved.length > 0 && (
              <div className="flex flex-col gap-4">
                <button type="button" onClick={() => setShowApproved((v) => !v)} className="self-start text-[11px] font-bold uppercase tracking-[0.06em] text-muted hover:text-navy">
                  {showApproved ? "▾" : "▸"} Freigegeben ({approved.length})
                </button>
                {showApproved && (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {approved.map((i) => (
                      <ApprovalCard key={i.id} item={i} feedback={feedback} author={author} onAuthor={setAuthor} onOpen={open} onDone={reload} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </main>

      <footer className="border-t border-navy/8 px-5 py-8 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-3 text-[11.5px] text-muted sm:flex-row sm:items-center">
          <span>Videoplan & Freigaben — Gerlach Immobilien Gruppe</span>
          <Link to="/dashboard" className="font-bold uppercase tracking-[0.08em] text-navy hover:text-koralle">
            ← Zurück zum Dashboard
          </Link>
        </div>
      </footer>

      {dialog && <ItemDialog target={dialog} author={author} onAuthor={setAuthor} onClose={() => setDialog(null)} onSaved={reload} />}
    </div>
  );
}
