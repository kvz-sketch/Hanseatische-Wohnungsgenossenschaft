import { process } from "../data/content";
import { Reveal } from "./Reveal";

export function Process() {
  return (
    <section className="relative overflow-hidden bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="font-serif-display text-[26px] font-normal text-navy sm:text-[28px]">
            So arbeiten wir mit Ihnen
          </h2>
        </Reveal>

        <div className="relative mt-10">
          <div className="absolute top-[22px] left-0 right-0 hidden h-px bg-navy/10 sm:block" />
          <Reveal
            delay={120}
            className="absolute top-[22px] left-0 hidden h-px w-full origin-left animate-draw bg-gradient-to-r from-koralle via-gold to-transparent sm:block"
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 130}>
                <div className="relative">
                  <div className="subheading relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-koralle text-[18px] text-white shadow-[0_8px_20px_rgba(249,119,104,0.35)]">
                    {p.step}
                  </div>
                  <h3 className="subheading mt-4 mb-1.5 text-[15px] text-navy">{p.title}</h3>
                  <p className="text-[12px] leading-relaxed text-muted">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
