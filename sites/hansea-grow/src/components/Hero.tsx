import { Badge, Button, CountUp, GhostWord, Reveal } from "./shared";
import { heroImg, links } from "../content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-koralle" />
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-koralle/20 blur-[110px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">Grow</GhostWord>

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-11 lg:py-32">
        <div>
          <Reveal>
            <span className="subheading text-[11px] uppercase tracking-[0.22em] text-gold">
              Hansea Grow · Hanseatische Wohnungsgenossenschaft eG
            </span>
          </Reveal>

          <Reveal delay={60} className="mt-4 mb-6 flex flex-wrap gap-2">
            <Badge variant="gold">Ab 100 € / Monat</Badge>
            <Badge variant="koralle">7 % p.a.*</Badge>
            <Badge variant="outline">Genossenschaftlich</Badge>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="font-serif-display max-w-[640px] text-[34px] leading-[1.06] text-white min-[400px]:text-[38px] sm:text-[56px] lg:text-[72px]">
              Vermögensaufbau ab <span className="text-shimmer">100 €</span>
            </h1>
            <p className="subheading mt-4 text-[20px] text-white/90 sm:text-[26px]">
              Digital, transparent, genossenschaftlich
            </p>
          </Reveal>

          <Reveal delay={200} className="my-6 h-[3px] w-16 origin-left animate-draw bg-koralle" />

          <Reveal delay={240}>
            <p className="max-w-[460px] text-[15.5px] leading-relaxed text-fog">
              Beteiligung an der Hanseatischen Wohnungsgenossenschaft eG mit 7% p.a.*
            </p>
          </Reveal>

          <Reveal delay={320} className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" href="#vorteile" className="animate-pulse-ring">
              Mehr erfahren
            </Button>
            <Button variant="on-navy" size="lg" href={links.beitritt} target="_blank" rel="noreferrer">
              Zum Beitrittsformular
            </Button>
          </Reveal>
        </div>

        <Reveal delay={260} className="hidden items-end justify-end lg:flex">
          <div className="animate-float w-[240px] rounded-md border-t-[3px] border-koralle bg-white p-6 shadow-[0_16px_34px_rgba(0,0,0,0.35)]">
            <div className="subheading text-[44px] leading-none text-navy">
              <CountUp value="7%" />
            </div>
            <div className="subheading mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
              p.a.* vorgesehene Verzinsung
            </div>
            <div className="mt-4 h-px bg-line" />
            <div className="subheading mt-4 text-[24px] leading-none text-navy">
              ab <CountUp value="100" /> €
            </div>
            <div className="subheading mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
              monatlich investieren
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
