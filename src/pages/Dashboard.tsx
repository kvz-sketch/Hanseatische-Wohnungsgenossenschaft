import { useEffect, useState } from 'react'
import { currentMember, logout, type Member } from '../auth/auth'
import Beitritt from '../components/Beitritt'
import Calculator from '../components/Calculator'
import Faq from '../components/Faq'
import Footer from '../components/Footer'
import Header from '../components/Header'
import HowItWorks from '../components/HowItWorks'
import { CallbackForm } from '../components/LeadForms'
import ProjectList from '../components/ProjectList'
import ShareTracker from '../components/ShareTracker'
import TrackRecord from '../components/TrackRecord'
import { navigate } from '../routes'
import { company, exampleShares, nextPayout, SHARE_PRICE } from '../data/content'

const memberNav = [
  { label: 'Übersicht', href: '#uebersicht' },
  { label: 'Beitritt', href: '#beitritt' },
  { label: 'Meine Anteile', href: '#verfolgen' },
  { label: 'Projekte', href: '#projekte' },
  { label: 'Bilanz', href: '#bilanz' },
  { label: 'Rechner', href: '#rechner' },
  { label: 'FAQ', href: '#faq' },
]

const euro = (v: number, digits = 0) =>
  `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)} €`

// Sample portfolio shown to every member until real data is connected
const units = exampleShares.reduce((sum, s) => sum + s.units, 0)
const invested = units * SHARE_PRICE
const quarterly = (invested * 0.07) / 4
const paidSoFar = quarterly * 2

function greeting() {
  const h = new Date().getHours()
  return h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'
}

function Welcome({ member }: { member: Member }) {
  const kpis = [
    { label: 'Ihre Einlage', value: euro(invested), note: `${units} Anteile à ${euro(SHARE_PRICE)}` },
    { label: 'Anteilspakete', value: String(exampleShares.length), note: 'in Kiel, Oldenburg und Hamburg' },
    { label: 'Bisher ausgeschüttet', value: euro(paidSoFar, 2), note: 'Q2 und Q3 2026' },
    { label: 'Nächste Ausschüttung', value: euro(quarterly, 2), note: `am ${nextPayout.date} (Ziel)`, accent: true },
  ]
  return (
    <section id="uebersicht" className="scroll-mt-20 bg-navy-gradient px-5 pt-12 pb-14 text-white">
      <div className="container-site">
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Mitgliederbereich</p>
          <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[12px] font-bold text-gold-700">Beispieldaten</span>
        </div>
        <h1 className="m-0 mt-3 text-[clamp(30px,3.6vw,44px)] leading-tight font-display font-normal">
          {greeting()}, {member.firstName} {member.lastName}
        </h1>
        <p className="m-0 mt-3 max-w-[720px] text-[17px] text-lighter-dark">
          Hier sehen Sie, wo Ihr Geld gerade arbeitet. Ihre tatsächlichen Anteile erscheinen hier, sobald sie Ihrem Konto
          zugeordnet sind.
        </p>

        <dl className="m-0 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <a href={company.phoneHref} className="font-bold text-white underline">
              {company.phone}
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
      <Header nav={memberNav} aside={aside} cta={{ label: 'Rückruf anfordern', href: '#termin' }} homeHref="#uebersicht" />
      <main>
        <Welcome member={member} />
        <Beitritt />
        <ShareTracker />
        <ProjectList />
        <TrackRecord />
        <HowItWorks />
        <Calculator />
        <Service />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
