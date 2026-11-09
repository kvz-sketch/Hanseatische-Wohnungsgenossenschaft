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
Beteiligungsges.mbH), copied unchanged. It still cites § 5 TMG (now § 5 DDG)
and the EU online dispute platform, which closed in July 2025.
