import { Hero } from "../components/Hero";
import { Marquee, StatsBar } from "../components/Highlights";
import { Genossenschaft, Story } from "../components/Story";
import { Benefits, Problems, Values } from "../components/Benefits";
import { About, HowItWorks } from "../components/About";
import { Book, Brands, LegalNote, Press, Transparency } from "../components/Showcase";
import { Faq } from "../components/Faq";
import { Contact } from "../components/Contact";

export function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <StatsBar />
      <Story />
      <Genossenschaft />
      <Benefits />
      <About />
      <HowItWorks />
      <Book />
      <Transparency />
      <Problems />
      <Press />
      <Values />
      <Brands />
      <LegalNote />
      <Faq />
      <Contact />
    </>
  );
}
