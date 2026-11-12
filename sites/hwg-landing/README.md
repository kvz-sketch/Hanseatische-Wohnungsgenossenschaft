# Taboola landing pages: Impressum

The lead-magnet pages of the Hanseatische Wohnungsgenossenschaft run on a
separate Hostinger site (`hanseainvest-de-735810.hostingersite.com`, served as
`superreichensteuer.` and `120wohnungen.hanseatische-wohnungsgenossenschaft.de`).
Only the files below are kept here; they are the live pages with the fixes
applied, ready to upload.

## Why Taboola rejected the pages

The pages named two different companies as the publisher:

- footer and Impressum: Gerlach Verwaltungs- und Beteiligungsges.mbH, HRB 153780
- "Herausgeber" line of the Leitfaden, the Case Study and both PDFs:
  Gerlach Immobilien GmbH, HRB 153880 (a different company)

Everything now names one provider: **Gerlach Verwaltungs- und
Beteiligungsges.mbH, Langenhorner Chaussee 155, 22415 Hamburg, Amtsgericht
Hamburg HRB 153780, USt-IdNr. DE320623851, Geschäftsführer Stephan Hilmar
Gerlach.**

## Upload (replace the existing files in `public_html`)

| File in this folder | Change |
| --- | --- |
| `superreichensteuer/impressum.html`, `120-wohnungen/impressum.html` | Full Impressum: provider, brands it operates, managing director, register, USt-IdNr. (§ 27a UStG), contact, § 18 Abs. 2 MStV, Verbraucherstreitbeilegung |
| `superreichensteuer/leitfaden.html`, `120-wohnungen/case-study.html` | Herausgeber line corrected |
| `superreichensteuer/assets/Leitfaden-Reichensteuer-2027.pdf`, `120-wohnungen/assets/Case-Study-120-Wohnungen.pdf` | Herausgeber line corrected in the PDF |
| `superreichensteuer/index.html`, `120-wohnungen/index.html` | Consent text names the legal entity |

## Still open: § 34c GewO

If the company holds a § 34c GewO permit, the Impressum must name it and the
supervisory authority (§ 5 Abs. 1 Nr. 3 DDG). Both `impressum.html` files
contain the section as an HTML comment: fill in the permit type and authority,
then remove the `<!--` and `-->` lines.
