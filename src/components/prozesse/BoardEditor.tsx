import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  COLORS,
  NODE_TYPES,
  newElementId,
  typeMeta,
  type BoardContent,
  type BoardEdge,
  type BoardNode,
  type NodeColor,
  type NodeType,
} from "../../lib/prozesse";

// Miro-style board: an endless canvas with phases, steps, decisions, notes,
// text and frames, joined by arrows. The editor owns the content and the undo
// history; the page around it only saves what onChange reports.

type View = { x: number; y: number; zoom: number };
type Pt = { x: number; y: number };
type Side = "top" | "right" | "bottom" | "left";

type Drag =
  | { kind: "pan"; start: Pt; view: View }
  | { kind: "move"; ids: string[]; start: Pt; origin: Map<string, Pt>; before: BoardContent; moved: boolean }
  | { kind: "resize"; id: string; start: Pt; w: number; h: number; before: BoardContent }
  | { kind: "connect"; from: string; side: Side }
  | { kind: "marquee"; start: Pt };

const GRID = 10;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2.5;
const snap = (v: number, on: boolean) => (on ? Math.round(v / GRID) * GRID : Math.round(v));
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

// ---------- geometry ----------

const center = (n: BoardNode): Pt => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

/** Side of `n` facing the point `p`, scaled by the box's proportions. */
function facing(n: BoardNode, p: Pt): Side {
  const c = center(n);
  const dx = (p.x - c.x) / (n.w / 2);
  const dy = (p.y - c.y) / (n.h / 2);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}

function sidePoint(n: BoardNode, side: Side): Pt {
  if (side === "left") return { x: n.x, y: n.y + n.h / 2 };
  if (side === "right") return { x: n.x + n.w, y: n.y + n.h / 2 };
  if (side === "top") return { x: n.x + n.w / 2, y: n.y };
  return { x: n.x + n.w / 2, y: n.y + n.h };
}

const DIR: Record<Side, Pt> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 } };

