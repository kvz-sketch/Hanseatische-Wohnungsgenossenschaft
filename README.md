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

### Re-scraping source content

This repo's `.mcp.json` configures the
[scrapegraph-mcp](https://github.com/ScrapeGraphAI/scrapegraph-mcp) MCP
server, which gives Claude Code AI-powered web scraping/extraction tools
(`scrape`, `extract`, `crawl_*`, etc.) useful for refreshing
`src/data/content.ts` from [gerlachgroup.de](https://gerlachgroup.de/) and
its subsidiary sites.

To use it, get an API key from the
[ScrapeGraph dashboard](https://dashboard.scrapegraphai.com/) and export it
before starting Claude Code:

```bash
export SGAI_API_KEY=your-api-key-here
```

The server itself runs on demand via `uvx` (from the
[`scrapegraph-mcp`](https://pypi.org/project/scrapegraph-mcp/) PyPI
package), so no local install step is required beyond having `uv`
available.
