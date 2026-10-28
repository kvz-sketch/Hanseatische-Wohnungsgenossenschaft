import { useMemo, useState } from "react";
import {
  AVAILABILITY_META,
  CATEGORY_META,
  MONTHS,
  WEEKDAYS,
  datePart,
  parseLocal,
  timePart,
  ymd,
  type Availability,
  type AvailabilityStatus,
  type Item,
} from "../../lib/videoplan";

// Outlook-style calendar for the Videoplan, limited to Oct–Dec 2026:
// month view (overview) and week view (hourly slots to block shoot times).
// Clicking a free day/slot creates an entry there; clicking an entry opens it.
// The Cutter's availability is shown per day; in "Verfügbarkeit" mode a click
// on a day cycles it (verfügbar → Schnitt-Tag → nicht eingetragen) instead.

export const RANGE_START = new Date(2026, 9, 1);
export const RANGE_END = new Date(2026, 11, 31);

const HOUR_FROM = 6;
const HOUR_TO = 22;
const HOUR_PX = 44;

type View = "month" | "week";

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const inRange = (d: Date) => d >= RANGE_START && d <= RANGE_END;

function initialCursor() {
  const today = new Date();
  return inRange(today) ? today : RANGE_START;
}

/** Entries shown on a given calendar day (multi-day all-day entries appear on every day they cover). */
function itemsOnDay(items: Item[], day: string) {
  return items.filter((i) => {
    if (!i.start) return false;
    const s = datePart(i.start);
    const e = i.end ? datePart(i.end) : s;
    return i.allDay ? day >= s && day <= e : s === day;
  });
}

type AvailMap = Map<string, AvailabilityStatus>;

function AvailPill({ status, compact = false }: { status: AvailabilityStatus | undefined; compact?: boolean }) {
  if (!status) return null;
  const m = AVAILABILITY_META[status];
  return (
    <span
      title={`${m.label}: ${m.hint}`}
      className={`truncate rounded-[2px] px-1 py-px text-[9px] font-bold uppercase tracking-[0.04em] ${m.pill} ${compact ? "max-w-[64px] sm:max-w-none" : ""}`}
    >
      {m.short}
    </span>
  );
}

function Chip({ item, onOpen }: { item: Item; onOpen: (i: Item) => void }) {
  const c = CATEGORY_META[item.category];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(item);
      }}
      className={`block w-full truncate rounded-[3px] border-l-[3px] px-1.5 py-0.5 text-left text-[10.5px] font-semibold leading-tight ${c.bg} ${c.border} ${c.text} hover:brightness-95`}
      title={item.title}
    >
      {!item.allDay && item.start && <span className="mr-1 hidden font-bold sm:inline">{timePart(item.start)}</span>}
      {item.title}
    </button>
  );
}

