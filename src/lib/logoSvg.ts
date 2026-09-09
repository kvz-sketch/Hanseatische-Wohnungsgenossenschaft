import type { LogoConfig } from "../data/brandbook";

const VBW = 480;
const PAD_X = 44;
const MAX_TEXT_WIDTH = VBW - PAD_X * 2;
const SERIF_STACK = "'Times New Roman', Times, Georgia, serif";
const SANS_STACK = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const SERIF_CHAR_FACTOR = 0.6;
const SANS_TRACKED_CHAR_FACTOR = 0.62;

function estimateWidth(text: string, fontSize: number, factor: number, letterSpacingEm = 0) {
  return text.length * fontSize * factor + Math.max(0, text.length - 1) * letterSpacingEm * fontSize;
}

function fitFontSize(text: string, maxWidth: number, baseSize: number, factor: number, letterSpacingEm = 0) {
  const wAtBase = estimateWidth(text, baseSize, factor, letterSpacingEm);
  if (wAtBase <= maxWidth) return baseSize;
  return baseSize * (maxWidth / wAtBase);
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type LogoRender = { svg: string; width: number; height: number };

export function buildLogoSvg(
  config: LogoConfig,
  opts: { fg: string; bg?: string | null } = { fg: "#141A46", bg: null },
): LogoRender {
  const { lines, tagline, accent } = config;
  const fg = opts.fg;
  const bg = opts.bg;

  const roofTop = 34;
  const roofFeetY = 150;
  const roofApexX = VBW / 2;
  const roofFootL = 70;
  const roofFootR = VBW - 70;
  const roofStroke = 7;

  const baseSize = lines.length > 1 ? 96 : 138;
  const fitted = lines.map((l) => fitFontSize(l, MAX_TEXT_WIDTH, baseSize, SERIF_CHAR_FACTOR));
  const wordmarkSize = Math.min(...fitted, baseSize);
  const lineHeight = wordmarkSize * 1.06;

  const wordmarkTop = roofFeetY + wordmarkSize * 0.62;
  const wordmarkBottom = wordmarkTop + (lines.length - 1) * lineHeight;

  const taglineSize = 17;
  const taglineLetterSpacing = 0.2;
  const taglineGap = 34;
  const taglineY = wordmarkBottom + taglineGap;

  const bottomPad = 30;
  const height = tagline ? taglineY + bottomPad : wordmarkBottom + 40;

  const wordmarkTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : lineHeight;
      if (accent && accent.line === i && line.includes(accent.match)) {
        const idx = line.indexOf(accent.match);
        const before = esc(line.slice(0, idx));
        const mid = esc(accent.match);
        const after = esc(line.slice(idx + accent.match.length));
        return `<tspan x="${roofApexX}" dy="${i === 0 ? 0 : dy}">${before}<tspan fill="${accent.color}">${mid}</tspan>${after}</tspan>`;
      }
      return `<tspan x="${roofApexX}" dy="${i === 0 ? 0 : dy}">${esc(line)}</tspan>`;
    })
    .join("");

  const taglineFitted = tagline
    ? fitFontSize(tagline, MAX_TEXT_WIDTH, taglineSize, SANS_TRACKED_CHAR_FACTOR, taglineLetterSpacing)
    : taglineSize;

  const bgRect = bg ? `<rect x="0" y="0" width="${VBW}" height="${height}" fill="${bg}"/>` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${height}" width="${VBW}" height="${height}">
${bgRect}
<path d="M ${roofFootL} ${roofFeetY} L ${roofApexX} ${roofTop} L ${roofFootR} ${roofFeetY}" fill="none" stroke="${fg}" stroke-width="${roofStroke}" stroke-linecap="round" stroke-linejoin="round"/>
<text x="${roofApexX}" y="${wordmarkTop}" text-anchor="middle" font-family="${SERIF_STACK}" font-size="${wordmarkSize}" fill="${fg}">${wordmarkTspans}</text>
${
  tagline
    ? `<text x="${roofApexX}" y="${taglineY}" text-anchor="middle" font-family="${SANS_STACK}" font-weight="600" font-size="${taglineFitted}" letter-spacing="${taglineLetterSpacing}em" fill="${fg}">${esc(tagline)}</text>`
    : ""
}
</svg>`;

  return { svg, width: VBW, height };
}
