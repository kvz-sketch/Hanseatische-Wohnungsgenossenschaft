# Weihnachts-Hörbuch: Landing Page & Anzeigen

Lead-Magnet zu Weihnachten: kostenloses Hörbuch zu Stephan Gerlachs Buch
„Immobilien-Investitionen leicht gemacht“. Läuft wie die anderen HWG-Lead-Seiten
auf der Hostinger-Site (z. B. als `hoerbuch.hanseatische-wohnungsgenossenschaft.de`).

| Datei | Zweck |
| --- | --- |
| `index.html` | Landing Page mit Formular (Vorname, E-Mail, Einwilligung) |
| `danke.html` | Danke-Seite, verweist auf das Calendly-Erstgespräch |
| `hoerbuch.php` | Nimmt das Formular an, schickt den Download-Link, benachrichtigt das Team, speichert den Lead als CSV |
| `impressum.html` | Impressum (wie bei den anderen Lead-Seiten) |
| `assets/` | Stylesheet, selbst gehostete Schriften (kein Google Fonts), Fotos, Siegel |
| `ads/png/` | 12 Anzeigenmotive (3 Konzepte × 4 Formate) |
| `ads/ANZEIGENTEXTE.md` | Texte für Meta und Taboola, UTM-Links |
| `ads/src/` | Vorlage und Skript, mit dem die Motive erzeugt werden |

## Vor dem Start

1. **Hörbuch-Datei hochladen** (z. B. ZIP der MP3s) und den Link in
   `hoerbuch.php` bei `HOERBUCH_URL` eintragen.
2. **Absender** `FROM_EMAIL` in `hoerbuch.php` auf ein Postfach setzen, das in
   hPanel für die Domain existiert (sonst landen Mails im Spam).
3. **Cover:** Die Seite zeigt ein gestaltetes Platzhalter-Cover. Sobald das echte
   Hörbuch-Cover vorliegt: als `assets/cover.jpg` ablegen und in `index.html`
   den Block `<div class="cover-art">…</div>` durch
   `<img class="cover-img" src="assets/cover.jpg" alt="">` ersetzen.
4. **Inhalte prüfen:** Die sechs Themen unter „Was Sie im Hörbuch erwartet“ sind
   aus der Buchbeschreibung abgeleitet – bitte mit dem Inhaltsverzeichnis
   abgleichen. Ebenso „MP3-Download“ (Format) und „Bestseller“ (welche Liste?).
5. **Tracking:** Meta-/Taboola-Pixel über den Cookie-Banner der Site einbinden;
   das Formular feuert bereits `fbq('track','Lead')` bzw. das Taboola-Event
   `lead`, wenn die Pixel geladen sind.

## Deploy

Live seit 24.11.2026 im Ordner `public_html/hoerbuch/` der Hostinger-Site
`hanseainvest-de-735810.hostingersite.com`:
**https://exposees.hanseatische-wohnungsgenossenschaft.de/hoerbuch/**

Hochgeladen wurden `index.html`, `danke.html`, `impressum.html`,
`hoerbuch.php`, `assets/` und `ads/png/a-geschenk-1200x674.png` (Vorschaubild
für Link-Vorschauen). `hoerbuch.php` schreibt die Leads nach
`/home/u873563229/domains/hanseainvest-de-735810.hostingersite.com/leads-hoerbuch-weihnachten.csv`
(außerhalb von `public_html`).

Solange `HOERBUCH_URL` nicht gesetzt ist, bekommt der Interessent keinen
Platzhalter-Link, sondern „Link folgt in Kürze“; die Team-Mail sagt dann, dass
der Link von Hand geschickt werden muss.

### Eigene Subdomain (optional)

Die DNS-Zone von hanseatische-wohnungsgenossenschaft.de liegt bei netcup. Für
`hoerbuch.hanseatische-wohnungsgenossenschaft.de`:

1. netcup CCP → DNS: A-Record `hoerbuch` → `72.60.86.52`.
2. Hostinger: die Subdomain als Parked Domain der Site hinzufügen.
3. In `public_html/.htaccess` (vor dem Block „Forgive links …“) ergänzen:

   ```apache
   # Lead magnet: hoerbuch.* is served from the /hoerbuch/ folder
   RewriteCond %{HTTP_HOST} ^hoerbuch\.hanseatische-wohnungsgenossenschaft\.de$ [NC]
   RewriteCond %{REQUEST_URI} !^/hoerbuch/
   RewriteRule ^(.*)$ /hoerbuch/$1 [L]

   RewriteCond %{HTTP_HOST} ^exposees\.hanseatische-wohnungsgenossenschaft\.de$ [NC]
   RewriteRule ^hoerbuch/(.*)$ https://hoerbuch.hanseatische-wohnungsgenossenschaft.de/$1 [R=301,L]
   ```

## Motive neu erzeugen

Nach Änderungen an `ads/src/ad.html` (vom Repository-Root):

```bash
node sites/hwg-landing/hoerbuch-weihnachten/ads/src/render.mjs
```
