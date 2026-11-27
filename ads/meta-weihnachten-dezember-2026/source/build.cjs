// Renders the Hansea Invest Meta ad creatives in 3 formats via Playwright.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = process.argv[2] || path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const asset = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', f)).toString('base64');
const A = {
  b1: asset('building1.png'), b2: asset('building2.png'), b5: asset('building5.png'),
  branch: asset('branch_mul.png'), gift: asset('gift_mul.png'),
};

const FORMATS = {
  '1x1': { w: 1080, h: 1080, u: 0.8, padT: 64, padB: 60 },
  '4x5': { w: 1080, h: 1350, u: 1, padT: 76, padB: 72 },
  '9x16': { w: 1080, h: 1920, u: 1.06, padT: 270, padB: 380 }, // Meta Stories/Reels safe zones
};
const u = (n) => `calc(${n} * var(--u))`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;0,8..60,800;1,8..60,500;1,8..60,600&display=block" rel="stylesheet">`;

// Original logo: roof line with chimney above the one-line word mark
const logo = ({ roof, text, font, weight = 500, size = 46, track = 0.04, rule }) => `
<div class="logo" style="color:${text}">
  <svg viewBox="0 0 230 50" style="width:${u(size * 5)};height:${u(size * 1.1)};display:block;margin-left:${u(size * 0.15)}" fill="none" stroke="${roof}" stroke-width="5" stroke-linejoin="miter" stroke-linecap="butt">
    <path d="M2 48 L115 6 L170 26.5 L170 12 L182 12 L182 31 L228 48"/>
  </svg>
  <div style="font-family:${font};font-weight:${weight};font-size:${u(size)};letter-spacing:${track}em;line-height:1;margin-top:${u(size * 0.12)};white-space:nowrap">HANSEA INVEST eG</div>
  ${rule ? `<div style="width:${u(130)};height:${u(3)};background:${rule};margin-top:${u(22)}"></div>` : ''}
</div>`;

const base = (f) => `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
body{--u:${f.u}px;position:relative;-webkit-font-smoothing:antialiased}
.safe{position:absolute;left:0;right:0;top:${f.padT}px;bottom:${f.padB}px;display:flex;flex-direction:column}
.grow{flex:1 1 0}
`;

/* ---------------- Motif 1: Warum bis Januar warten? (Dezemberaktion, reduziert) */
function januar(f, fk) {
  const strip = fk === '1x1' ? 330 : 300;
  return `<style>${base(f)}
  body{background:#141a3f;font-family:Figtree,sans-serif;color:#fff}
  .photo{position:absolute;top:0;bottom:0;right:0;width:${strip}px;background:url(${A.b1}) center/cover;border-left:5px solid #ecbc3e}
  .safe{left:${u(68)};right:${strip + 30}px}
  h1{font-family:'Source Serif 4',serif;font-weight:800;font-size:${fk === '9x16' ? '104px' : u(104)};white-space:nowrap;line-height:1.02;letter-spacing:-0.02em;margin-top:${u(70)}}
  h1 span{color:#ecbc3e}
  .sub{margin-top:${u(64)}} .sub b{display:block;font-size:${u(40)};font-weight:700;line-height:1.2}
  .sub p{font-size:${u(30)};line-height:1.35;margin-top:${u(8)};color:#e9eaf2}
  .k{display:flex;align-items:center;gap:${u(26)};color:#f3c443;font-weight:600;font-size:${u(42)};white-space:nowrap}
  .k small{border-left:2px solid #fff;padding-left:${u(22)};font-size:${u(21)};color:#fff;font-weight:400;line-height:1.3;white-space:normal}
  .k2{margin-top:${u(36)};color:#f3c443;font-weight:600;font-size:${u(42)}}
  .k2p{font-size:${u(25)};margin-top:${u(10)};line-height:1.4;color:#e9eaf2}
  .date{font-size:${u(42)};font-weight:700;margin-top:${u(70)};letter-spacing:.01em}
  .btn{display:inline-block;align-self:flex-start;background:#ecbc3e;color:#141a3f;font-weight:700;font-size:${u(42)};padding:${u(20)} ${u(40)};margin-top:${u(34)}}
  </style>
  <div class="photo"></div>
  <div class="safe">
    ${logo({ roof: '#ecbc3e', text: '#fff', font: 'Figtree', weight: 400, size: 50, track: 0.03 })}
    <h1>Warum bis<br><span>Januar warten?</span></h1>
    <div class="sub"><b>An Wohnimmobilienprojekten beteiligen.</b><p>Über Genossenschaftsanteile der Hanseatischen Invest eG.</p></div>
    <div class="grow"></div>
    <div class="k">7 % Verzinsung pro Jahr <small>Vorgesehen,<br>nicht garantiert.</small></div>
    <div class="k2">3 % Zeichnungsbonus</div>
    <div class="k2p">Einmalig für neue Mitglieder auf den gesamten Erstzeichnungsbetrag.</div>
    <div class="date">01.12.–31.12.2026</div>
    <div class="btn">Jetzt informieren</div>
  </div>`;
}

