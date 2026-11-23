# HI Leitfaden (hanseainvest.de/leitfaden/)

Lead page for the ads: visitors enter their details on `/leitfaden/` and are
sent to `/leitfaden/download/`, where they read or download the guide
(`download/Hansea-Invest-Leitfaden.pdf`, the "Verlauf" version).

Plain static files, uploaded to `public_html/leitfaden/` next to WordPress
(Apache serves the folder directly; WordPress is not involved).

## Form

The form on `index.html` is a dummy: it checks the fields and opens
`download/`, it sends nothing. To connect HubSpot:

1. Replace the `<form id="lead-form">` and the script at the end of
   `index.html` with the HubSpot embed (as in `inc/elementor.php` of the
   theme), and remove the "Testformular" badge.
2. In HubSpot, set the form's "after submit" action to redirect to
   `https://hanseainvest.de/leitfaden/download/`.

`download/` is `noindex` (meta tag and `X-Robots-Tag` for the PDF), but anyone
with the link can open it; a static page cannot check that the form was sent.
