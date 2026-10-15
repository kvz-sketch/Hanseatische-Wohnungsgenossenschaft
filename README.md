# Hanseatische Invest eG — Website

Public landing page (built from the Hansea Invest wireframe brief) plus a
members' area: members create an account with email and password, log in, and
see their dashboard with shares, projects, track record and calculator.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`), Manrope self-hosted via Fontsource

## Pages

| URL            | Entry                                                   |
| -------------- | ------------------------------------------------------- |
| `/`            | `index.html` → `src/pages/Landing.tsx`                  |
| `/login/`      | `login/index.html` → `src/pages/Login.tsx` (login + registration) |
| `/mitglieder/` | `mitglieder/index.html` → `src/pages/Dashboard.tsx` (requires login) |

Each page is its own HTML file (Vite multi-page build), so `dist/` runs on
any static host without rewrite rules.

## Development

```bash
npm install
npm run dev
npm run build && npm run preview
```

### Single-file preview

```bash
npm run build:preview
```

Writes `dist-preview/hansea-invest-vorschau.html`: all three pages in one
self-contained file (images and fonts inlined) that opens without a server.
The explainer film is left out to keep the file small.

## Content

- Landing page copy: `src/data/landing.ts`
- Dashboard figures, sample shares and project lists: `src/data/content.ts`

## WordPress theme (live site)

`wordpress/hansea-invest/` is a WordPress theme that serves the same pages:
`/` (landing), `/login/` (login + registration) and `/mitglieder/` (dashboard,
redirects to the login when not signed in).

```bash
npm run build:wordpress   # builds into wordpress/hansea-invest/dist
```

Then upload the `hansea-invest` folder to `wp-content/themes/` and activate it.
The theme provides REST endpoints under `/wp-json/hansea/v1/` (`register`,
`login`, `logout`, `lead`). Members are WordPress users with the subscriber
role; password reset uses WordPress's own email flow. Lead form submissions
appear in wp-admin under *Anfragen* and are emailed to the admin address.

## Authentication (demo)

Outside the WordPress build, `src/auth/auth.ts` stores accounts and the session in the browser's
localStorage (passwords as salted PBKDF2 hashes). This is a preview only: it is
not a security boundary and accounts don't sync between devices. When the site
moves to WordPress, swap these functions for WordPress user accounts; the pages
only use `register`, `login`, `logout` and `currentMember`.

Every member currently sees the same sample portfolio (marked "Beispieldaten").

## Open items

- Lead forms only reach a backend in the WordPress build.
- Impressum, Datenschutz, Risikohinweis, Satzung, book shop and press links
  are placeholders (`href="#"`).
- Image and logo placeholders (striped boxes) wait for real photos.

## Deployment (netcup Webhosting)

`.github/workflows/deploy-netcup.yml` builds the site and uploads `dist/` to
netcup over FTPS (lftp). See the workflow file for the required secrets.
