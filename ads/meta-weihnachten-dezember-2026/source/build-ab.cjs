// Weihnachtsaktion A/B (15.12.–31.12.2026): renders both variants in 1:1, 4:5, 9:16
// and composes an artboard overview. Usage: node build-ab.js <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = process.argv[2] || path.join(ROOT, '..');
const ART = path.join(OUT, 'artboard');
fs.mkdirSync(ART, { recursive: true });
const asset = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', f)).toString('base64');
const A = { branch: asset('branch_mul.png'), b5: asset('building5.png') };

const FORMATS = {
  '1x1': { w: 1080, h: 1080, u: 0.74, padT: 54, padB: 50 },
  '4x5': { w: 1080, h: 1350, u: 0.95, padT: 66, padB: 60 },
  '9x16': { w: 1080, h: 1920, u: 1.02, padT: 270, padB: 380 }, // Stories/Reels safe zones
};
const u = (n) => `calc(${n} * var(--u))`;
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400;1,8..60,500&display=block" rel="stylesheet">`;

const C = { green: '#2c5631', green2: '#3c6a40', orange: '#e0895b', peach: '#fbe4cf', pill: '#f9dcc0', ink: '#2b2f2a' };

const logo = () => `
<div style="color:${C.green}">
  <svg viewBox="0 0 230 50" style="width:${u(200)};height:${u(44)};display:block;margin-left:${u(6)}" fill="none" stroke="${C.green}" stroke-width="5"><path d="M2 48 L115 6 L170 26.5 L170 12 L182 12 L182 31 L228 48"/></svg>
  <div style="font-family:'Source Serif 4',serif;font-weight:500;font-size:${u(40)};letter-spacing:.05em;line-height:1;margin-top:${u(6)};white-space:nowrap">HANSEA INVEST eG</div>
</div>`;

// faceted paper star
function star(size, rot = 0) {
  const n = 8, R = 50, r = 17, cx = 50, cy = 50, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2 + rot;
    const rr = i % 2 ? r : R;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  let tris = '';
  for (let i = 0; i < n * 2; i++) {
    const p = pts[i], q = pts[(i + 1) % (n * 2)];
    tris += `<polygon points="${cx},${cy} ${p[0]},${p[1]} ${q[0]},${q[1]}" fill="${i % 2 ? '#f4e7c8' : '#fffaf0'}"/>`;
  }
  return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px;filter:drop-shadow(0 0 ${size * 0.12}px rgba(255,225,150,.75)) drop-shadow(0 6px 10px rgba(90,70,30,.25))">${tris}</svg>`;
}
const bauble = (x, y, d, kind) => {
  const body = kind === 'green'
    ? `background:radial-gradient(circle at 34% 30%,#d6dfb9 0%,#94a46e 32%,#6d7d4a 70%,#56653a 100%)`
    : `background:repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 ${d / 14}px,transparent ${d / 14}px ${d / 7}px),radial-gradient(circle at 34% 30%,#fffdf6 0%,#f1e8d6 50%,#d9ccb0 100%)`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;${body};box-shadow:0 ${d * 0.08}px ${d * 0.15}px rgba(60,60,30,.25)"></div>
  <div style="position:absolute;left:${x + d * 0.42}px;top:${y - d * 0.07}px;width:${d * 0.16}px;height:${d * 0.1}px;border-radius:2px;background:linear-gradient(90deg,#b89443,#f0d58b,#a8843a)"></div>`;
};
const eucalyptus = (x, y, s, rot) => {
  let leaves = '';
  [[20, 10, -30], [42, 30, 25], [30, 52, -20], [55, 70, 30], [38, 90, -15]].forEach(([lx, ly, a]) => {
    leaves += `<ellipse cx="${lx}" cy="${ly}" rx="17" ry="12" transform="rotate(${a} ${lx} ${ly})" fill="url(#eg)"/>`;
  });
  return `<svg viewBox="0 0 80 110" style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s * 1.375}px;transform:rotate(${rot}deg)">
  <defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9bf9a"/><stop offset="1" stop-color="#6f8f6a"/></linearGradient></defs>
  <path d="M30 0 C40 40 30 70 45 110" stroke="#7e8f6d" stroke-width="2" fill="none"/>${leaves}</svg>`;
};
const bokeh = (list) => list.map(([x, y, d, o]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,${o}) 0%,rgba(255,226,150,0) 70%)"></div>`).join('');

