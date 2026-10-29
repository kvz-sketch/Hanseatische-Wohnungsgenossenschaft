# Deploying the dashboard

The dashboard is used only through https://marketing.gerlach-group.de. On
Hostinger (user `u873563229`) it is the website `gerlach-group.de`, with
`marketing.gerlach-group.de` parked on it. Its web root is
`~/domains/gerlach-group.de/public_html`.

## What else lives in that web root

| Path | What it is | Rule |
| --- | --- | --- |
| `hanseagrow/` | Root of the subdomain hanseagrow.gerlach-group.de (WordPress, set up in hPanel) | Never touch, never delete |
| `~/videoplan-data`, `~/prozesse-data`, `~/redaktionsplan-data` | Data of the PHP tools, outside the web root | Never touch |

So a deploy must only add or overwrite the files of the build. It must never
replace the whole web root.

## How to deploy

1. `npm run build`
2. Get upload credentials with the Hostinger MCP operation
   `hosting_files_generate-upload-url` (`username: u873563229`,
   `domain: gerlach-group.de`).
3. `TUS_URL=<url> TUS_AUTH=<auth_key> TUS_AUTH_REST=<rest_auth_key> scripts/deploy-hostinger.sh`
   uploads every file of `dist/` one by one and deletes nothing.
4. Check https://marketing.gerlach-group.de/dashboard serves the new
   `index-*.js`, and that Videoplan, Prozesse and Redaktionsplan still return
   their data.

**Never use `hosting_websites_deploy-static-site-archive` for this site.** It
replaces all of `public_html` and would delete `hanseagrow/` (it already
deleted the Redaktionsplan once, when that was only on the server).

The GitHub workflow `.github/workflows/deploy-hostinger.yml` (FTPS) is safe as
well: it only deletes stale files inside `assets/`.
