import About from '../components/About'
import Calculator from '../components/Calculator'
import Faq from '../components/Faq'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import ProjectsTeaser from '../components/ProjectsTeaser'
import ShareTracker from '../components/ShareTracker'
import TrackRecord from '../components/TrackRecord'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ShareTracker />
        <ProjectsTeaser />
        <TrackRecord />
        <HowItWorks />
        <Calculator />
        <About />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
