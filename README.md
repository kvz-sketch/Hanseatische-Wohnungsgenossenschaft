# Hanseatische Invest eG — Website

Rebuild of the Hanseatische Invest eG pages from the reference design at
hansea.neo-labs.ai: the landing page (with calculator, share tracking, track
record, FAQ) and the projects overview.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`), Manrope self-hosted via Fontsource

## Pages

| URL          | Entry                                            |
| ------------ | ------------------------------------------------ |
| `/`          | `index.html` → `src/pages/Home.tsx`              |
| `/projekte/` | `projekte/index.html` → `src/pages/Projekte.tsx` |

Each page is its own HTML file (Vite multi-page build), so `dist/` runs on
any static host without rewrite rules.

## Development

```bash
npm install
npm run dev
npm run build && npm run preview
```

## Content

Copy, figures and project lists live in `src/data/content.ts`.

## Open items

- Lead forms (`src/components/LeadForms.tsx`) have no backend yet: set
  `LEAD_ENDPOINT` to start receiving requests.
- Impressum, Datenschutz, Risikohinweis, Satzung, Magazin and Mitglieder-Login
  are placeholder links.

## Deployment (netcup Webhosting)

`.github/workflows/deploy-netcup.yml` builds the site and uploads `dist/` to
netcup over FTPS (lftp). See the workflow file for the required secrets.