/** Cubic curve leaving `a` and entering `b` at right angles to their sides. */
function curve(a: Pt, sa: Side, b: Pt, sb: Side | null) {
  const k = Math.max(40, Math.hypot(b.x - a.x, b.y - a.y) * 0.4);
  const c1 = { x: a.x + DIR[sa].x * k, y: a.y + DIR[sa].y * k };
  const c2 = sb ? { x: b.x + DIR[sb].x * k, y: b.y + DIR[sb].y * k } : b;
  const mid = {
    x: (a.x + 3 * c1.x + 3 * c2.x + b.x) / 8,
    y: (a.y + 3 * c1.y + 3 * c2.y + b.y) / 8,
  };
  return { d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`, mid };
}

function edgePath(from: BoardNode, to: BoardNode) {
  const sa = facing(from, center(to));
  const sb = facing(to, center(from));
  return curve(sidePoint(from, sa), sa, sidePoint(to, sb), sb);
}

const inside = (n: BoardNode, f: BoardNode) => n.x >= f.x && n.y >= f.y && n.x + n.w <= f.x + f.w && n.y + n.h <= f.y + f.h;

// ---------- node rendering ----------

function NodeBody({ node, index }: { node: BoardNode; index: number | null }) {
  const c = COLORS[node.color];
  const text = node.text && <div className="mt-1.5 whitespace-pre-wrap break-words text-[12.5px] leading-[1.45] text-ink">{node.text}</div>;
  switch (node.type) {
    case "phase":
      return (
        <div className="flex h-full flex-col overflow-hidden rounded-md border bg-white shadow-[0_2px_10px_rgba(20,26,70,0.08)]" style={{ borderColor: c.strong }}>
          <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: c.strong, color: c.onStrong }}>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] opacity-80">Phase{index != null ? ` ${index}` : ""}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-2.5">
            <div className="break-words text-[15px] font-bold leading-snug text-navy">{node.title || "Ohne Titel"}</div>
            {text}
          </div>
        </div>
      );
    case "step":
      return (
        <div className="h-full overflow-hidden rounded-md border border-navy/10 bg-white px-3.5 py-2.5 shadow-[0_2px_8px_rgba(20,26,70,0.07)]" style={{ borderLeft: `4px solid ${c.strong}` }}>
          <div className="break-words text-[13.5px] font-bold leading-snug text-navy">{node.title || "Schritt"}</div>
          {text}
        </div>
      );
    case "decision":
      return (
        <div className="relative h-full">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,1 99,50 50,99 1,50" fill={c.soft} stroke={c.strong} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-[22%] text-center">
            <div className="break-words text-[13px] font-bold leading-snug text-navy">{node.title || "Entscheidung?"}</div>
            {node.text && <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink">{node.text}</div>}
          </div>
        </div>
      );
    case "note":
      return (
        <div className="h-full overflow-hidden rounded-[3px] px-3.5 py-3 shadow-[0_4px_12px_rgba(20,26,70,0.12)]" style={{ background: c.soft, borderTop: `3px solid ${c.strong}` }}>
          {node.title && <div className="break-words text-[13px] font-bold text-navy">{node.title}</div>}
          {node.text && <div className={`whitespace-pre-wrap break-words text-[12.5px] leading-[1.45] text-ink ${node.title ? "mt-1" : ""}`}>{node.text}</div>}
        </div>
      );
    case "text":
      return (
        <div className="h-full overflow-hidden">
          <div className="font-serif-display break-words text-[24px] leading-tight" style={{ color: c.strong === "#ddb851" ? "#9a7a1f" : c.strong }}>
            {node.title || "Text"}
          </div>
          {node.text && <div className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-snug text-muted">{node.text}</div>}
        </div>
      );
    case "frame":
      return (
        <div className="h-full rounded-lg border-2 border-dashed" style={{ borderColor: c.strong, background: `${c.soft}99` }}>
          <div className="px-4 pt-3">
            <div className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: c.strong === "#ddb851" ? "#9a7a1f" : c.strong }}>
              {node.title || "Bereich"}
            </div>
            {node.text && <div className="mt-0.5 max-w-[520px] whitespace-pre-wrap text-[12px] text-muted">{node.text}</div>}
          </div>
        </div>
      );
  }
}

// ---------- side panel ----------

const inputCls =
  "w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-[13px] text-navy placeholder:text-fog focus:border-navy focus:outline-none disabled:bg-mist disabled:text-ink";
const labelCls = "mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted";
const btnCls =
  "rounded-md border border-navy/15 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-navy hover:border-navy disabled:opacity-40";

function ColorPicker({ value, onChange }: { value: NodeColor | null; onChange: (c: NodeColor) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(COLORS) as NodeColor[]).map((k) => (
        <button
          key={k}
          type="button"
          title={COLORS[k].label}
          aria-label={COLORS[k].label}
          onClick={() => onChange(k)}
          className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${value === k ? "border-navy ring-2 ring-navy/20" : "border-white shadow-[0_0_0_1px_rgba(20,26,70,0.15)]"}`}
          style={{ background: COLORS[k].strong }}
        />
      ))}
    </div>
  );
}

// ---------- the editor ----------

