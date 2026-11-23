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

# Landing page "Dieter Homburg" (working title)

`dieter-homburg/` is a standalone mini site for the same HWG domain, built from
the Full-Service brochure, in a simple light grey / white / navy look (not the
usual CI). Two self-contained files, no build step and no external assets
(system fonts, no Google Fonts):

- `index.html`: the page, with the contact form at the bottom
- `impressum.html`: Impressum in the same style

Deployed to `public_html/dieter-homburg/` of that site. Live at
https://exposees.hanseatische-wohnungsgenossenschaft.de/dieter-homburg/
(`hanseatische-wohnungsgenossenschaft.de/dieter-homburg/` forwards there via
the existing `.htaccess`). To redeploy, upload both files to the same folder.
For a subdomain of its own, add it as a parked domain and a rewrite rule like
the `120wohnungen.` one. Renaming later only means
renaming the folder and changing `PAGE_NAME` in the script.

## HubSpot form

The form posts to the HubSpot Forms API of the client's portal. At the bottom
of `index.html`, set:

- `HUBSPOT_PORTAL_ID`: the portal (Hub) ID
- `HUBSPOT_FORM_ID`: the form GUID (HubSpot → Marketing → Forms → form → Share)
- `HUBSPOT_REGION`: `eu1` for EU-hosted portals, otherwise `na1`

While these are placeholders (as now), the form runs in **test mode**: it
validates, shows the thank-you message and a "Testmodus" badge, and sends
nothing (the payload is logged to the browser console).

The HubSpot form must contain the fields `firstname`, `lastname`, `email`,
`phone` and `message`. The consent text is sent along as
`legalConsentOptions`. Before going live, check the Datenschutz link and the
provider in the footer and Impressum: both currently name Gerlach, and should
name whoever ends up receiving the leads.
