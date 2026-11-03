# Hostinger sites (public_html)

Exact copy of what runs in `public_html` of the Hostinger website
`hanseainvest-de-735810.hostingersite.com` (formerly darkseagreen-pelican-527830.hostingersite.com) (account u873563229).
All addresses below are parked on that one website; `.htaccess` routes each
host to its folder.

| Address | Served from |
|---|---|
| exposees.hanseatische-wohnungsgenossenschaft.de | root: `index.php` (password page + overview), Exposé pages `*.html`, `bilder/`, `pdf/` |
| hanseatische-wohnungsgenossenschaft.de, www. | 301 to exposees.… (keeps the path) |
| superreichensteuer.hanseatische-wohnungsgenossenschaft.de | `superreichensteuer/` (lead magnet „Reichensteuer 2027“) |
| 120wohnungen.hanseatische-wohnungsgenossenschaft.de | `120-wohnungen/` (lead magnet „Case Study 120 Wohnungen“) |

DNS for hanseatische-wohnungsgenossenschaft.de is at netcup; every address
above is an A record to `72.60.86.52`. Mail records stay at netcup.

## Lead magnets

- `index.html` is the landing page with the form. It posts straight to the
  HubSpot Forms API (portal `19607021`; form IDs are in each page's script).
- After a successful submit the browser stores a flag and opens the document
  page (`leitfaden.html` / `case-study.html`). Without the flag that page
  sends the visitor back to the form.
- The downloadable PDF in `assets/` is printed from the document page
  (A4 landscape, `@media print` rules in `assets/style.css`).

## Exposé overview password

`index.php` checks the password server-side against a bcrypt hash. To change
the password, generate a new hash with
`php -r 'echo password_hash("NEW-PASSWORD", PASSWORD_DEFAULT);'` and replace
`$hash` in `index.php`.

## Redeploying

Upload changed files into `public_html` (Hostinger File Manager, FTP, or the
Hostinger API). Uploading the whole folder as a zip with "deploy static
archive" replaces everything in `public_html`.

This folder is not part of the Vite site in the repository root and is not
touched by the netcup deploy workflow.