/* ---------------- Motif 2: Aus Rückblick wird Ausblick. */
function rueckblick(f, fk) {
  const bh = fk === '1x1' ? 190 : fk === '4x5' ? 250 : 330;
  return `<style>${base(f)}
  body{background:#171d4d;font-family:'Source Serif 4',serif;color:#fff}
  .roof{position:absolute;right:0;top:${fk === '9x16' ? 30 : 40}px;width:620px;height:200px}
  .bld{position:absolute;left:0;bottom:0;width:${bh * 3.5}px;height:${bh}px;background:url(${A.b2}) left top/cover;
       -webkit-mask-image:linear-gradient(90deg,#000 55%,transparent 98%)}
  .safe{left:${u(62)};right:${u(62)}}
  h1{font-weight:600;font-size:${u(112)};line-height:1.02;letter-spacing:-0.015em;margin-top:${u(96)}}
  h1 span{color:#ecbe48}
  .sub{margin-top:${u(58)}} .sub b{display:block;font-size:${u(42)};font-weight:700}
  .sub p{font-size:${u(28)};margin-top:${u(12)};color:#e6e7f0;letter-spacing:.01em}
  .k{display:flex;align-items:center;gap:${u(30)};color:#ecbe48;font-weight:700;font-size:${u(42)};white-space:nowrap}
  .k small{border-left:2px solid #fff;padding-left:${u(30)};font-size:${u(25)};color:#fff;font-weight:400}
  .k2{margin-top:${u(34)};color:#ecbe48;font-weight:700;font-size:${u(42)}}
  .k2p{font-size:${u(27)};margin-top:${u(6)};color:#e6e7f0}
  .date{font-size:${u(52)};font-weight:400;margin-top:${u(64)}}
  .btn{display:inline-block;align-self:flex-start;background:#ecbe48;color:#171d4d;font-weight:700;font-size:${u(42)};padding:${u(18)} ${u(44)};margin-top:${u(30)}}
  </style>
  <svg class="roof" viewBox="0 0 620 200" fill="none" stroke="#ecbe48" stroke-width="5"><path d="M40 190 L420 6 L640 110"/></svg>
  <div class="bld"></div>
  <div class="safe">
    ${logo({ roof: '#ecbe48', text: '#fff', font: "'Source Serif 4'", weight: 600, size: 48, track: 0.04 })}
    <h1>Aus Rückblick<br>wird <span>Ausblick.</span></h1>
    <div class="sub"><b>An Wohnimmobilienprojekten beteiligen.</b><p>Über Genossenschaftsanteile der Hanseatischen Invest eG.</p></div>
    <div class="grow" style="max-height:${u(80)}"></div>
    <div class="k">7 % Verzinsung pro Jahr <small>Vorgesehen, nicht garantiert.</small></div>
    <div class="k2">3 % Zeichnungsbonus</div>
    <div class="k2p">Einmalig für neue Mitglieder auf den gesamten Erstzeichnungsbetrag.</div>
    <div class="date">01.12.–31.12.2026</div>
    <div class="btn">Jetzt informieren</div>
  </div>`;
}

