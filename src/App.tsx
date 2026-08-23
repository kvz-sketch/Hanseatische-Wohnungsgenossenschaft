import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { StatsBar } from "./components/StatsBar";
import { BrandArchitecture } from "./components/BrandArchitecture";
import { BrandGrid } from "./components/BrandGrid";
import { ValueProps } from "./components/ValueProps";
import { Process } from "./components/Process";
import { AboutTeam } from "./components/AboutTeam";
import { Testimonials } from "./components/Testimonials";
import { FAQSection } from "./components/FAQSection";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <StatsBar />
        <BrandArchitecture />
        <ValueProps />
        <BrandGrid />
        <Process />
        <AboutTeam />
        <Testimonials />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
