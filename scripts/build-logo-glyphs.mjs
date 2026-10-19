// Outlines the logo lettering into src/data/logoGlyphs.json, so logos render
// identically everywhere (also in downloaded SVG/PNG files, which can't load
// web fonts). Run with `npm run logos:glyphs` after adding new characters.
//
// Wordmark: Liberation Serif — metric-compatible with Times New Roman, the
// Markenbuch's wordmark face. Namenszusatz: Inter Medium.
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789.-& ";

function load(file) {
  const buf = readFileSync(new URL(`./fonts/${file}`, import.meta.url));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

function extract(font) {
  const upm = font.unitsPerEm;
  const scale = 1000 / upm;
  const glyphs = {};
  for (const ch of CHARS) {
    const g = font.charToGlyph(ch);
    // y-down, baseline at 0, 1000 units per em.
    glyphs[ch] = { adv: Math.round(g.advanceWidth * scale), d: g.getPath(0, 0, 1000).toPathData(0) };
  }
  const os2 = font.tables.os2;
  return { capHeight: Math.round(os2.sCapHeight * scale), glyphs };
}

const out = {
  serif: extract(load("LiberationSerif-Regular.ttf")),
  sans: extract(load("inter-latin-500-normal.woff")),
};
writeFileSync(new URL("../src/data/logoGlyphs.json", import.meta.url), JSON.stringify(out) + "\n");
console.log("logoGlyphs.json written", JSON.stringify(out).length, "bytes");
