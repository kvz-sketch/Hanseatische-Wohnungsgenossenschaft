import { useEffect, useState } from 'react'
import { currentMember, logout, type Member, type Portfolio } from '../auth/auth'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { CallbackForm } from '../components/LeadForms'
import MemberDocuments from '../components/MemberDocuments'
import MemberEvents from '../components/MemberEvents'
import ProjectList from '../components/ProjectList'
import ShareTracker from '../components/ShareTracker'
import TrackRecord from '../components/TrackRecord'
import { navigate } from '../routes'
import { anteile, company, MEMBER_SERVICE_BOOKING_URL, memberUnits, nextPayout, SHARE_PRICE } from '../data/content'

const euro = (v: number, digits = 0) =>
  `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)} €`

// Sample figures for accounts that are not (yet) linked to the Mitgliederliste
const SAMPLE = { units: memberUnits, invested: memberUnits * SHARE_PRICE }

const isoDate = (iso: string) => iso.split('-').reverse().join('.')

function greeting() {
  const h = new Date().getHours()
  return h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'
}

function kpisFor(p: Portfolio | null | undefined) {
  if (!p) {
    const quarterly = (SAMPLE.invested * 0.07) / 4
    return [
      { label: 'Ihre Einlage', value: euro(SAMPLE.invested), note: `${anteile(SAMPLE.units)} à ${euro(SHARE_PRICE)}` },
      { label: 'Bisher ausgeschüttet', value: euro(quarterly * 2, 2), note: 'Q2 und Q3 2026' },
      { label: 'Nächste Ausschüttung', value: euro(quarterly, 2), note: `am ${nextPayout.date} (Ziel)`, accent: true },
    ]
  }
  const units = anteile(Number(p.anteile.toFixed(2)))
  return [
    {
      label: 'Ihre Einlage',
      value: euro(p.einlage),
      note: p.einlage > 0 ? `${units}${p.nr ? ` · Mitglied Nr. ${p.nr}` : ''}` : `${units} · Einzahlung noch nicht verbucht`,
    },
    p.zinszahlungen.length > 0
      ? { label: 'Bisher ausgezahlt', value: euro(p.ausgezahlt, 2), note: `Zinsen brutto · Ziel ${euro(p.zinsenJahr)} im Jahr (7 % p.a.)` }
      : { label: 'Zinsen im Jahr', value: euro(p.zinsenJahr, 2), note: '7 % p.a. Zielverzinsung, nicht garantiert' },
    p.next
      ? { label: 'Nächste Zinszahlung', value: euro(p.next.amount, 2), note: `bis ${isoDate(p.next.date)} (Ziel)`, accent: true }
      : { label: 'Nächste Zinszahlung', value: '–', note: 'Sobald Ihre Einzahlung verbucht ist', accent: true },
  ]
}

