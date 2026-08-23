import { valueProps } from "../data/content";
import { Card } from "./ui/Card";
import { Reveal } from "./Reveal";

export function ValueProps() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="font-serif-display text-[24px] text-navy sm:text-[26px]">
            Warum Genossenschaft und Gruppe
          </h2>
        </Reveal>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {valueProps.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <Card accent={v.accent} className="group h-full">
                <h3 className="subheading mb-1.5 text-[15px] text-navy transition-colors group-hover:text-koralle">
                  {v.title}
                </h3>
                <p className="text-[12px] leading-relaxed text-muted">{v.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