export function BoardEditor({
  initial,
  canEdit,
  onChange,
  onRequestEdit,
}: {
  initial: BoardContent;
  canEdit: boolean;
  onChange: (content: BoardContent) => void;
  /** Called when a visitor in view mode tries to change something. */
  onRequestEdit: () => void;
}) {
  const [content, setContent] = useState(initial);
  const contentRef = useRef(content);
  const history = useRef<{ past: BoardContent[]; future: BoardContent[]; mergeKey: string | null; mergeAt: number }>({
    past: [],
    future: [],
    mergeKey: null,
    mergeAt: 0,
  });
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });
  const [view, setView] = useState<View>({ x: 40, y: 40, zoom: 1 });
  const viewRef = useRef(view);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ from: string; side: Side; to: Pt } | null>(null);
  const [marquee, setMarquee] = useState<{ a: Pt; b: Pt } | null>(null);
  const [focusTitle, setFocusTitle] = useState(0);
  const drag = useRef<Drag | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const spawnOffset = useRef(0);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  /** Applies a change; recorded for undo unless it continues the same edit (typing in one field). */
  const commit = useCallback(
    (next: BoardContent, opts: { record?: boolean; mergeKey?: string; before?: BoardContent } = {}) => {
      const h = history.current;
      const record = opts.record ?? true;
      if (record) {
        const now = Date.now();
        const merging = opts.mergeKey && h.mergeKey === opts.mergeKey && now - h.mergeAt < 1500;
        if (!merging) {
          h.past.push(opts.before ?? contentRef.current);
          if (h.past.length > 150) h.past.shift();
        }
        h.future = [];
        h.mergeKey = opts.mergeKey ?? null;
        h.mergeAt = now;
        setHistorySize({ past: h.past.length, future: h.future.length });
      }
      contentRef.current = next;
      setContent(next);
      onChange(next);
    },
    [onChange],
  );

  const undo = useCallback(() => {
    const h = history.current;
    const prev = h.past.pop();
    if (!prev) return;
    h.future.push(contentRef.current);
    h.mergeKey = null;
    contentRef.current = prev;
    setContent(prev);
    onChange(prev);
    setHistorySize({ past: h.past.length, future: h.future.length });
  }, [onChange]);

  const redo = useCallback(() => {
    const h = history.current;
    const next = h.future.pop();
    if (!next) return;
    h.past.push(contentRef.current);
    h.mergeKey = null;
    contentRef.current = next;
    setContent(next);
    onChange(next);
    setHistorySize({ past: h.past.length, future: h.future.length });
  }, [onChange]);

  const byId = useMemo(() => new Map(content.nodes.map((n) => [n.id, n])), [content.nodes]);

  /** Phase numbers in reading order (left to right, then top to bottom). */
  const phaseIndex = useMemo(() => {
    const phases = content.nodes.filter((n) => n.type === "phase").sort((a, b) => a.x - b.x || a.y - b.y);
    return new Map(phases.map((p, i) => [p.id, i + 1]));
  }, [content.nodes]);

  // ---------- coordinates ----------

  const toWorld = useCallback((clientX: number, clientY: number): Pt => {
    const r = viewport.current!.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (clientX - r.left - v.x) / v.zoom, y: (clientY - r.top - v.y) / v.zoom };
  }, []);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const r = viewport.current!.getBoundingClientRect();
    const sx = clientX != null ? clientX - r.left : r.width / 2;
    const sy = clientY != null ? clientY - r.top : r.height / 2;
    setView((v) => {
      const zoom = clampZoom(v.zoom * factor);
      const k = zoom / v.zoom;
      return { zoom, x: sx - (sx - v.x) * k, y: sy - (sy - v.y) * k };
    });
  }, []);

  const fit = useCallback(() => {
    const el = viewport.current;
    const nodes = contentRef.current.nodes;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (nodes.length === 0) {
      setView({ x: r.width / 2 - 200, y: r.height / 2 - 120, zoom: 1 });
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.w));
    const maxY = Math.max(...nodes.map((n) => n.y + n.h));
    const pad = 60;
    // Keep clear of the element toolbar on the left (narrower on phones).
    const left = r.width >= 640 ? 150 : 60;
    const zoom = clampZoom(Math.min((r.width - left - pad * 2) / (maxX - minX), (r.height - pad * 2) / (maxY - minY), 1.1));
    setView({
      zoom,
      x: left + (r.width - left - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (r.height - (maxY - minY) * zoom) / 2 - minY * zoom,
    });
  }, []);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  // Wheel: pinch or Ctrl/Cmd + wheel zooms, plain wheel / two-finger scroll pans.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      } else {
        const scale = e.deltaMode === 1 ? 16 : 1;
        setView((v) => ({ ...v, x: v.x - e.deltaX * scale, y: v.y - e.deltaY * scale }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // ---------- editing actions ----------

  const updateNodes = useCallback(
    (ids: string[], patch: Partial<BoardNode>, mergeKey?: string) => {
      const set = new Set(ids);
      const c = contentRef.current;
      commit({ ...c, nodes: c.nodes.map((n) => (set.has(n.id) ? { ...n, ...patch } : n)) }, { mergeKey });
    },
    [commit],
  );

  const addNode = useCallback(
    (type: NodeType, at?: Pt) => {
      if (!canEdit) return onRequestEdit();
      const meta = typeMeta(type);
      const el = viewport.current!.getBoundingClientRect();
      const v = viewRef.current;
      const off = (spawnOffset.current = (spawnOffset.current + 24) % 144);
      const p = at ?? { x: (el.width / 2 - v.x) / v.zoom - meta.w / 2 + off, y: (el.height / 2 - v.y) / v.zoom - meta.h / 2 + off };
      const n: BoardNode = {
        id: newElementId(),
        type,
        x: snap(p.x, true),
        y: snap(p.y, true),
        w: meta.w,
        h: meta.h,
        title: type === "note" || type === "frame" ? "" : meta.label,
        text: "",
        color: meta.color,
      };
      const c = contentRef.current;
      // Frames go to the back so they never cover the elements inside them.
      commit({ ...c, nodes: type === "frame" ? [n, ...c.nodes] : [...c.nodes, n] });
      setSelected([n.id]);
      setSelectedEdge(null);
      setFocusTitle((f) => f + 1);
    },
    [canEdit, commit, onRequestEdit],
  );

  const deleteSelection = useCallback(() => {
    const c = contentRef.current;
    if (selectedEdge) {
      commit({ ...c, edges: c.edges.filter((e) => e.id !== selectedEdge) });
      setSelectedEdge(null);
      return;
    }
    if (selected.length === 0) return;
    const set = new Set(selected);
    commit({ ...c, nodes: c.nodes.filter((n) => !set.has(n.id)), edges: c.edges.filter((e) => !set.has(e.from) && !set.has(e.to)) });
    setSelected([]);
  }, [commit, selected, selectedEdge]);

  const duplicateSelection = useCallback(() => {
    if (selected.length === 0) return;
    const c = contentRef.current;
    const set = new Set(selected);
    const ids = new Map<string, string>();
    const copies = c.nodes.filter((n) => set.has(n.id)).map((n) => {
      const id = newElementId();
      ids.set(n.id, id);
      return { ...n, id, x: n.x + 40, y: n.y + 40 };
    });
    const edgeCopies = c.edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e) => ({ ...e, id: newElementId(), from: ids.get(e.from)!, to: ids.get(e.to)! }));
    commit({ ...c, nodes: [...c.nodes, ...copies], edges: [...c.edges, ...edgeCopies] });
    setSelected(copies.map((n) => n.id));
  }, [commit, selected]);

  const updateEdge = useCallback(
    (id: string, patch: Partial<BoardEdge>, mergeKey?: string) => {
      const c = contentRef.current;
      commit({ ...c, edges: c.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) }, { mergeKey });
    },
    [commit],
  );

  // ---------- pointer interaction ----------

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (d.kind === "pan") {
        setView((v) => ({ ...v, x: d.view.x + e.clientX - d.start.x, y: d.view.y + e.clientY - d.start.y }));
        return;
      }
      const p = toWorld(e.clientX, e.clientY);
      const c = contentRef.current;
      const snapOn = !e.altKey;
      if (d.kind === "move") {
        const dx = p.x - d.start.x;
        const dy = p.y - d.start.y;
        if (!d.moved && Math.hypot(dx, dy) * viewRef.current.zoom < 3) return;
        d.moved = true;
        const next = {
          ...c,
          nodes: c.nodes.map((n) => {
            const o = d.origin.get(n.id);
            return o ? { ...n, x: snap(o.x + dx, snapOn), y: snap(o.y + dy, snapOn) } : n;
          }),
        };
        commit(next, { record: false });
      } else if (d.kind === "resize") {
        const node = c.nodes.find((n) => n.id === d.id);
        if (!node) return;
        const w = Math.max(60, snap(d.w + p.x - d.start.x, snapOn));
        const h = Math.max(40, snap(d.h + p.y - d.start.y, snapOn));
        commit({ ...c, nodes: c.nodes.map((n) => (n.id === d.id ? { ...n, w, h } : n)) }, { record: false });
      } else if (d.kind === "connect") {
        setConnecting({ from: d.from, side: d.side, to: p });
      } else if (d.kind === "marquee") {
        setMarquee({ a: d.start, b: p });
      }
    },
    [commit, toWorld],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const c = contentRef.current;
      if (d.kind === "move" && d.moved) {
        commit(c, { before: d.before });
      } else if (d.kind === "resize") {
        commit(c, { before: d.before });
      } else if (d.kind === "connect") {
        setConnecting(null);
        const target = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-node-id]");
        const to = target?.dataset.nodeId;
        if (to && to !== d.from && !c.edges.some((x) => x.from === d.from && x.to === to)) {
          const edge = { id: newElementId(), from: d.from, to, label: "" };
          commit({ ...c, edges: [...c.edges, edge] });
          setSelected([]);
          setSelectedEdge(edge.id);
        }
      } else if (d.kind === "marquee") {
        setMarquee(null);
        const p = toWorld(e.clientX, e.clientY);
        const box = { x: Math.min(d.start.x, p.x), y: Math.min(d.start.y, p.y), w: Math.abs(p.x - d.start.x), h: Math.abs(p.y - d.start.y) };
        const hit = c.nodes.filter((n) => n.x >= box.x && n.y >= box.y && n.x + n.w <= box.x + box.w && n.y + n.h <= box.y + box.h);
        setSelected(hit.map((n) => n.id));
        setSelectedEdge(null);
      }
    },
    [commit, toWorld],
  );

  // Window listeners stay the same functions for the whole drag and call the
  // latest handlers, so a re-render mid-drag can't leave a listener behind.
  const handlers = useRef({ move: onPointerMove, up: onPointerUp });
  useLayoutEffect(() => {
    handlers.current = { move: onPointerMove, up: onPointerUp };
  });
  const listeners = useMemo(() => {
    const move = (e: PointerEvent) => handlers.current.move(e);
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      handlers.current.up(e);
    };
    return { move, up };
  }, []);

  const startDrag = useCallback(
    (d: Drag) => {
      drag.current = d;
      window.addEventListener("pointermove", listeners.move);
      window.addEventListener("pointerup", listeners.up);
      window.addEventListener("pointercancel", listeners.up);
    },
    [listeners],
  );

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", listeners.move);
      window.removeEventListener("pointerup", listeners.up);
      window.removeEventListener("pointercancel", listeners.up);
    },
    [listeners],
  );

  const onBackgroundDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (canEdit && e.shiftKey && e.button === 0) {
      startDrag({ kind: "marquee", start: toWorld(e.clientX, e.clientY) });
      return;
    }
    setSelected([]);
    setSelectedEdge(null);
    startDrag({ kind: "pan", start: { x: e.clientX, y: e.clientY }, view: viewRef.current });
  };

  const onNodeDown = (e: ReactPointerEvent, node: BoardNode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedEdge(null);
    let ids = selected;
    if (e.shiftKey) {
      ids = selected.includes(node.id) ? selected.filter((i) => i !== node.id) : [...selected, node.id];
      setSelected(ids);
      return;
    }
    if (!selected.includes(node.id)) {
      ids = [node.id];
      setSelected(ids);
    }
    if (!canEdit) {
      startDrag({ kind: "pan", start: { x: e.clientX, y: e.clientY }, view: viewRef.current });
      return;
    }
    // Moving a frame takes the elements inside it along.
    const c = contentRef.current;
    const moving = new Set(ids);
    for (const f of c.nodes.filter((n) => moving.has(n.id) && n.type === "frame")) {
      for (const n of c.nodes) if (n.id !== f.id && inside(n, f)) moving.add(n.id);
    }
    const origin = new Map(c.nodes.filter((n) => moving.has(n.id)).map((n) => [n.id, { x: n.x, y: n.y }]));
    startDrag({ kind: "move", ids: [...moving], start: toWorld(e.clientX, e.clientY), origin, before: c, moved: false });
  };

  const onDoubleClick = (e: ReactMouseEvent) => {
    const nodeEl = (e.target as HTMLElement).closest<HTMLElement>("[data-node-id]");
    if (nodeEl) {
      setSelected([nodeEl.dataset.nodeId!]);
      if (!canEdit) return onRequestEdit();
      setFocusTitle((f) => f + 1);
      return;
    }
    if (!canEdit) return;
    const p = toWorld(e.clientX, e.clientY);
    const meta = typeMeta("step");
    addNode("step", { x: p.x - meta.w / 2, y: p.y - meta.h / 2 });
  };

  // ---------- keyboard ----------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Escape") {
        setSelected([]);
        setSelectedEdge(null);
        return;
      }
      if (!canEdit) return;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection();
      } else if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelected(contentRef.current.nodes.map((n) => n.id));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
      } else if (e.key.startsWith("Arrow") && selected.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 50 : GRID;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        const set = new Set(selected);
        const c = contentRef.current;
        commit({ ...c, nodes: c.nodes.map((n) => (set.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n)) }, { mergeKey: `nudge:${selected.join()}` });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canEdit, commit, deleteSelection, duplicateSelection, redo, selected, undo]);

  useEffect(() => {
    if (focusTitle > 0) {
      titleInput.current?.focus();
      titleInput.current?.select();
    }
  }, [focusTitle]);

  // ---------- render ----------

  const frames = content.nodes.filter((n) => n.type === "frame");
  const others = content.nodes.filter((n) => n.type !== "frame");
  const selNodes = content.nodes.filter((n) => selected.includes(n.id));
  const single = selNodes.length === 1 ? selNodes[0] : null;
  const edge = selectedEdge ? content.edges.find((e) => e.id === selectedEdge) ?? null : null;
  const connectFrom = connecting ? byId.get(connecting.from) : null;

  const renderNode = (n: BoardNode) => {
    const isSel = selected.includes(n.id);
    return (
      <div
        key={n.id}
        data-node-id={n.id}
        onPointerDown={(e) => onNodeDown(e, n)}
        className={`group absolute select-none ${canEdit ? "cursor-move" : "cursor-pointer"}`}
        style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
      >
        <NodeBody node={n} index={phaseIndex.get(n.id) ?? null} />
        {isSel && <div className="pointer-events-none absolute rounded-[9px] border-koralle" style={{ inset: -3 / view.zoom, borderWidth: 2 / view.zoom }} />}
        {canEdit && (
          <>
            {(["top", "right", "bottom", "left"] as Side[]).map((side) => {
              // Handles keep the same on-screen size at every zoom level.
              const size = 14 / view.zoom;
              const pos =
                side === "top"
                  ? { left: "50%", top: -size / 2, marginLeft: -size / 2 }
                  : side === "bottom"
                    ? { left: "50%", bottom: -size / 2, marginLeft: -size / 2 }
                    : side === "left"
                      ? { top: "50%", left: -size / 2, marginTop: -size / 2 }
                      : { top: "50%", right: -size / 2, marginTop: -size / 2 };
              return (
                <span
                  key={side}
                  title="Ziehen, um zu verbinden"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelected([n.id]);
                    setConnecting({ from: n.id, side, to: toWorld(e.clientX, e.clientY) });
                    startDrag({ kind: "connect", from: n.id, side });
                  }}
                  style={{ ...pos, width: size, height: size, borderWidth: 2 / view.zoom }}
                  className={`absolute z-10 cursor-crosshair rounded-full border-white bg-koralle shadow transition-opacity ${isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                />
              );
            })}
            {isSel && selected.length === 1 && (
              <span
                title="Größe ändern"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag({ kind: "resize", id: n.id, start: toWorld(e.clientX, e.clientY), w: n.w, h: n.h, before: contentRef.current });
                }}
                style={{ width: 12 / view.zoom, height: 12 / view.zoom, right: -6 / view.zoom, bottom: -6 / view.zoom, borderWidth: 2 / view.zoom }}
                className="absolute z-10 cursor-nwse-resize rounded-[2px] border-white bg-navy shadow"
              />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* canvas */}
      <div className="relative min-h-[460px] flex-1 overflow-hidden bg-mist">
        <div
          ref={viewport}
          onPointerDown={onBackgroundDown}
          onDoubleClick={onDoubleClick}
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(20,26,70,0.16) 1px, transparent 1.2px)",
            backgroundSize: `${24 * view.zoom}px ${24 * view.zoom}px`,
            backgroundPosition: `${view.x}px ${view.y}px`,
          }}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
            {frames.map(renderNode)}
            <svg className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-visible" aria-hidden="true">
              <defs>
                <marker id="pz-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#5a5f78" />
                </marker>
                <marker id="pz-arrow-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97768" />
                </marker>
              </defs>
              {content.edges.map((e) => {
                const a = byId.get(e.from);
                const b = byId.get(e.to);
                if (!a || !b) return null;
                const { d, mid } = edgePath(a, b);
                const sel = e.id === selectedEdge;
                const w = Math.max(28, e.label.length * 6.6 + 16);
                return (
                  <g key={e.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      className="cursor-pointer"
                      style={{ pointerEvents: "stroke" }}
                      onPointerDown={(ev) => {
                        ev.stopPropagation();
                        setSelected([]);
                        setSelectedEdge(e.id);
                      }}
                    />
                    <path d={d} fill="none" stroke={sel ? "#f97768" : "#5a5f78"} strokeWidth={sel ? 2.5 : 1.8} markerEnd={`url(#${sel ? "pz-arrow-sel" : "pz-arrow"})`} />
                    {e.label && (
                      <g
                        style={{ pointerEvents: "all" }}
                        className="cursor-pointer"
                        onPointerDown={(ev) => {
                          ev.stopPropagation();
                          setSelected([]);
                          setSelectedEdge(e.id);
                        }}
                      >
                        <rect x={mid.x - w / 2} y={mid.y - 11} width={w} height={22} rx={11} fill="white" stroke={sel ? "#f97768" : "#c3c6d6"} />
                        <text x={mid.x} y={mid.y + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#141a46">
                          {e.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {connectFrom && connecting && (
                <path
                  d={curve(sidePoint(connectFrom, connecting.side), connecting.side, connecting.to, null).d}
                  fill="none"
                  stroke="#f97768"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  markerEnd="url(#pz-arrow-sel)"
                />
              )}
            </svg>
            {others.map(renderNode)}
            {marquee && (
              <div
                className="pointer-events-none absolute border border-koralle bg-koralle/10"
                style={{
                  left: Math.min(marquee.a.x, marquee.b.x),
                  top: Math.min(marquee.a.y, marquee.b.y),
                  width: Math.abs(marquee.b.x - marquee.a.x),
                  height: Math.abs(marquee.b.y - marquee.a.y),
                }}
              />
            )}
          </div>
        </div>

        {/* element toolbar */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-lg border border-navy/10 bg-white p-1.5 shadow-[0_6px_20px_rgba(20,26,70,0.12)]">
          {NODE_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => addNode(t.type)}
              title={`${t.label}: ${t.hint}`}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-navy hover:bg-navy/[0.06] disabled:opacity-40"
            >
              <span className="h-3 w-3 shrink-0 rounded-[2px]" style={{ background: COLORS[t.color].strong, borderRadius: t.type === "decision" ? 0 : undefined, transform: t.type === "decision" ? "rotate(45deg) scale(0.8)" : undefined }} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
          <div className="my-1 border-t border-navy/8" />
          <button type="button" onClick={undo} disabled={!canEdit || historySize.past === 0} title="Rückgängig (Strg+Z)" className="rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-navy hover:bg-navy/[0.06] disabled:opacity-30">
            ↶ <span className="hidden sm:inline">Zurück</span>
          </button>
          <button type="button" onClick={redo} disabled={!canEdit || historySize.future === 0} title="Wiederholen (Strg+Umschalt+Z)" className="rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-navy hover:bg-navy/[0.06] disabled:opacity-30">
            ↷ <span className="hidden sm:inline">Vor</span>
          </button>
        </div>

        {/* zoom */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-navy/10 bg-white p-1 text-[12px] font-bold text-navy shadow-[0_6px_20px_rgba(20,26,70,0.12)]">
          <button type="button" onClick={() => zoomAt(1 / 1.2)} className="h-8 w-8 rounded-md hover:bg-navy/[0.06]" aria-label="Verkleinern">−</button>
          <button type="button" onClick={() => setView((v) => ({ ...v, zoom: 1 }))} className="w-14 rounded-md py-1.5 hover:bg-navy/[0.06]" title="Auf 100 % setzen">
            {Math.round(view.zoom * 100)} %
          </button>
          <button type="button" onClick={() => zoomAt(1.2)} className="h-8 w-8 rounded-md hover:bg-navy/[0.06]" aria-label="Vergrößern">+</button>
          <button type="button" onClick={fit} className="rounded-md px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] hover:bg-navy/[0.06]">Einpassen</button>
        </div>

        {content.nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-[340px] rounded-md bg-white/90 px-6 py-5 text-center text-[13px] text-muted shadow">
              <div className="font-bold text-navy">Das Board ist noch leer.</div>
              {canEdit
                ? "Links eine Phase oder einen Schritt hinzufügen, oder doppelt auf die Fläche klicken."
                : "Zum Gestalten oben das Team-Passwort eingeben."}
            </div>
          </div>
        )}
      </div>

      {/* side panel */}
      <aside className="w-full shrink-0 overflow-y-auto border-t border-navy/8 bg-white p-5 lg:w-[320px] lg:border-l lg:border-t-0">
        {single ? (
          <div className="flex flex-col gap-4">
            <div>
              <span className={labelCls}>Element</span>
              <div className="flex flex-wrap gap-1">
                {NODE_TYPES.map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => updateNodes([single.id], { type: t.type })}
                    className={`rounded-[3px] px-2 py-1 text-[11px] font-bold ${single.type === t.type ? "bg-navy text-white" : "bg-navy/[0.06] text-navy hover:bg-navy/10"} disabled:cursor-default`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className={labelCls}>Titel</span>
              <input
                ref={titleInput}
                className={inputCls}
                value={single.title}
                disabled={!canEdit}
                maxLength={200}
                onChange={(e) => updateNodes([single.id], { title: e.target.value }, `title:${single.id}`)}
              />
            </label>
            <label>
              <span className={labelCls}>Beschreibung</span>
              <textarea
                className={`${inputCls} min-h-[160px] resize-y leading-relaxed`}
                value={single.text}
                disabled={!canEdit}
                maxLength={5000}
                placeholder={canEdit ? "Was passiert hier? Wer ist verantwortlich? Welche Tools, Fristen, Dokumente?" : ""}
                onChange={(e) => updateNodes([single.id], { text: e.target.value }, `text:${single.id}`)}
              />
            </label>
            {canEdit && (
              <>
                <div>
                  <span className={labelCls}>Farbe</span>
                  <ColorPicker value={single.color} onChange={(color) => updateNodes([single.id], { color })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnCls} onClick={duplicateSelection}>Duplizieren</button>
                  <button type="button" className={`${btnCls} text-koralle hover:border-koralle`} onClick={deleteSelection}>Löschen</button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted">
                  Zum Verbinden an einem der roten Punkte ziehen und auf einem anderen Element loslassen. Größe über das Quadrat unten rechts ändern.
                </p>
              </>
            )}
          </div>
        ) : selNodes.length > 1 ? (
          <div className="flex flex-col gap-4">
            <div className="text-[14px] font-bold text-navy">{selNodes.length} Elemente ausgewählt</div>
            {canEdit && (
              <>
                <div>
                  <span className={labelCls}>Farbe für alle</span>
                  <ColorPicker value={null} onChange={(color) => updateNodes(selected, { color })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnCls} onClick={duplicateSelection}>Duplizieren</button>
                  <button type="button" className={`${btnCls} text-koralle hover:border-koralle`} onClick={deleteSelection}>Löschen</button>
                </div>
              </>
            )}
          </div>
        ) : edge ? (
          <div className="flex flex-col gap-4">
            <div className="text-[14px] font-bold text-navy">Verbindung</div>
            <div className="text-[12px] text-muted">
              {byId.get(edge.from)?.title || "Element"} → {byId.get(edge.to)?.title || "Element"}
            </div>
            <label>
              <span className={labelCls}>Beschriftung</span>
              <input
                className={inputCls}
                value={edge.label}
                disabled={!canEdit}
                maxLength={120}
                placeholder={canEdit ? "z. B. ja, nein, nach 2 Tagen" : ""}
                onChange={(e) => updateEdge(edge.id, { label: e.target.value }, `label:${edge.id}`)}
              />
            </label>
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnCls} onClick={() => updateEdge(edge.id, { from: edge.to, to: edge.from })}>Richtung umkehren</button>
                <button type="button" className={`${btnCls} text-koralle hover:border-koralle`} onClick={deleteSelection}>Löschen</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label>
              <span className={labelCls}>Name des Prozesses</span>
              <input
                className={inputCls}
                value={content.title}
                disabled={!canEdit}
                maxLength={120}
                onChange={(e) => commit({ ...contentRef.current, title: e.target.value }, { mergeKey: "board-title" })}
              />
            </label>
            <label>
              <span className={labelCls}>Kurzbeschreibung</span>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={content.description}
                disabled={!canEdit}
                maxLength={1000}
                placeholder={canEdit ? "Wofür ist dieser Prozess, wer arbeitet damit?" : ""}
                onChange={(e) => commit({ ...contentRef.current, description: e.target.value }, { mergeKey: "board-desc" })}
              />
            </label>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Phasen", content.nodes.filter((n) => n.type === "phase").length],
                ["Elemente", content.nodes.length],
                ["Pfeile", content.edges.length],
              ].map(([l, v]) => (
                <div key={l} className="rounded-md bg-mist px-2 py-2.5">
                  <div className="text-[18px] font-bold text-navy">{v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">{l}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-navy/8 p-3.5 text-[11.5px] leading-relaxed text-muted">
              <div className="mb-1.5 font-bold text-navy">So funktioniert das Board</div>
              <ul className="flex list-disc flex-col gap-1 pl-4">
                <li>Fläche ziehen zum Verschieben, Strg + Mausrad oder Pinch zum Zoomen.</li>
                {canEdit ? (
                  <>
                    <li>Elemente links hinzufügen oder doppelt auf die Fläche klicken.</li>
                    <li>Element anklicken, um Titel, Beschreibung und Farbe zu bearbeiten.</li>
                    <li>Rote Punkte ziehen, um Elemente mit Pfeilen zu verbinden.</li>
                    <li>Umschalt + Ziehen wählt mehrere Elemente aus.</li>
                    <li>Strg+Z rückgängig, Strg+D duplizieren, Entf löschen, Pfeiltasten verschieben.</li>
                    <li>Ein Bereich nimmt beim Verschieben alles mit, was in ihm liegt.</li>
                  </>
                ) : (
                  <li>Element anklicken, um die Beschreibung zu lesen.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