const base = (f) => `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
body{--u:${f.u}px;position:relative;font-family:Figtree,sans-serif;color:${C.green};-webkit-font-smoothing:antialiased;
     background:linear-gradient(170deg,#e9efdf 0%,#f1f3e6 35%,#f8f5ec 70%,#f4f1e6 100%)}
.deco{position:absolute;inset:0;pointer-events:none}
.safe{position:absolute;left:${u(80)};right:${u(80)};top:${f.padT}px;bottom:${f.padB}px;display:flex;flex-direction:column}
.grow{flex:1 1 0}
.eyebrow{font-weight:700;letter-spacing:.3em;font-size:${u(25)};color:${C.ink};margin-top:${u(34)}}
.bar{width:${u(90)};height:${u(4)};background:${C.orange};margin-top:${u(18)}}
.h1{font-family:'Source Serif 4',serif;font-size:${u(54)};line-height:1.15;color:${C.green2};margin-top:${u(30)}}
.h2{font-weight:800;font-size:${u(68)};line-height:1.05;letter-spacing:-.01em;color:${C.green};margin-top:${u(14)}}
.inv{border-left:${u(5)} solid ${C.orange};padding-left:${u(26)};margin-top:${u(44)}}
.inv b{display:block;font-weight:800;font-size:${u(52)};line-height:1.05;color:${C.green}}
.inv p{font-size:${u(31)};line-height:1.3;color:${C.ink};margin-top:${u(12)}}
.choice{font-size:${u(26)};color:${C.ink};text-align:center;margin-top:${u(16)}}
.daterow{display:flex;align-items:center;gap:${u(30)};margin-top:${u(26)}}
.daterow i{flex:1;height:2px;background:${C.orange};opacity:.85}
.pill{background:${C.pill};color:${C.green};font-weight:800;font-size:${u(42)};padding:${u(8)} ${u(34)};border-radius:${u(40)}}
.btn{background:${C.green};color:#fff;font-weight:700;font-size:${u(40)};text-align:center;padding:${u(18)} ${u(30)};border-radius:${u(40)};margin-top:${u(20)};box-shadow:0 ${u(4)} ${u(10)} rgba(30,60,30,.2)}
.foot{display:flex;align-items:center;gap:${u(30)};margin-top:${u(20)};font-weight:500;font-size:${u(30)};color:${C.ink}}
.foot i{flex:1;height:2px;background:${C.orange};opacity:.7}
`;

const tail = (date = '15.12.–31.12.2026') => `
  <div class="choice">Sie wählen: Auszahlung oder Gutschrift zur Beteiligung.</div>
  <div class="daterow"><i></i><div class="pill">${date}</div><i></i></div>
  <div class="btn">Genossenschaftsanteile kennenlernen</div>
  <div class="foot"><i></i>Hanseatische Invest eG<i></i></div>`;

/* ---- A · Herzlich & fließend */
function variantA(f, fk) {
  const W = f.w, top = fk === '9x16' ? 40 : 0, k = fk === '1x1' ? 0.8 : 1;
  const deco = `
  <div style="position:absolute;right:0;top:${top}px;width:${470 * k}px;height:${490 * k}px;background:url(${A.branch}) right top/cover;mix-blend-mode:multiply;-webkit-mask-image:radial-gradient(ellipse 100% 100% at 100% 0,#000 60%,transparent 98%)"></div>
  ${bokeh([[W - 420 * k, top + 60, 90, .7], [W - 170 * k, top + 230 * k, 70, .6], [W - 300 * k, top + 380 * k, 110, .5], [W - 110, top + 470 * k, 60, .6], [W - 470 * k, top + 520 * k, 80, .45]])}
  <div style="position:absolute;left:${W - 190 * k}px;top:${top + 110 * k}px;width:2px;height:${110 * k}px;background:#c9a65a"></div>
  <div style="position:absolute;left:${W - 190 * k - 135 * k}px;top:${top + 190 * k}px">${star(270 * k, 0.2)}</div>
  ${eucalyptus(W - 130 * k, top + 400 * k, 110 * k, -20)}
  ${bauble(W - 330 * k, top + 470 * k, 140 * k, 'green')}
  ${bauble(W - 205 * k, top + 530 * k, 110 * k, 'white')}
  <div style="position:absolute;left:0;right:0;top:${top + 720 * k}px;bottom:0;background:radial-gradient(ellipse 90% 60% at 40% 0%,rgba(255,252,244,.85),rgba(255,252,244,0) 70%)"></div>
  ${bokeh([[20, f.h - f.padB - 380 * k, 90, .5], [70, f.h - f.padB - 300 * k, 50, .6]])}`;
  return `<style>${base(f)}
  .panel{background:linear-gradient(90deg,${C.peach},#fcebdc);border-radius:${u(70)};padding:${u(26)} ${u(46)};margin-top:${u(30)};font-size:${u(31)};line-height:1.35;color:${C.ink}}
  .panel b{font-weight:800;color:${C.green}}
  </style>
  <div class="deco">${deco}</div>
  <div class="safe">
    ${logo()}
    <div class="eyebrow">WEIHNACHTSAKTION</div><div class="bar"></div>
    <div class="h1" style="font-style:italic;max-width:${u(640)}">Zu Weihnachten denken Sie vor allem an Ihre Liebsten.</div>
    <div class="h2" style="font-style:italic;max-width:${u(640)}">Denken Sie doch auch mal an sich.</div>
    <div class="grow" style="max-height:${u(60)}"></div>
    <div class="inv"><b>In Genossenschaftsanteile investieren.</b><p>Beteiligen Sie sich über die Hanseatische Invest eG am Wohnimmobiliengeschäft.</p></div>
    <div class="panel">Zur Weihnachtsaktion erhalten neue Mitglieder einmalig <b>3 % Zeichnungsbonus</b> auf den gesamten Erstzeichnungsbetrag.</div>
    ${tail()}
  </div>`;
}

