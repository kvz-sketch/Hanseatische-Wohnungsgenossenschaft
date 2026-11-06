import { IS_WORDPRESS, wp, wpPost } from '../backend'

// In the WordPress build, leads go to the theme's REST endpoint, which stores
// each one as an "Anfrage" in wp-admin and emails the site admin. Other builds
// have no backend and only log the request.
//
// Every form sends the signed time stamp from the page (bots that post
// directly or within 3 seconds are dropped server-side) and its hidden
// honeypot field as "website".
export async function submitLead(payload: Record<string, unknown>) {
  if (IS_WORDPRESS) {
    await wpPost('lead', { website: '', ...payload, token: wp().leadToken })
    return
  }
  console.warn('No lead backend in this build; lead not sent', payload)
}
