import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { StatsBar } from "./components/StatsBar";
import { BrandArchitecture } from "./components/BrandArchitecture";
import { BrandGrid } from "./components/BrandGrid";
import { ValueProps } from "./components/ValueProps";
import { Process } from "./components/Process";
import { AboutUs } from "./components/AboutUs";
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
        <AboutUs />
        <Testimonials />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