/* ---- B · Spielerisch & klar */
function variantB(f, fk) {
  const W = f.w, top = fk === '9x16' ? 40 : 0, k = fk === '1x1' ? 0.8 : 1;
  const bTop = top + 170 * k, bH = fk === '9x16' ? 900 : fk === '4x5' ? 720 : 560;
  const deco = `
  <div style="position:absolute;right:0;top:${bTop}px;width:${360 * k}px;height:calc(var(--boxTop) - ${bTop + 30}px);background:url(${A.b5}) center/cover;border-radius:${300 * k}px 0 0 ${120 * k}px;-webkit-mask-image:linear-gradient(180deg,#000 75%,transparent 100%)"></div>
  <div style="position:absolute;right:0;top:${top}px;width:${470 * k}px;height:${490 * k}px;background:url(${A.branch}) right top/cover;mix-blend-mode:multiply;-webkit-mask-image:radial-gradient(ellipse 100% 100% at 100% 0,#000 60%,transparent 98%)"></div>
  ${bokeh([[W - 400 * k, top + 40, 80, .8], [W - 200 * k, top + 30, 60, .8], [W - 120, top + 90, 50, .8]])}
  <div style="position:absolute;left:${W - 300 * k}px;top:${top}px;width:2px;height:${150 * k}px;background:#c9a65a"></div>
  <div style="position:absolute;left:${W - 300 * k - 115 * k}px;top:${top + 120 * k}px">${star(230 * k, 0.15)}</div>
  <div style="position:absolute;left:0;top:calc(var(--boxTop) - ${150 * k}px)">${bauble(W - 250 * k, 0, 120 * k, 'green')}${bauble(W - 140 * k, 40 * k, 90 * k, 'white')}${eucalyptus(W - 100 * k, -110 * k, 90 * k, 10)}</div>`;
  return `<style>${base(f)}
  body{--u:${{ '9x16': 0.94, '4x5': 0.9, '1x1': 0.7 }[fk]}px}
  .box{display:flex;align-items:center;gap:${u(26)};border:2px solid #cfd8c0;background:rgba(255,253,247,.85);border-radius:${u(26)};padding:${u(20)} ${u(30)};margin-top:${u(30)};margin-right:${u(fk === '1x1' ? 60 : 110)}}
  .box .t{border-left:${u(4)} solid ${C.orange};padding-left:${u(24)}}
  .box b{display:block;font-weight:800;font-size:${u(42)};color:${C.green}}
  .box span{display:block;font-size:${u(25)};line-height:1.3;color:${C.ink}}
  </style>
  <div class="deco">${deco}</div>
  <div class="safe">
    ${logo()}
    <div class="eyebrow">WEIHNACHTSAKTION</div><div class="bar"></div>
    <div class="h1" style="max-width:${u(640)}">Sie machen Weihnachten für Ihre Liebsten besonders.</div>
    <div class="h2" style="max-width:${u(640)}">Ein Wunsch darf auch Ihr eigener sein.</div>
    <div class="grow" style="max-height:${u(60)}"></div>
    <div class="inv" style="margin-right:${360 * k + 20 - 80 * f.u}px"><b>In Genossenschaftsanteile investieren.</b><p>Beteiligen Sie sich über die Hanseatische Invest eG am Wohnimmobiliengeschäft.</p></div>
    <div class="box">
      <svg viewBox="0 0 24 24" style="width:${u(74)};height:${u(74)};flex:none" fill="none" stroke="${C.green}" stroke-width="1.4"><rect x="3" y="9" width="18" height="12" rx="1"/><rect x="2" y="6.5" width="20" height="3" rx="1"/><path d="M12 6.5V21M12 6.5C10 2.5 6.5 3 7 5s5 1.5 5 1.5zM12 6.5c2-4 5.5-3.5 5-1.5s-5 1.5-5 1.5z"/></svg>
      <div class="t"><b>3 % Zeichnungsbonus</b><span>Einmalig für neue Mitglieder bei Erstzeichnung</span><span>Auf den gesamten Erstzeichnungsbetrag</span></div>
    </div>
    ${tail()}
  </div>`;
}

