// Lead forms have no backend yet. Set this to an endpoint that accepts a JSON
// POST (e.g. a small PHP script on the host) to start receiving requests.
const LEAD_ENDPOINT = ''

export async function submitLead(payload: Record<string, unknown>) {
  if (!LEAD_ENDPOINT) {
    console.warn('LEAD_ENDPOINT is not configured; lead not sent', payload)
    return
  }
  const res = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Lead endpoint responded ${res.status}`)
}
