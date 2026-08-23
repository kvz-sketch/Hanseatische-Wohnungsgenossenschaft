import { aboutIntro, serviceModel, team } from "../data/content";
import { Button } from "./ui/Button";
import { Reveal } from "./Reveal";
import { InteriorArt } from "./InteriorArt";

export function AboutUs() {
  return (
    <section id="ueber-uns" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-11 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
              {aboutIntro.eyebrow}
            </span>
            <h2 className="subheading mt-3 max-w-[480px] text-[26px] leading-[1.25] text-navy sm:text-[30px]">
              {aboutIntro.heading}
            </h2>
            <p className="mt-5 max-w-[480px] text-[13.5px] leading-relaxed text-ink">
              {aboutIntro.paragraph}
            </p>
            <Button variant="koralle" size="md" href="#kontakt" className="mt-7 uppercase tracking-[0.08em]">
              Kontakt
            </Button>
          </Reveal>

          <Reveal delay={140} className="overflow-hidden rounded-md shadow-[0_20px_44px_rgba(20,26,70,0.14)]">
            <InteriorArt className="h-[280px] w-full sm:h-[340px]" />
          </Reveal>
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <Reveal>
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
              Unser Full-Service-Modell
            </span>
            <h3 className="subheading mt-3 max-w-[560px] text-[20px] text-navy sm:text-[22px]">
              Die gesamte Wertschöpfungskette — von Bestandsimmobilien bis zur Kapitalanlage
            </h3>
          </Reveal>

          <div className="relative mt-9">
            <div className="absolute top-[22px] left-0 right-0 hidden h-px bg-navy/10 sm:block" />
            <Reveal
              delay={120}
              className="absolute top-[22px] left-0 hidden h-px w-full origin-left animate-draw bg-gradient-to-r from-koralle via-gold to-transparent sm:block"
            />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {serviceModel.map((s, i) => (
                <Reveal key={s.step} delay={i * 110}>
                  <div className="relative">
                    <div className="subheading relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy text-[16px] text-white shadow-[0_8px_20px_rgba(20,26,70,0.3)]">
                      {s.step}
                    </div>
                    <h4 className="subheading mt-4 mb-1.5 text-[14px] text-navy">{s.title}</h4>
                    <p className="text-[12px] leading-relaxed text-muted">{s.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Reveal delay={160} className="mt-16 rounded-md bg-navy p-7 shadow-[0_20px_44px_rgba(20,26,70,0.2)]">
          <div className="subheading mb-4 text-[11px] uppercase tracking-[0.14em] text-fog">
            Leitung
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="border-l-2 border-gold pl-3 transition-colors hover:border-koralle"
              >
                <div className="subheading text-[13.5px] text-white">{m.name}</div>
                <div className="text-[11px] text-fog">{m.role}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
