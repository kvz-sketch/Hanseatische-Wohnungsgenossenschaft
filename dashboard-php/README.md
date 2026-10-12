# Marketing Dashboard (PHP) — Phase 1: Performance Marketing Report

A colleague-editable rebuild of the Performance Marketing Report, in plain
PHP + a database (MySQL in production, SQLite for local dev — same code,
just a different `DB_DRIVER`). Colleagues log in with one shared password
and their own name, can leave feedback on any campaign or ad (including the
videos), and can edit a campaign's note and active/off status. Every edit is
logged (who, what, when) and shown under the field.

Everything else — spend, reach, impressions, Meta results, Perspective
leads — stays read-only: it's sourced from Meta/Perspective pulls, not
something a colleague should be able to accidentally overwrite.

**Phase 2** (not built yet): Brand Book and Social Media Report, once this
page is live and the editable-fields list is confirmed to be the right one.

## One-time setup on netcup (Plesk)

You need a PHP-capable (sub)domain and a MySQL database. If you already have
both, skip to "GitHub secrets" below.

1. **Create the (sub)domain**, if it doesn't exist yet — e.g.
   `marketing.gerlachgroup.de` (the existing public site's preview banner
   already names this as the intended final home). In Plesk: *Websites &
   Domains → Add Subdomain*.
2. **Create a database.** In Plesk: *Websites & Domains → Databases → Add
   Database*. Name it something like `gig_dashboard`. Plesk will prompt you
   to add a database user — create one and **write down the password**, you
   won't see it again.
3. **Note the connection details** Plesk shows you:
   - Database host (often `localhost` — Plesk shows the exact value)
   - Database name
   - Database username
   - Database password (the one you just set)
4. **Create an FTP user** for the (sub)domain if you don't already have one:
   *Websites & Domains → [your subdomain] → FTP Access → Add FTP Account*.

## GitHub secrets

In the repo: *Settings → Secrets and variables → Actions → New repository
secret*. Add:

| Secret | Value |
|---|---|
| `DASHBOARD_FTP_SERVER` | FTP host from Plesk |
| `DASHBOARD_FTP_USERNAME` | the FTP user from step 4 |
| `DASHBOARD_FTP_PASSWORD` | that FTP user's password |
| `DASHBOARD_FTP_SERVER_DIR` | (optional) target folder, default `/httpdocs/` |

Pushing to `claude/wonderful-franklin-fhyoau` with changes under
`dashboard-php/` now deploys the *code* automatically. It does **not**
deploy `.env.php` (see next section) — that holds real secrets and is
uploaded once, by hand, outside of git.

## `.env.php` — the one file you upload manually

Copy `.env.php.example` to `.env.php`, fill in the real values from step 3
above and a password of your choosing for colleagues to log in with, then
upload just that one file to the same folder as `index.php` on the server
(any FTP client, or Plesk's File Manager). It's git-ignored on purpose —
never commit real credentials.

```php
<?php
putenv('DB_DRIVER=mysql');
putenv('DB_HOST=localhost');        // from Plesk
putenv('DB_NAME=gig_dashboard');    // from Plesk
putenv('DB_USER=...');              // from Plesk
putenv('DB_PASS=...');              // from Plesk

putenv('DASHBOARD_PASSWORD=...');   // pick something and share it with colleagues
```

## Loading the data

The database starts empty. Either run `seed.php` once via SSH
(`php seed.php`) if you have shell access on the host, or visit
`https://marketing.gerlachgroup.de/seed.php?key=<DASHBOARD_PASSWORD>` in a
browser once the code and `.env.php` are both uploaded. It's safe to re-run:
it reloads campaigns/ads/leads from `seed-data.php` but never touches
colleague comments or the edit history.

**After confirming the seed worked, delete or rename `seed.php` on the
server** (or at least don't leave the URL lying around) — right now anyone
who knows the dashboard password can wipe and reseed campaign data, which
is more power than a feedback form needs.

## Local development

No MySQL needed — it defaults to SQLite, stored at `dashboard-php/data/`
(git-ignored).

```bash
cd dashboard-php
php seed.php
php -S 127.0.0.1:8099
```

Then open `http://127.0.0.1:8099/` — default local password is `change-me`
(set in `config.php`'s default) unless you create a local `.env.php` to
override it.

## Updating the seeded data

When `src/data/performanceReport.ts` changes, update `seed-data.php` and
`seed-funnel-extra.php` to match, then reseed. Keeping two hand-maintained
copies in sync isn't ideal — a follow-up could write a script that
generates `seed-data.php` from the TypeScript file directly.
