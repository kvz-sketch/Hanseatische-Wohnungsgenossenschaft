# Taboola landing pages: Impressum

The lead-magnet pages of the Hanseatische Wohnungsgenossenschaft run on a
separate Hostinger site (`hanseainvest-de-735810.hostingersite.com`, served as
`superreichensteuer.` and `120wohnungen.hanseatische-wohnungsgenossenschaft.de`).
That site is not part of this repository; only the files added for it are here.

Deploy:

1. Upload `superreichensteuer/impressum.html` and `120-wohnungen/impressum.html`
   to the same folders in that site's `public_html`.
2. In `superreichensteuer/index.html`, `superreichensteuer/leitfaden.html`,
   `120-wohnungen/index.html` and `120-wohnungen/case-study.html`, replace

   `<a href="https://gerlachgroup.de/impressum/" target="_blank" rel="noopener">Impressum</a>`

   with

   `<a href="impressum.html">Impressum</a>`

3. In the footer of all six pages (the four above and both `impressum.html`),
   after the "Adresse" column in `.footer-cols`, add the provider column
   Taboola requires (Handelsregister and USt-IdNr. on the landing page itself):

   `<div><span class="label">Anbieter</span><span>Gerlach Verwaltungs- und<br>Beteiligungsges.mbH</span><span>HRB 153780 · Amtsgericht Hamburg</span><span>USt-IdNr. DE320623851</span></div>`

The text is the Impressum of gerlachgroup.de (Gerlach Verwaltungs- und
Beteiligungsges.mbH), updated: it cites the DDG instead of the TMG (§ 5,
§ 7 Abs. 1, §§ 8 bis 10) and no longer links the EU online dispute
platform, which closed in July 2025.

# objekte.hanseatische-wohnungsgenossenschaft.de

Landing page plus a five-step request funnel (`objekte/`), live in the same
Hostinger site under `public_html/objekte/`:

- `index.html`: landing page; the example offer card is HTML, not an image.
- `anfrage.html`: funnel (goals, net income, equity, contact, thank you).
  Choosing "Unter 3.000 €" net income opens `hansea-grow.html` instead. The
  thank-you step shows the Calendly booking widget.
- `hansea-grow.html`: alternative for less than 3.000 € net income: Hansea
  Grow (from 100 € a month), buttons to hanseagrow.de/kontakt and hanseagrow.de.
- `anfrage.php`: stores each request in `~/leads-objekte.csv` (outside
  `public_html`), emails the team (`info@gerlachgroup.de`, reply goes to the
  requester) and sends the requester a short confirmation.
- `assets/consent.js`: consent bar and Meta Pixel (`Lead` after a request);
  the shield button bottom left reopens it.

Routing: `objekte.hanseatische-wohnungsgenossenschaft.de` is a parked domain
of the site; the root `.htaccess` (copy in `htaccess-root`) serves it from
`/objekte/`. DNS for the domain is at netcup: the subdomain needs an A record
`objekte` → `72.60.86.52` there (same as the other subdomains).
