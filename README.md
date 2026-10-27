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

## Hansea Invest landing page (`/hansea-invest/`)

Taboola campaign page for the Hanseatische Invest eG, built as a second Vite
entry (`hansea-invest/index.html` → `src/hansea-invest/`). It is deployed with
the homepage and served at `/hansea-invest/`. Copy and product facts live in
`src/hansea-invest/content.ts`; values marked `VERIFY` must be checked against
the Satzung / Beitrittsunterlagen before the campaign goes live. Ad copy:
`marketing/taboola/hansea-invest-native-ads.md`.

Leads go straight into HubSpot via the HubSpot form embedded in the hero card.
Set `region`, `portalId`, `formId` and `embed` in the `hubspot` block of
`src/hansea-invest/content.ts` (values are in the form's embed code; `embed` is
`"frame"` for forms from the new forms editor, `"legacy"` for
`hbspt.forms.create` forms). Fields, consent text, thank-you message and form
styling are managed in HubSpot.

For campaign attribution, add hidden fields to the HubSpot form named `tblci`,
`utm_source`, `utm_campaign` and `utm_content`; HubSpot fills them from the URL
query string. Taboola tracking templates should append e.g.
`?tblci={click_id}&utm_source=taboola&utm_campaign={campaign_name}&utm_content={campaign_item_id}`.

`VITE_TABOOLA_ACCOUNT_ID` (build-time env var) fires Taboola's `lead` event when
the HubSpot form is submitted, provided the Taboola pixel was loaded (via the
consent tool / tag manager).
