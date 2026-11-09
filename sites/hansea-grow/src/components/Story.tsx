import { Button, GhostWord, Reveal } from "./shared";
import { links, story } from "../content";
import kaminzimmerImg from "../assets/kaminzimmer.jpg";
import hwgLogo from "../assets/hwg-logo.png";

export function Story() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 md:gap-24">
        {story.map((s, i) => {
          const flip = i % 2 === 1;
          return (
            <div
              key={s.eyebrow}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <Reveal
                delay={flip ? 140 : 0}
                className={`group relative ${flip ? "md:order-2" : ""}`}
              >
                <div
                  className={`absolute -bottom-3 h-full w-full rounded-md ${flip ? "-left-3 bg-koralle/80" : "-right-3 bg-gold/80"}`}
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden rounded-md shadow-[0_20px_44px_rgba(20,26,70,0.18)]">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Reveal>
              <Reveal delay={flip ? 0 : 140}>
                <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
                  0{i + 1} · {s.eyebrow}
                </span>
                <h2 className="font-serif-display mt-3 text-[30px] leading-[1.1] text-navy sm:text-[40px]">
                  {s.title[0]}
                  <br />
                  <span className="text-koralle">{s.title[1]}</span>
                </h2>
                <div className="my-5 h-[3px] w-12 bg-koralle" />
                <p className="max-w-[500px] text-[14px] leading-relaxed text-ink">{s.text}</p>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Genossenschaft() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-16 sm:px-8 md:py-20 lg:px-11"
      style={{ clipPath: "polygon(0 24px, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[10%] h-[320px] w-[320px] rounded-full bg-gold/15 blur-[100px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">eG</GhostWord>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="inline-block rounded-[3px] bg-white px-5 py-4">
            <img src={hwgLogo} alt="Hanseatische Wohnungsgenossenschaft" className="h-12 w-auto sm:h-14" />
          </div>
          <h2 className="font-serif-display mt-7 max-w-[560px] text-[26px] leading-[1.2] text-white sm:text-[34px]">
            Beteilige dich mit Hansea Grow digital an einem wachsenden Immobilienbestand.
          </h2>
          <p className="mt-5 text-[17px] text-fog sm:text-[19px]">
            Als Mitglied der{" "}
            <strong className="subheading text-gold">Hanseatischen Wohnungsgenossenschaft eG.</strong>
          </p>
          <Button
            variant="gold"
            size="md"
            href={links.genossenschaft}
            target="_blank"
            rel="noreferrer"
            className="mt-8"
          >
            Zur Hanseatischen Wohnungsgenossenschaft
          </Button>
        </Reveal>
        <Reveal delay={140} className="relative">
          <div className="animate-float overflow-hidden rounded-md border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
            <img
              src={kaminzimmerImg}
              alt="Modernisierte Wohnung mit Kamin"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
