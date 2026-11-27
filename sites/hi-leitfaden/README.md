# HI Leitfaden (hanseainvest.de/leitfaden/)

Lead page for the ads: visitors enter their details on `/leitfaden/` and are
sent to `/leitfaden/download/`, where they read or download the guide
(`download/Hansea-Invest-Leitfaden.pdf`, the "Verlauf" version).

Plain static files, uploaded to `public_html/leitfaden/` next to WordPress
(Apache serves the folder directly; WordPress is not involved).

## Form

The form on `index.html` is the HubSpot embed (portal 19607021, form
b91364d5-2395-488d-87bf-b366f43ee68b). Where visitors go after sending it is
set in HubSpot (form options, "after submit"): redirect to
`https://hanseainvest.de/leitfaden/download/`.

`download/` is `noindex` (meta tag and `X-Robots-Tag` for the PDF), but anyone
with the link can open it; a static page cannot check that the form was sent.
