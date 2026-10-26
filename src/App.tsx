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
import { RouterProvider, usePath } from "./router";
import { MarketingDashboard } from "./pages/MarketingDashboard";
import { BrandBook } from "./pages/BrandBook";
import { PerformanceMarketingReport } from "./pages/PerformanceMarketingReport";
import { VideoPlan } from "./pages/VideoPlan";
import { Bildmaterial } from "./pages/Bildmaterial";

function Site() {
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

function Routes() {
  const path = usePath();
  if (path === "/website") return <Site />;
  if (path === "/dashboard/brandbook") return <BrandBook />;
  if (path === "/dashboard/performance-marketing-report") return <PerformanceMarketingReport />;
  if (path === "/dashboard/videoplan") return <VideoPlan />;
  if (path === "/dashboard/bildmaterial") return <Bildmaterial />;
  return <MarketingDashboard />;
}

function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  );
}

export default App;
