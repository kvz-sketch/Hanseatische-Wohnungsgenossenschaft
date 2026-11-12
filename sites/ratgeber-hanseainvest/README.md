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
USt-IdNr. (the eG has none) and no phone number, by decision.

The scripts are served with a 7-day cache, so the patched builds have new file
names (`article-20261112.js`, `landing-nophone-20261112.js`) and the two
`index.html` files point to them. The other assets on the server are unchanged.
