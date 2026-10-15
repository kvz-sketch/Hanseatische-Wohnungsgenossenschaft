# Daily refresh — Performance Marketing Report

The report at `/dashboard/performance-marketing-report` reads its numbers from
`/data/performance-report.json` on every page load. The source of that file is
`src/data/performance-report.json`. A daily scheduled Claude session refreshes
it by following the steps below. No rebuild is needed: only the JSON file is
replaced on the server.

**Sources**

| What | Where |
|---|---|
| Spend, reach, impressions, Meta results, status, budget | Meta Ads MCP, ad account **GIGxHansea** `1606528074401845` |
| Real lead counts and dates | Perspective MCP, workspace **Funnels** `6a7d902c7dab204368ae12c8` |
| Live site | Hostinger, user `u873563229`, domain `pink-scorpion-227708.hostingersite.com` |

Every report campaign in the JSON is pinned to its Meta object
(`meta: { level, id }`; most are Meta **ad sets**, the two Full-Service rows
are whole Meta **campaigns**). Each Perspective-backed campaign also carries
its funnel (`perspectiveFunnelId`), and each ad its Meta ad ID
(`metaAdId`). `scripts/refresh-report.mjs` does the merge. The steps below
only gather its two input files and publish the result.

## 1. Pull Meta → `.report-input/meta.json`

Call `ads_get_ad_entities` on account `1606528074401845` with
`date_preset: "maximum"` and `include_additional_context: false`, three
times plus one:

1. `level: "campaign"`, fields `id, name, effective_status, daily_budget, start_time, amount_spent, reach, impressions, results, cost_per_result`
2. `level: "adset"`, fields `id, name, campaign_id, effective_status, daily_budget, start_time, amount_spent, reach, impressions, results, cost_per_result`
3. `level: "ad"`, fields `id, name, adset_id, campaign_id, effective_status, amount_spent, reach, impressions, results, cost_per_result`, `limit: 500`
4. The same ad query again with
   `filtering: [{"field":"effective_status","operator":"IN","value":["DELETED","ARCHIVED"]}]`.
   Archived ads keep their spend, so the ad sums only match Meta's totals
   when these are included. Example: `01-HI_Immobilienwert_qualified Lead`,
   €20.20.

Follow `pagination.next_cursor` until it runs out. Write every row from
all four calls into one file:

```json
{
  "pulledAt": "YYYY-MM-DD",
  "entities": [
    { "level": "campaign", "id": "…", "name": "…", "status": "ACTIVE", "dailyBudget": 150, "startTime": "2026-09-29T11:05:06+0200",
      "spend": 2516.45, "reach": 25902, "impressions": 63955, "results": 17, "costPerResult": 148.03 },
    { "level": "adset", "id": "…", "name": "…", "parentId": "<campaign id>", "campaignId": "<campaign id>", "status": "…", "startTime": "…", "dailyBudget": null,
      "spend": 0, "reach": 0, "impressions": 0, "results": null, "costPerResult": null },
    { "level": "ad", "id": "…", "name": "…", "parentId": "<ad set id>", "campaignId": "<campaign id>", "status": "…",
      "spend": 0, "reach": 0, "impressions": 0, "results": null, "costPerResult": null }
  ]
}
```

- `status` = `effective_status`. `spend` = `amount_spent.value`.
- `results` = the number in `results.values[0].value`. Use `null` when Meta
  says "Not available". The same applies to `costPerResult`.
- Copy **reach** and **impressions** carefully: reach is always ≤
  impressions, and the script rejects swapped columns.

## 2. Pull Perspective → `.report-input/perspective.json`

Take the distinct `perspectiveFunnelId` values from
`src/data/performance-report.json`. For each one, call `list_contacts` with
`limit: 100`, paging (`page` 0, 1, …) until `meta.hasNext` is false. Write:

```json
{
  "pulledAt": "YYYY-MM-DD",
  "funnelsPulled": ["<every funnel id you pulled>"],
  "contacts": [
    { "funnelId": "…", "convertedAt": "<meta.ps_converted_at>", "email": "…", "phone": "…",
      "utmParams": { "utm_content": "…", "utm_term": "…", "utm_campaign": "…", "utm_id": "…" },
      "properties": { "hsa_ad": "…", "ad_id": "…", "hsa_grp": "…", "adset_id": "…", "hsa_cam": "…", "campaign_id": "…", "utm_id": "…" } }
  ]
}
```

- Copy the `utmParams` and those `properties` keys exactly as Perspective
  returns them, including placeholders like `{{ad.id}}`. The script decides
  which values are real IDs.
- `email` and `phone` are used **only** to drop repeat submissions by the
  same person. They never reach the report.
- Contacts without `ps_converted_at` never completed the form. Leave them
  out.

## 3. Merge

```sh
node scripts/refresh-report.mjs .report-input/meta.json .report-input/perspective.json
```

Read the output:

- `FAIL` means nothing was written. Fix the input and run again. Usually an
  ad is missing (archived ads not pulled), reach and impressions were
  swapped, or a funnel wasn't pulled.
- `WARN New ad …`: if a thumbnail exists in `src/assets/ads/`, set that
  ad's `image` to the filename without `.jpg`. Images only ship with a
  rebuild, so leave it otherwise; the card simply shows no thumbnail.
- `WARN Meta … has spend … but is not in the report`: a new campaign or ad
  set has started. If it is a lead campaign with spend, add a campaign entry
  to the JSON, using an existing one as the template:
  - `id` and `name`, plus `meta: { level, id }`
  - `objective`, `perspectiveFunnel`, `perspectiveFunnelUrl`, and either
    `perspectiveFunnelId` or `"leadSource": "meta-form"` for Meta lead forms
  - `ads: []`
  Then run step 3 again; the script fills in the numbers and ads. Find the
  funnel by matching the ads' landing page or the contacts' `utm_campaign`
  against `list_funnels` for workspace `6a7d902c7dab204368ae12c8`.
- `WARN … contact(s) … match no report campaign`: same cause. Map the
  campaign as above.

Fields the script never touches are maintained by hand: `leadStatus`,
`recommendations`, `videoUrl`, `badge`, `image`, `objective`,
`perspectiveFunnel(Url)`. The lead price is not stored anywhere: the page
divides spend by leads. For lead-form campaigns that means Meta form leads,
otherwise Perspective leads.

## 4. Check, commit, publish

1. `npm run build` must pass.
2. `git diff src/data/performance-report.json` should look like a normal
   day: spend and leads only go up, nothing disappears. Investigate anything
   else before publishing.
3. Commit as `Refresh performance report (YYYY-MM-DD)` and push to the
   working branch.
4. Upload the JSON to the live site with Hostinger's
   `hosting_files_generate-upload-url` (`username: u873563229`,
   `domain: pink-scorpion-227708.hostingersite.com`). Use TUS to
   `data/performance-report.json?override=true`, as in that operation's
   description: a `POST` with `Upload-Length`, then a `PATCH` with the bytes.
5. Verify:
   `curl -s https://pink-scorpion-227708.hostingersite.com/data/performance-report.json | head -c 200`
   must show the new `asOf`.

If Meta or Perspective is unreachable, stop and publish nothing. Yesterday's
numbers stay up, which is better than a half-updated report. Say what failed
in the session's final message.

`.report-input/` is git-ignored and holds personal data. Delete it when done.
