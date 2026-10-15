import { IS_WORDPRESS, wpPost } from '../backend'

// In the WordPress build, leads go to the theme's REST endpoint, which stores
// each one as an "Anfrage" in wp-admin and emails the site admin. Other builds
// have no backend and only log the request.
export async function submitLead(payload: Record<string, unknown>) {
  if (IS_WORDPRESS) {
    await wpPost('lead', payload)
    return
  }
  console.warn('No lead backend in this build; lead not sent', payload)
}
