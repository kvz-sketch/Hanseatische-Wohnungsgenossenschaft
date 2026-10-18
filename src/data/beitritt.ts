// Membership declaration (Beitrittserklärung) signed with DocuSign.
//
// WordPress: the theme creates the envelope and returns DocuSign's signing
// URL; after signing, DocuSign sends the member back to /mitglieder/?beitritt=zurueck
// and the dashboard asks the theme for the new status (inc/beitritt.php).
// Demo builds keep the declaration in memory and skip DocuSign.

import { IS_WORDPRESS, wp, wpPost, wpUrl } from '../backend'
import { SHARE_PRICE } from './content'

export type BeitrittStatus = 'entwurf' | 'unterschrieben' | 'abgelehnt' | 'storniert' | 'eingegangen'

export type BeitrittData = {
  birthDate: string
  street: string
  zip: string
  city: string
  phone: string
  units: number
}

export type Application = {
  status: BeitrittStatus
  data: BeitrittData
  submittedAt: string
  signedAt: string | null
  hasDocument: boolean
}

export type BeitrittConfig = {
  signingEnabled: boolean
  demo: boolean
  consent: { version: string; text: string }
  minUnits: number
  maxUnits: number
  sharePrice: number
  application: Application | null
}

const demoConfig: BeitrittConfig = {
  signingEnabled: false,
  demo: true,
  consent: {
    version: 'demo',
    text: 'Ich habe die Satzung, den Risikohinweis und die Datenschutzhinweise der Hanseatischen Invest eG erhalten und gelesen. Ich bin einverstanden, dass meine Angaben für die Beitrittserklärung an DocuSign übermittelt werden, damit ich sie digital unterschreiben kann.',
  },
  minUnits: 20,
  maxUnits: 4000,
  sharePrice: SHARE_PRICE,
  application: null,
}

export const beitrittConfig = (): BeitrittConfig => (IS_WORDPRESS ? (wp().beitritt ?? demoConfig) : demoConfig)

/** Saves the declaration; returns DocuSign's signing URL when online signing is set up. */
export async function startBeitritt(data: BeitrittData, consentVersion: string) {
  if (!IS_WORDPRESS) {
    const application: Application = { status: 'eingegangen', data, submittedAt: new Date().toISOString(), signedAt: null, hasDocument: false }
    return { application, url: null }
  }
  return wpPost<{ application: Application; url: string | null }>('beitritt/start', { ...data, consentVersion })
}

/** Fresh signing URL for an envelope that is not signed yet. */
export async function resumeBeitritt() {
  return (await wpPost<{ url: string }>('beitritt/resume', {})).url
}

/** Status after returning from DocuSign (the theme asks DocuSign, not the URL). */
export async function syncBeitritt() {
  if (!IS_WORDPRESS) return null
  return (await wpPost<{ application: Application | null }>('beitritt/sync', {})).application
}

export const beitrittDocumentUrl = () => (IS_WORDPRESS ? wpUrl('beitritt/document') : null)