const MOTIFS = { 'weihnachten-A_herzlich-fliessend': variantA, 'weihnachten-B_spielerisch-klar': variantB };

(async () => {
  const browser = await chromium.launch();
  const files = {};
  for (const [name, fn] of Object.entries(MOTIFS)) {
    for (const [fk, f] of Object.entries(FORMATS)) {
      const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
      await page.setContent(`<!doctype html><html lang="de"><head><meta charset="utf-8">${FONTS}</head><body>${fn(f, fk)}</body></html>`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => { const b = document.querySelector('.box'); if (b) document.body.style.setProperty('--boxTop', b.getBoundingClientRect().top + 'px'); });
      const over = await page.evaluate(() => { const s = document.querySelector('.safe'); return s.scrollHeight - s.clientHeight; });
      if (over > 0) console.log(`OVERFLOW ${name} ${fk}: ${over}px`);
      const file = path.join(OUT, `${name}_${fk}_${f.w}x${f.h}.png`);
      await page.screenshot({ path: file });
      (files[name] ||= {})[fk] = file;
      await page.close();
    }
  }
  // Artboard overview
  const img = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  const S = 0.42;
  const row = (name, label) => `<section><div class="tag">${label}</div><div class="row">${['9x16', '4x5', '1x1'].map((fk) => {
    const f = FORMATS[fk];
    return `<figure><img src="${img(files[name][fk])}" style="width:${f.w * S}px;height:${f.h * S}px"><figcaption>${fk.replace('x', ':')} · ${f.w}×${f.h}</figcaption></figure>`;
  }).join('')}</div></section>`;
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    *{margin:0;padding:0;box-sizing:border-box} body{background:#f6f3ec;font-family:Figtree,sans-serif;color:#2b2f2a;padding:56px 64px;width:1560px}
    header{display:flex;align-items:center;gap:28px;margin-bottom:40px} header h1{font-size:22px;letter-spacing:.3em;font-weight:600;white-space:nowrap} header i{flex:1;height:1px;background:#8a8f86}
    header p{font-size:15px;color:#6b6f68;white-space:nowrap}
    section{margin-bottom:48px} .tag{display:inline-block;background:#dfe7d4;color:#2c5631;font-weight:600;letter-spacing:.14em;font-size:17px;padding:8px 26px;border-radius:30px;margin-bottom:20px}
    .row{display:flex;gap:40px;align-items:flex-end} figure img{display:block;box-shadow:0 8px 30px rgba(40,50,30,.15)}
    figcaption{font-size:14px;color:#6b6f68;margin-top:10px;letter-spacing:.04em}
  </style></head><body>
    <header><h1>GESTALTUNGSENTWÜRFE · WEIHNACHTSAKTION</h1><i></i><p>Meta Ads · 15.12.–31.12.2026</p></header>
    ${row('weihnachten-A_herzlich-fliessend', 'A · HERZLICH &amp; FLIESSEND')}
    ${row('weihnachten-B_spielerisch-klar', 'B · SPIELERISCH &amp; KLAR')}
  </body></html>`;
  const page = await browser.newPage({ viewport: { width: 1560, height: 1000 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ART, 'artboard_weihnachten-A-B_15-12.png'), fullPage: true });
  await browser.close();
})();
