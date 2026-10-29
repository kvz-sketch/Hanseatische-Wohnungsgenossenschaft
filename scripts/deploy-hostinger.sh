#!/usr/bin/env bash
# Upload dist/ to the Hostinger website gerlach-group.de (served as
# marketing.gerlach-group.de) file by file over TUS. Nothing on the server is
# deleted, so folders that are not part of this build stay as they are:
#   hanseagrow/  root of the subdomain hanseagrow.gerlach-group.de
#   anything a colleague uploads directly
# Never deploy with hosting_websites_deploy-static-site-archive: it replaces
# the whole public_html and would wipe hanseagrow/.
#
#   TUS_URL=... TUS_AUTH=... TUS_AUTH_REST=... scripts/deploy-hostinger.sh
#
# The three values come from the Hostinger MCP operation
# hosting_files_generate-upload-url (username u873563229, domain
# gerlach-group.de): url, auth_key, rest_auth_key. Run `npm run build` first.
#
# Order: assets/ first, other files next, index.html last, so the live page
# never points at a file that isn't there yet. Old hashed files in assets/ are
# left behind; they are unreferenced and harmless.

set -euo pipefail
cd "$(dirname "$0")/../dist"
: "${TUS_URL:?}" "${TUS_AUTH:?}" "${TUS_AUTH_REST:?}"

upload() {
  local f="$1" size code
  size=$(stat -c%s "$f")
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$TUS_URL/$f?override=true" \
    -H "X-Auth: $TUS_AUTH" -H "X-Auth-Rest: $TUS_AUTH_REST" -H 'Tus-Resumable: 1.0.0' \
    -H "Upload-Length: $size" -H 'Upload-Offset: 0')
  [ "$code" = 201 ] || { echo "POST $f → $code" >&2; exit 1; }
  if [ "$size" -gt 0 ]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$TUS_URL/$f" \
      -H "X-Auth: $TUS_AUTH" -H "X-Auth-Rest: $TUS_AUTH_REST" -H 'Tus-Resumable: 1.0.0' \
      -H 'Upload-Offset: 0' -H 'Content-Type: application/offset+octet-stream' --data-binary @"$f")
    [ "$code" = 204 ] || { echo "PATCH $f → $code" >&2; exit 1; }
  fi
  echo "  $f"
}

{ find assets -type f; find . -type f ! -path './assets/*' ! -path ./index.html -printf '%P\n'; echo index.html; } |
  while read -r f; do upload "$f"; done
echo "uploaded $(find . -type f | wc -l) files"
