import type { LogoConfig } from "../data/brandbook";
import glyphData from "../data/logoGlyphs.json";

// Builds the logo lockups as pure vector paths, laid out after the Markenbuch PDF.
// Lettering comes pre-outlined from logoGlyphs.json (see scripts/build-logo-glyphs.mjs),
// so the result never depends on fonts installed on the viewer's device.
//
// All measures are in units of the roof width R = 1000.

type FontData = { capHeight: number; glyphs: Record<string, { adv: number; d: string }> };
const fonts = glyphData as { serif: FontData; sans: FontData };

const PAD = 60;
const NAMENSZUSATZ = "GERLACH IMMOBILIEN GRUPPE";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** A line of outlined text at a given cap height, optionally stretched to a target width by tracking. */
function measure(text: string, font: FontData, cap: number, targetWidth?: number) {
  const scale = cap / font.capHeight;
  const chars = [...text].map((ch) => font.glyphs[ch] ?? font.glyphs[" "]);
  const natural = chars.reduce((w, g) => w + g.adv * scale, 0);
  const tracking = targetWidth && chars.length > 1 ? (targetWidth - natural) / (chars.length - 1) : 0;
  return { scale, chars, tracking, width: natural + tracking * Math.max(0, chars.length - 1) };
}

function runSvg(
  run: ReturnType<typeof measure>,
  text: string,
  centerX: number,
  baseline: number,
  fill: (i: number) => string,
) {
  let x = centerX - run.width / 2;
  const parts = run.chars.map((g, i) => {
    const glyph = g.d
      ? `<path transform="translate(${x.toFixed(1)} ${baseline.toFixed(1)}) scale(${run.scale.toFixed(5)})" d="${g.d}" fill="${fill(i)}"/>`
      : "";
    x += g.adv * run.scale + run.tracking;
    return glyph;
  });
  return `<g aria-label="${esc(text)}">${parts.join("")}</g>`;
}

export type LogoRender = { svg: string; width: number; height: number };

export function buildLogoSvg(
  config: LogoConfig,
  opts: { fg: string; bg?: string | null } = { fg: "#141A46", bg: null },
): LogoRender {
  const { fg, bg } = opts;
  const isGig = config.id.startsWith("gig");

  // Dachmarke: steep 45° roof that encloses the top of "GIG". Submarken: flatter
  // roof sitting above the wordmark, which may run much wider than the roof.
  const roof = isGig ? { h: 500, stroke: 16 } : { h: 345, stroke: 20 };
  const apexY = PAD + roof.stroke;
  const feetY = apexY + roof.h;

  const lineCaps = config.lines.map((_, i) => {
    const first = isGig ? 272 : config.lines.length > 1 ? 250 : 127;
    return first * (config.lineScale?.[i] ?? 1);
  });
  const runs = config.lines.map((l, i) => measure(l, fonts.serif, lineCaps[i]));

  let top = isGig ? apexY + 395 : feetY + 105;
  const baselines = lineCaps.map((cap) => {
    const baseline = top + cap;
    top = baseline + 113;
    return baseline;
  });
  let bottom = baselines[baselines.length - 1];

  const tagline = config.tagline
    ? isGig
      ? measure(config.tagline, fonts.sans, 41, config.tagline === NAMENSZUSATZ ? 820 : undefined)
      : measure(config.tagline, fonts.sans, 54, config.tagline === NAMENSZUSATZ ? 1120 : undefined)
    : null;
  const taglineBaseline = tagline ? bottom + (isGig ? 140 : 100) + (isGig ? 41 : 54) : 0;
  if (tagline) bottom = taglineBaseline;

  const contentWidth = Math.max(1000, ...runs.map((r) => r.width), tagline?.width ?? 0);
  const width = Math.round(contentWidth + PAD * 2);
  const height = Math.round(bottom + PAD);
  const cx = width / 2;

  const accent = config.accent;
  const lines = runs.map((run, i) => {
    const line = config.lines[i];
    const from = accent && accent.line === i ? line.indexOf(accent.match) : -1;
    const fill = (c: number) =>
      from >= 0 && c >= from && c < from + accent!.match.length ? accent!.color : fg;
    return runSvg(run, line, cx, baselines[i], fill);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${Math.round(width / 2)}" height="${Math.round(height / 2)}">
${bg ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>` : ""}
<path d="M ${cx - 500} ${feetY} L ${cx} ${apexY} L ${cx + 500} ${feetY}" fill="none" stroke="${fg}" stroke-width="${roof.stroke}" stroke-linecap="square" stroke-linejoin="miter"/>
${lines.join("\n")}
${tagline ? runSvg(tagline, config.tagline!, cx, taglineBaseline, () => fg) : ""}
</svg>`;

  return { svg, width: Math.round(width / 2), height: Math.round(height / 2) };
}
