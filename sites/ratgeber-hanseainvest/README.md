# Ratgeber pages (ratgeber.hanseainvest.de)

Taboola targets of the Hanseatische Invest eG:

- Article: https://ratgeber.hanseainvest.de/
- Landing page: https://ratgeber.hanseainvest.de/infopaket/

Source: `src/hansea-invest/` on branch `claude/serene-keller-f8e2t1`. The live
landing page is a hand-patched build without the phone number, so these files
are patched copies of the live build, not a rebuild from that branch.

The footer of both pages now names the provider in full (Taboola wants it on
the landing page itself): Hanseatische Invest eG, address, GnR 1175 Amtsgericht
Hamburg, Vorstand, Aufsichtsratsvorsitzender, Prüfungsverband, e-mail. No
USt-IdNr. (the eG has none). Since 13.11.2026 also the phone number
+49-40-22862372-0 (footer of both pages, the plain-HTML block and the
Impressum), at the Genossenschaft's request.

The scripts are served with a 7-day cache, so every patched build gets a new
file name and the two `index.html` files point to it: now
`article-20261113.js` and `landing-20261113.js` (with the phone number;
before: `article-20261112.js`, `landing-nophone-20261112.js`, still on the
server but no longer used). The other assets on the server are unchanged.

## Second rejection: Taboola saw an empty page

Taboola's checker reads the raw HTML without running JavaScript ("No page
capture available"), and the raw HTML of these pages was an empty
`<div id="root">`. Now:

- both `index.html` files carry the Impressum details as plain HTML inside
  `#root`; React replaces it on load, so visitors see the normal page;
- `impressum/index.html` is a static Impressum on the same domain, and the
  footer links point to it (`shared-20261112.js` is the shared bundle with
  `imprint: "/impressum/"`).