function Welcome({ member }: { member: Member }) {
  const p = member.portfolio
  const kpis = kpisFor(p)
  const payments = p?.zeichnungen.filter((z) => z.betrag) ?? []
  return (
    <section id="uebersicht" className="scroll-mt-20 bg-navy-gradient px-5 pt-12 pb-14 text-white">
      <div className="container-site">
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Mitgliederbereich</p>
          {!p && <span className="rounded-control bg-gold-100 px-2.5 py-0.5 text-[12px] font-bold text-gold-700">Beispieldaten</span>}
        </div>
        <h1 className="m-0 mt-3 text-[clamp(30px,3.6vw,44px)] leading-tight font-display font-normal">
          {greeting()}, {member.firstName} {member.lastName}
        </h1>
        <p className="m-0 mt-3 max-w-[720px] text-[17px] text-lighter-dark">
          {p
            ? `Ihre Anteile${p.since ? ` seit ${isoDate(p.since)}` : ''} und wo Ihr Geld gerade arbeitet.`
            : 'Hier sehen Sie, wo Ihr Geld gerade arbeitet. Ihre tatsächlichen Anteile erscheinen hier, sobald sie Ihrem Konto zugeordnet sind.'}
        </p>

        <dl className="m-0 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-card border border-white/15 bg-white/5 p-5">
              <dt className="text-[13px] text-light-dark">{k.label}</dt>
              <dd className="m-0 mt-2">
                <span className={`block text-[28px] leading-none font-display font-normal tabular-nums ${k.accent ? 'text-gold-400' : ''}`}>
                  {k.value}
                </span>
                <span className="mt-2 block text-[13px] text-muted-dark">{k.note}</span>
              </dd>
            </div>
          ))}
        </dl>

        {p && (payments.length > 1 || p.kuendigungen.length > 0 || p.zinszahlungen.length > 0) && (
          <details className="mt-4 rounded-card border border-white/15 bg-white/5 px-5 py-4 text-[14px]">
            <summary className="cursor-pointer font-semibold text-white">Ihre Einzahlungen und Zinszahlungen</summary>
            <ul className="m-0 mt-3 list-none p-0 text-lighter-dark">
              {payments.map((z, i) => (
                <li key={i} className="flex justify-between gap-4 border-t border-white/10 py-2 tabular-nums">
                  <span>{z.zahlung ? isoDate(z.zahlung) : 'Datum folgt'} · {anteile(z.anteile ?? 0)}</span>
                  <span>{euro(z.betrag ?? 0)}</span>
                </li>
              ))}
              {[...p.zinszahlungen].sort((a, b) => a.datum.localeCompare(b.datum)).map((z, i) => (
                <li key={`z${i}`} className="flex justify-between gap-4 border-t border-white/10 py-2 tabular-nums">
                  <span>{isoDate(z.datum)} · Zinsen{z.zeitraum ? ` bis ${isoDate(z.zeitraum)}` : ''}</span>
                  <span className="text-gold-400">+ {euro(z.betrag ?? 0, 2)}</span>
                </li>
              ))}
              {p.kuendigungen.map((k, i) => (
                <li key={`k${i}`} className="flex justify-between gap-4 border-t border-white/10 py-2 tabular-nums">
                  <span>Gekündigt: {anteile(k.anteile ?? 0)}</span>
                  <span>{k.zum ? `zum ${isoDate(k.zum)}` : 'Termin folgt'}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  )
}

function Service() {
  return (
    <section id="kontakt" className="section bg-navy-gradient text-white">
      <div className="container-site grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-[120px]">
        <div>
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Mitgliederservice</p>
          <h2 className="h2 mt-3">Fragen zu Ihren Anteilen?</h2>
          <p className="m-0 mt-4 text-[17px] leading-relaxed text-lighter-dark">
            Aufstocken, Kündigung, Ausschüttungen oder Steuerbescheinigung: Ihr Berater ruft Sie im gewählten Zeitfenster an.
          </p>
          <p className="m-0 mt-6 text-[15px] leading-loose text-lighter-dark">
            <a href={MEMBER_SERVICE_BOOKING_URL} target="_blank" rel="noopener" className="font-bold text-white underline">
              Termin mit Cornelia Richter buchen
            </a>
            <br />
            <a href={`mailto:${company.email}`} className="text-white underline">
              {company.email}
            </a>
          </p>
        </div>
        <CallbackForm />
      </div>
    </section>
  )
}

export default function Dashboard() {
  const [member] = useState(currentMember)
  // No session: send the visitor to the login page
  useEffect(() => {
    if (!member) navigate('login', { replace: true })
  }, [member])
  if (!member) return null

  const aside = (
    <>
      <span className="text-[14px] text-muted">{member.email}</span>
      <button
        type="button"
        onClick={async () => {
          await logout()
          navigate('home')
        }}
        className="cursor-pointer rounded-control border-2 border-navy-200 bg-transparent px-4 py-2 text-[14px] font-semibold text-ink hover:border-ink hover:bg-navy-050"
      >
        Abmelden
      </button>
    </>
  )

  return (
    <>
      <Header nav={[]} aside={aside} cta={{ label: 'Rückruf anfordern', href: '#termin' }} homeHref="#uebersicht" />
      <main>
        <Welcome member={member} />
        {/* Beitrittserklärung (components/Beitritt.tsx) is hidden for now; add <Beitritt /> back here to show it */}
        <ShareTracker next={member.portfolio === undefined ? undefined : member.portfolio?.next ?? null} />
        <ProjectList />
        <TrackRecord />
        <MemberEvents />
        <MemberDocuments />
        <Service />
      </main>
      <Footer />
    </>
  )
}