function MonthView({
  cursor,
  items,
  avail,
  onOpen,
  onCreate,
}: {
  cursor: Date;
  items: Item[];
  avail: AvailMap;
  onOpen: (i: Item) => void;
  onCreate: (date: string, hour?: number) => void;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const days: Date[] = [];
  for (let d = mondayOf(first); d <= last || days.length % 7 !== 0; d = addDays(d, 1)) days.push(d);
  const today = ymd(new Date());

  return (
    <div className="overflow-hidden rounded-md border border-navy/10 bg-white">
      <div className="grid grid-cols-7 border-b border-navy/10 bg-mist/60">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = ymd(d);
          const outside = d.getMonth() !== cursor.getMonth();
          const dayItems = itemsOnDay(items, key).sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
          const shown = dayItems.slice(0, 3);
          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => inRange(d) && onCreate(key)}
              onKeyDown={(e) => e.key === "Enter" && inRange(d) && onCreate(key)}
              className={`group min-h-[96px] border-b border-r border-navy/8 p-1.5 text-left transition-colors sm:min-h-[112px] ${
                outside ? "bg-mist/50" : "bg-white hover:bg-gold/[0.06]"
              } ${inRange(d) ? "cursor-pointer" : "cursor-default"} ${!outside && avail.get(key) ? AVAILABILITY_META[avail.get(key)!].cell : ""}`}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-bold ${
                    key === today ? "bg-koralle text-white" : outside ? "text-fog" : "text-navy"
                  }`}
                >
                  {d.getDate()}
                </span>
                {!outside && avail.get(key) ? (
                  <AvailPill status={avail.get(key)} compact />
                ) : (
                  inRange(d) && (
                    <span className="text-[14px] font-bold text-koralle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
                      +
                    </span>
                  )
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {shown.map((i) => (
                  <Chip key={i.id} item={i} onOpen={onOpen} />
                ))}
                {dayItems.length > shown.length && (
                  <span className="px-1 text-[10px] font-bold text-muted">+{dayItems.length - shown.length} weitere</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Side-by-side columns for overlapping timed entries within one day. */
function layoutDay(dayItems: Item[]) {
  const sorted = [...dayItems].sort((a, b) => a.start!.localeCompare(b.start!));
  const out: { item: Item; col: number; cols: number }[] = [];
  let cluster: { item: Item; col: number; end: string }[] = [];
  let clusterEnd = "";
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.col + 1));
    cluster.forEach((c) => out.push({ item: c.item, col: c.col, cols }));
    cluster = [];
  };
  for (const item of sorted) {
    const end = item.end ?? item.start!;
    if (cluster.length && item.start! >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => c.end > item.start!).map((c) => c.col));
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ item, col, end });
    clusterEnd = cluster.length === 1 ? end : end > clusterEnd ? end : clusterEnd;
  }
  flush();
  return out;
}

function WeekView({
  cursor,
  items,
  avail,
  marking,
  onOpen,
  onCreate,
}: {
  cursor: Date;
  items: Item[];
  avail: AvailMap;
  marking: boolean;
  onOpen: (i: Item) => void;
  onCreate: (date: string, hour?: number) => void;
}) {
  const monday = mondayOf(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const hours = Array.from({ length: HOUR_TO - HOUR_FROM }, (_, i) => HOUR_FROM + i);
  const today = ymd(new Date());

  return (
    <div className="overflow-x-auto rounded-md border border-navy/10 bg-white">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-navy/10 bg-mist/60">
          <div />
          {days.map((d) => {
            const key = ymd(d);
            return (
              <button
                key={key}
                type="button"
                disabled={!marking || !inRange(d)}
                onClick={() => onCreate(key)}
                className={`border-l border-navy/8 px-2 py-2 text-left disabled:cursor-default ${avail.get(key) ? AVAILABILITY_META[avail.get(key)!].cell : ""} ${marking && inRange(d) ? "hover:bg-gold/[0.12]" : ""}`}
              >
                <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">{WEEKDAYS[(d.getDay() + 6) % 7]}</div>
                <div className={`text-[15px] font-bold ${key === today ? "text-koralle" : inRange(d) ? "text-navy" : "text-fog"}`}>
                  {d.getDate()}. {MONTHS[d.getMonth()].slice(0, 3)}
                </div>
                <div className="mt-1 min-h-[16px]">
                  <AvailPill status={avail.get(key)} />
                </div>
              </button>
            );
          })}
        </div>

        {/* All-day row */}
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-navy/10">
          <div className="px-1.5 py-1.5 text-[9.5px] font-bold uppercase leading-tight text-fog">Ganz&shy;tägig</div>
          {days.map((d) => {
            const key = ymd(d);
            const allDay = itemsOnDay(items, key).filter((i) => i.allDay);
            return (
              <div key={key} className="flex min-h-[30px] flex-col gap-0.5 border-l border-navy/8 p-1">
                {allDay.map((i) => (
                  <Chip key={i.id} item={i} onOpen={onOpen} />
                ))}
              </div>
            );
          })}
        </div>

        {/* Hour grid */}
        <div className="grid grid-cols-[52px_repeat(7,1fr)]">
          <div>
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="pr-1.5 pt-0.5 text-right text-[10px] font-semibold text-fog">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const key = ymd(d);
            const timed = layoutDay(itemsOnDay(items, key).filter((i) => !i.allDay));
            return (
              <div key={key} className={`relative border-l border-navy/8 ${avail.get(key) ? AVAILABILITY_META[avail.get(key)!].cell : ""}`}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    disabled={!inRange(d)}
                    onClick={() => onCreate(key, h)}
                    style={{ height: HOUR_PX }}
                    className="block w-full border-b border-navy/[0.06] hover:bg-gold/[0.08] disabled:cursor-default disabled:bg-mist/40 disabled:hover:bg-mist/40"
                    aria-label={`Termin am ${d.getDate()}. ${MONTHS[d.getMonth()]} um ${h}:00 anlegen`}
                  />
                ))}
                {timed.map(({ item, col, cols }) => {
                  const s = parseLocal(item.start!);
                  const e = item.end ? parseLocal(item.end) : new Date(s.getTime() + 60 * 60_000);
                  const fromMin = Math.max(0, (s.getHours() - HOUR_FROM) * 60 + s.getMinutes());
                  const toMin = Math.min((HOUR_TO - HOUR_FROM) * 60, (e.getHours() - HOUR_FROM) * 60 + e.getMinutes());
                  const c = CATEGORY_META[item.category];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onOpen(item)}
                      className={`absolute overflow-hidden rounded-[3px] border-l-[3px] px-1.5 py-1 text-left text-[10.5px] leading-tight shadow-[0_1px_3px_rgba(20,26,70,0.12)] ${c.bg} ${c.border} ${c.text} backdrop-blur-[1px] hover:brightness-95`}
                      style={{
                        top: (fromMin / 60) * HOUR_PX,
                        height: Math.max(22, ((toMin - fromMin) / 60) * HOUR_PX - 2),
                        left: `calc(${(col / cols) * 100}% + 2px)`,
                        width: `calc(${100 / cols}% - 4px)`,
                      }}
                      title={item.title}
                    >
                      <div className="font-bold">
                        {timePart(item.start!)}
                        {item.end ? ` bis ${timePart(item.end)}` : ""}
                      </div>
                      <div className="font-semibold">{item.title}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Calendar({
  items,
  availability,
  canMark,
  onOpen,
  onCreate,
  onMark,
  onRequestEdit,
}: {
  items: Item[];
  availability: Availability[];
  /** Whether this visitor may mark availability (edit password entered). */
  canMark: boolean;
  onOpen: (i: Item) => void;
  onCreate: (date: string, hour?: number) => void;
  /** Cycles the Cutter's availability for one day. */
  onMark: (date: string) => void;
  onRequestEdit: () => void;
}) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(initialCursor);
  const [marking, setMarking] = useState(false);
  const scheduled = useMemo(() => items.filter((i) => i.start), [items]);
  const avail = useMemo<AvailMap>(() => new Map(availability.map((a) => [a.day, a.status])), [availability]);
  const markOn = marking && canMark;
  // In marking mode a click on a day (or hour slot) marks it instead of creating an entry.
  const onDay = (date: string, hour?: number) => (markOn ? onMark(date) : onCreate(date, hour));

  const step = (dir: 1 | -1) => {
    const next =
      view === "month"
        ? new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1)
        : addDays(mondayOf(cursor), 7 * dir);
    const probe = view === "month" ? next : dir === 1 ? next : addDays(next, 6);
    if (probe >= new Date(RANGE_START.getFullYear(), RANGE_START.getMonth(), 1) && probe <= RANGE_END) setCursor(next);
  };
  const canPrev =
    view === "month" ? cursor.getMonth() > RANGE_START.getMonth() || cursor.getFullYear() > RANGE_START.getFullYear() : mondayOf(cursor) > RANGE_START;
  const canNext = view === "month" ? cursor.getMonth() < RANGE_END.getMonth() : addDays(mondayOf(cursor), 7) <= RANGE_END;

  const title =
    view === "month"
      ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
      : (() => {
          const m = mondayOf(cursor);
          const s = addDays(m, 6);
          return `${m.getDate()}. ${MONTHS[m.getMonth()].slice(0, 3)} bis ${s.getDate()}. ${MONTHS[s.getMonth()].slice(0, 3)} ${s.getFullYear()}`;
        })();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canPrev}
            className="h-8 w-8 rounded-md border border-navy/15 bg-white text-[15px] font-bold text-navy disabled:opacity-30"
            aria-label="Zurück"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canNext}
            className="h-8 w-8 rounded-md border border-navy/15 bg-white text-[15px] font-bold text-navy disabled:opacity-30"
            aria-label="Weiter"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setCursor(initialCursor())}
            className="rounded-md border border-navy/15 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-navy"
          >
            Heute
          </button>
          <h3 className="subheading ml-1 text-[16px] text-navy">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => (canMark ? setMarking((m) => !m) : onRequestEdit())}
          className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${
            markOn ? "border-[#1f8a5a] bg-[#1f8a5a] text-white" : "border-navy/15 bg-white text-navy hover:border-navy"
          }`}
        >
          {markOn ? "✓ Fertig" : "Verfügbarkeit Cutter"}
        </button>
        <div className="flex rounded-md border border-navy/15 bg-white p-0.5">
          {(["month", "week"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-[4px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${
                view === v ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              {v === "month" ? "Monat" : "Woche"}
            </button>
          ))}
        </div>
        </div>
      </div>
      {markOn && (
        <div className="rounded-md border border-[#1f8a5a]/30 bg-[#1f8a5a]/[0.07] px-4 py-2.5 text-[12.5px] text-[#1f6a46]">
          <b>Verfügbarkeit eintragen:</b> Tag anklicken = Cutter verfügbar, nochmal = Schnitt-Tag (kein Dreh), nochmal = Eintrag entfernen. Mit „Fertig“ zurück zum normalen Kalender.
        </div>
      )}
      {view === "month" ? (
        <MonthView cursor={cursor} items={scheduled} avail={avail} onOpen={onOpen} onCreate={onDay} />
      ) : (
        <WeekView cursor={cursor} items={scheduled} avail={avail} marking={markOn} onOpen={onOpen} onCreate={onDay} />
      )}
      <div className="flex flex-wrap gap-4">
        {(Object.keys(AVAILABILITY_META) as AvailabilityStatus[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px] text-muted">
            <AvailPill status={k} />
            {AVAILABILITY_META[k].hint}
          </span>
        ))}
      </div>
    </div>
  );
}