/* ---------------- Motif 3: Machen Sie auch Ihrer Zukunft ein Geschenk. (Weihnachten) */
function zukunft(f, fk) {
  const bw = fk === '1x1' ? 360 : 440;
  return `<style>${base(f)}
  body{background:#fcf7f1;font-family:Figtree,sans-serif;color:#5d6845}
  .branch{position:absolute;right:0;top:0;width:${bw}px;height:${bw * 440 / 424}px;background:url(${A.branch}) right top/cover;mix-blend-mode:multiply;
          -webkit-mask-image:radial-gradient(ellipse 100% 100% at 100% 0,#000 62%,transparent 98%)}
  .safe{left:${u(78)};right:${u(70)}}
  h1{font-family:'Source Serif 4',serif;font-style:italic;font-weight:500;font-size:${u(104)};line-height:1.04;letter-spacing:-0.02em;margin-top:${u(80)};
     background:linear-gradient(180deg,#9a5121,#6b3417);-webkit-background-clip:text;color:transparent}
  .sub{margin-top:${u(56)}} .sub b{display:block;font-size:${u(41)};font-weight:700;color:#5d6845}
  .sub p{font-size:${u(28)};margin-top:${u(10)};color:#5b5b55}
  .k{display:flex;align-items:center;gap:${u(18)};font-weight:700;font-size:${u(40)};white-space:nowrap}
  .k em{font-family:'Source Serif 4',serif;font-style:normal;font-weight:600;font-size:${u(84)};color:#9e2f35;line-height:1}
  .k small{border-left:2px solid #c9a46a;margin-left:${u(22)};padding-left:${u(32)};font-size:${u(26)};color:#5b5b55;font-weight:400;line-height:1.3}
  .k2{margin-top:${u(20)}} .k2p{font-size:${u(26)};margin-top:${u(6)};color:#5b5b55}
  .date{display:flex;align-items:center;gap:${u(30)};font-family:'Source Serif 4',serif;font-weight:500;font-size:${u(46)};color:#5c3418;margin-top:${u(64)}}
  .btn{display:inline-block;align-self:flex-start;background:#68764b;color:#fff;font-weight:700;font-size:${u(44)};padding:${u(22)} ${u(70)};border-radius:${u(22)};margin-top:${u(54)}}
  </style>
  <div class="branch"></div>
  <div class="safe">
    ${logo({ roof: '#5e6b45', text: '#5e6b45', font: 'Figtree', weight: 600, size: 44, track: 0.08 })}
    <h1>Machen Sie auch<br>Ihrer Zukunft<br>ein Geschenk.</h1>
    <div class="sub"><b>An Wohnimmobilienprojekten beteiligen.</b><p>Über Genossenschaftsanteile der Hanseatischen Invest eG.</p></div>
    <div class="grow" style="max-height:${u(60)}"></div>
    <div class="k"><em>7 %</em> Verzinsung pro Jahr <small>Vorgesehen,<br>nicht garantiert.</small></div>
    <div class="k k2"><em>3 %</em> Zeichnungsbonus</div>
    <div class="k2p">Einmalig für neue Mitglieder auf den gesamten Erstzeichnungsbetrag.</div>
    <div class="date"><svg viewBox="0 0 24 24" style="width:${u(58)};height:${u(58)}" fill="none" stroke="#c39a5c" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>15.12.–31.12.2026</div>
    <div class="btn">Jetzt informieren</div>
  </div>`;
}

