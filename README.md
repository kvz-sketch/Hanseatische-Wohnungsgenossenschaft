# Gerlach Immobilien Gruppe (GIG) — Website

Landing page for the GIG group, recreated per the GIG wireframe brief (bolder
layered hero, full Navy/Gold/Koralle brand palette) with real content sourced
from [gerlachgroup.de](https://gerlachgroup.de/) and its linked subsidiary
sites.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Content

All copy, statistics, brand names, testimonials, team, and contact details in
`src/data/content.ts` are drawn from the public Gerlach Immobilien Gruppe
website. Update that file to refresh content as the source site changes.

## Deployment (netcup Webhosting)

`.github/workflows/deploy-netcup.yml` builds the site and uploads `dist/` to
netcup over FTPS (lftp) on every push to the default branch (or manually via
*Actions → Deploy to netcup → Run workflow*).

One-time setup:

1. In the netcup CCP, open the Webhosting product → WCP (Plesk) →
   *Websites & Domains → FTP Access* and create an FTP user for the site.
2. In GitHub, add these repository secrets under
   *Settings → Secrets and variables → Actions*:
   - `FTP_SERVER` — FTP host (shown in the WCP, e.g. the domain)
   - `FTP_USERNAME` / `FTP_PASSWORD` — the FTP user from step 1
   - `FTP_SERVER_DIR` (optional) — target folder ending in `/`,
     default `/httpdocs/`

Until `FTP_SERVER` is set, the workflow only builds and skips the upload.

## Hansea Grow (hanseagrow.de)

`sites/hansea-grow/` is a second, standalone site for Hansea Grow, rebuilt
from the content of the old Wix site in the GIG look and feel. It reuses the
GIG design tokens (`src/index.css`) and UI components, and builds to its own
`dist-grow/` folder for its own domain.

```bash
npm run dev:grow      # local dev server
npm run build:grow    # production build → dist-grow/
```

Pages keep the old URLs: `/`, `/mitgliederportal/`, `/impressum/`,
`/datenschutz/`. Member documents (PDFs) live in
`sites/hansea-grow/public/downloads/`, copy in `sites/hansea-grow/src/content.ts`.

Deployment: `.github/workflows/deploy-hansea-grow.yml` uploads `dist-grow/`
over FTPS. Add the secrets `GROW_FTP_SERVER`, `GROW_FTP_USERNAME`,
`GROW_FTP_PASSWORD` (optional `GROW_FTP_SERVER_DIR`, default `/httpdocs/`)
once the hosting account exists.

**Before go-live:** the Datenschutz page is a placeholder — the old site only
carried Wix sample text. Replace it with the reviewed privacy policy.
