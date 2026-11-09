import { Button, Card, GhostWord, Reveal } from "./shared";
import { Icon } from "./Icon";
import { SectionTitle } from "./SectionTitle";
import { benefits, links, problems, values } from "../content";

export function Benefits() {
  return (
    <section id="vorteile" className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <GhostWord className="text-navy">Vorteile</GhostWord>
      <div className="relative mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Deine Vorteile"
          intro={
            <>
              Entdecke, warum <strong className="text-navy">Hansea Grow</strong> der richtige
              Partner für deinen langfristigen Vermögensaufbau ist.
            </>
          }
        >
          Klar, sicherheitsorientiert, digital
        </SectionTitle>
        <Reveal delay={80} className="mt-7 flex flex-wrap gap-3">
          <Button variant="gold" size="md" href="#so-funktionierts">
            Mehr erfahren
          </Button>
          <Button variant="primary" size="md" href={links.beitritt} target="_blank" rel="noreferrer">
            Zum Beitrittsformular
          </Button>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 100}>
              <div className="group relative h-full overflow-hidden rounded-md bg-gradient-to-br from-navy-light to-navy p-7 text-white shadow-[0_10px_30px_rgba(20,26,70,0.18)] transition-transform duration-300 hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-koralle via-gold to-transparent" />
                <span className="subheading absolute right-5 top-4 text-[40px] leading-none text-white/[0.07]">
                  0{i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gold transition-colors group-hover:bg-koralle group-hover:text-white">
                  <Icon name={b.icon} />
                </span>
                <h3 className="subheading mt-5 text-[16px]">{b.title}</h3>
                <div className="my-3 h-px bg-white/15" />
                <p className="text-[13px] leading-relaxed text-fog">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Problems() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle eyebrow="Ausgangslage">
          Warum klassische Geldanlage heute nicht mehr reicht
        </SectionTitle>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <Card accent="koralle" className="h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-koralle/12 text-koralle">
                  <Icon name="x" className="h-5 w-5" strokeWidth={2.6} />
                </span>
                <h3 className="subheading mt-4 text-[15.5px] text-navy">{p.title}</h3>
                <div className="my-3 h-px bg-line" />
                <p className="text-[13px] leading-relaxed text-muted">{p.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Values() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle eyebrow="Unser Anspruch">Wachsen mit Klarheit und Verantwortung</SectionTitle>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <Card accent="gold" className="group h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold-deep transition-colors group-hover:bg-gold group-hover:text-navy">
                  <Icon name={v.icon} />
                </span>
                <h3 className="subheading mt-4 text-[15.5px] text-navy transition-colors group-hover:text-koralle">
                  {v.title}
                </h3>
                <div className="my-3 h-px bg-line" />
                <p className="text-[13px] leading-relaxed text-muted">{v.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