/* ---------------- Motif 4: Ein Geschenk darf auch für Sie sein. (Weihnachten) */
function fuerSie(f, fk) {
  const gw = fk === '1x1' ? 300 : 380;
  return `<style>${base(f)}
  body{background:#fcf2ea;font-family:'Source Serif 4',serif;color:#4a2a1c}
  .gift{position:absolute;right:${fk === '1x1' ? 20 : 30}px;bottom:${fk === '9x16' ? 300 : 40}px;width:${gw}px;height:${gw * 280 / 384}px;background:url(${A.gift}) center/cover;mix-blend-mode:multiply;
        -webkit-mask-image:radial-gradient(ellipse 54% 60% at 52% 52%,#000 72%,transparent 100%)}
  .safe{left:${u(78)};right:${u(70)}}
  .rule{width:${u(165)};height:${u(3)};background:#c9a24e}
  h1{font-weight:500;font-size:${u(108)};line-height:1.06;letter-spacing:-0.02em;color:#b04245;margin-top:${u(100)}}
  .sub{margin-top:${u(54)}} .sub b{display:block;font-size:${u(44)};font-weight:500;color:#4a2a1c}
  .sub p{font-size:${u(30)};margin-top:${u(6)};color:#4a2a1c}
  .k{display:flex;align-items:center;gap:${u(16)};font-weight:500;font-size:${u(40)};white-space:nowrap;color:#4a2a1c}
  .k em{font-style:normal;font-weight:500;font-size:${u(76)};color:#6b7a45;line-height:1}
  .k small{border-left:2px solid #c9a24e;margin-left:${u(30)};padding-left:${u(30)};font-size:${u(23)};font-weight:400}
  .k2{margin-top:${u(22)}} .k2p{font-size:${u(25)};margin-top:${u(6)}}
  .date{font-size:${u(46)};margin-top:${u(72)};font-weight:500}
  .btn{display:inline-block;align-self:flex-start;background:#b04245;color:#fff;font-weight:500;font-size:${u(44)};padding:${u(14)} ${u(58)};border-radius:${u(8)};margin-top:${u(24)}}
  </style>
  <div class="gift"></div>
  <div class="safe">
    ${logo({ roof: '#c9a24e', text: '#3a2518', font: "'Source Serif 4'", weight: 500, size: 46, track: 0.07, rule: '#c9a24e' })}
    <h1>Ein Geschenk darf<br>auch für Sie sein.</h1>
    <div class="sub"><b>An Wohnimmobilienprojekten beteiligen.</b><p>Über Genossenschaftsanteile der Hanseatischen Invest eG.</p></div>
    <div class="rule" style="margin-top:${u(44)}"></div>
    <div class="grow" style="max-height:${u(50)};min-height:${u(40)}"></div>
    <div class="k"><em>7 %</em> Verzinsung pro Jahr <small>Vorgesehen, nicht garantiert.</small></div>
    <div class="k k2"><em>3 %</em> Zeichnungsbonus</div>
    <div class="k2p">Einmalig für neue Mitglieder auf den gesamten Erstzeichnungsbetrag.</div>
    <div class="date">15.12.–31.12.2026</div>
    <div class="btn">Jetzt informieren</div>
  </div>`;
}

