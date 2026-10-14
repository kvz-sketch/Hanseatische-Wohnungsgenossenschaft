import Footer from '../components/Footer'
import Header, { LoginLink } from '../components/Header'
import { AboutWithStats, AtAGlance, BookBanner, LandingHero } from '../components/landing/Intro'
import {
  BrokerBanner,
  CaseStudyNumbers,
  ContactSection,
  PressSection,
  PublicFaq,
  Sponsoring,
  Subsidiaries,
} from '../components/landing/More'
import { CapitalSteps, CaseStudies, Team, TrustBanner, WebinarBanner } from '../components/landing/Proof'
import { publicNav } from '../data/landing'

export default function Landing() {
  return (
    <>
      <Header nav={publicNav} aside={<LoginLink />} cta={{ label: 'Jetzt informieren', href: '/#kontakt' }} />
      <main>
        <LandingHero />
        <AboutWithStats />
        <AtAGlance />
        <BookBanner />
        <CapitalSteps />
        <TrustBanner />
        <CaseStudies />
        <WebinarBanner />
        <Team />
        <PressSection />
        <CaseStudyNumbers />
        <Subsidiaries />
        <BrokerBanner />
        <PublicFaq />
        <Sponsoring />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