/* ---------------- Motif 5: Dezemberaktion (ausfuehrlich) */
function dezember(f, fk) {
  const sq = fk === '1x1';
  const pw = sq ? 330 : 300;
  return `<style>${base(f)}
  body{--u:${sq ? 0.75 : 0.86}px;background:radial-gradient(ellipse at 70% 10%,#1e2a6e 0%,#141a4c 55%,#11163f 100%);font-family:Poppins,sans-serif;color:#fff}
  .photo{position:absolute;right:${sq ? 26 : 30}px;top:${fk === '9x16' ? 230 : sq ? 40 : 60}px;bottom:${fk === '9x16' ? 330 : sq ? 40 : 60}px;width:${pw}px;
         background:#ecbc3e;clip-path:polygon(22% 3%,100% 0,100% 100%,14% 98%,0 50%);padding:5px}
  .photo div{width:100%;height:100%;background:url(${A.b5}) center/cover;clip-path:polygon(22% 3%,100% 0,100% 100%,14% 98%,0 50%)}
  .safe{left:${u(58)};right:${pw + 34}px}
  .eyebrow{color:#ecbc3e;font-weight:600;letter-spacing:.26em;font-size:${u(26)};margin-top:${u(40)}}
  .bar{width:${u(70)};height:${u(4)};background:#ecbc3e;margin-top:${u(18)}}
  .q{color:#f2c548;font-weight:700;font-size:${u(38)};margin-top:${u(26)}}
  h1{font-weight:700;font-size:${u(52)};line-height:1.08;margin-top:${u(6)}}
  h2{font-weight:600;font-size:${u(48)};line-height:1.08;margin-top:${u(34)}}
  .lead{font-size:${u(27)};line-height:1.3;margin-top:${u(10)};color:#e6e7f2}
  .box{display:flex;align-items:center;border:2px solid #d9ae3e;border-radius:${u(14)};padding:${u(18)} ${u(24)};margin-top:${u(28)};gap:${u(22)}}
  .box + .box{margin-top:${u(18)}}
  .box em{font-style:normal;font-weight:600;font-size:${u(92)};line-height:1;min-width:${u(170)}}
  .box .t{border-left:2px solid #d9ae3e;padding-left:${u(22)}}
  .box b{display:block;font-weight:600;font-size:${u(38)};line-height:1.1}
  .box span{display:block;font-size:${u(22)};line-height:1.3;margin-top:${u(6)};color:#e6e7f2}
  .choice{font-size:${u(24)};margin-top:${u(20)};color:#e6e7f2}
  .date{color:#f2c548;font-weight:700;font-size:${u(48)};margin-top:${u(22)};padding-top:${u(18)};border-top:2px solid #d9ae3e}
  .btn{display:flex;justify-content:space-between;align-items:center;background:#ecbc3e;color:#141a4c;font-weight:600;font-size:${u(31)};padding:${u(20)} ${u(28)};border-radius:${u(10)};margin-top:${u(20)}}
  .foot{position:absolute;left:${u(58)};right:${u(58)};bottom:${fk === '9x16' ? f.padB - 80 : 0}px}
  </style>
  <div class="photo"><div></div></div>
  <div class="safe">
    ${logo({ roof: '#fff', text: '#fff', font: "'Source Serif 4'", weight: 500, size: 40, track: 0.05 })}
    <div class="eyebrow">DEZEMBERAKTION</div><div class="bar"></div>
    <div class="q">Warum bis Januar warten?</div>
    <h1>Geben Sie Ihren Investmentplänen schon im Dezember einen Anfang.</h1>
    <h2>An Immobilienprojekten beteiligen.</h2>
    <div class="lead">In Form von Genossenschaftsanteilen bei der Hanseatischen Invest eG.</div>
    <div class="grow"></div>
    <div class="box"><em>7%</em><div class="t"><b>Verzinsung pro Jahr</b><span>Vorgesehen, nicht garantiert.</span></div></div>
    <div class="box"><em style="color:#f2c548">3%</em><div class="t"><b style="color:#f2c548">Zeichnungsbonus</b><span>Einmalig für neue Mitglieder bei Erstzeichnung auf den gesamten Erstzeichnungsbetrag.</span></div></div>
    <div class="choice">Sie wählen: Auszahlung oder Gutschrift zur Beteiligung.</div>
    <div class="date">01.12.–31.12.2026</div>
    <div class="btn">Immobilienbeteiligung kennenlernen <span>→</span></div>
  </div>`;
}

const MOTIFS = {
  'dezember-01_warum-bis-januar-warten': januar,
  'dezember-02_aus-rueckblick-wird-ausblick': rueckblick,
  'weihnachten-01_ihrer-zukunft-ein-geschenk': zukunft,
  'weihnachten-02_ein-geschenk-fuer-sie': fuerSie,
  'dezember-03_dezemberaktion-ausfuehrlich': dezember,
};

(async () => {
  const only = process.argv[3];
  const browser = await chromium.launch();
  for (const [name, fn] of Object.entries(MOTIFS)) {
    if (only && !name.includes(only)) continue;
    for (const [fk, f] of Object.entries(FORMATS)) {
      const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 });
      await page.setContent(`<!doctype html><html lang="de"><head><meta charset="utf-8">${FONTS}</head><body>${fn(f, fk)}</body></html>`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // overflow check: content of .safe must fit
      const over = await page.evaluate(() => { const s = document.querySelector('.safe'); return s.scrollHeight - s.clientHeight; });
      if (over > 0) console.log(`OVERFLOW ${name} ${fk}: ${over}px`);
      await page.screenshot({ path: path.join(OUT, `${name}_${fk}_${f.w}x${f.h}.png`) });
      await page.close();
    }
  }
  await browser.close();
})();
