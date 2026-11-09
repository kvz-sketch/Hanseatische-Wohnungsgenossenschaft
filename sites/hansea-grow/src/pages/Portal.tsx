import { Button, Reveal } from "../components/shared";
import { Icon } from "../components/Icon";
import { PageHero } from "../components/PageHero";
import { Contact } from "../components/Contact";
import { portalDownloads } from "../content";

export function Portal() {
  return (
    <>
      <PageHero eyebrow="Hansea Grow" title="Willkommen im Mitgliederportal" ghost="Portal">
        Hier findest du alle relevanten Dokumente und Informationen rund um deine Mitgliedschaft
        bei Hansea Grow. Das Portal bietet dir einen zentralen Überblick über wichtige Unterlagen,
        aktuelle Updates und alles, was du für eine einfache und transparente Verwaltung deiner
        Mitgliedschaft benötigst.
      </PageHero>

      <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
              Unterlagen
            </span>
            <h2 className="font-serif-display mt-3 text-[28px] text-navy sm:text-[36px]">Downloads</h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {portalDownloads.map((d, i) => {
              const isPdf = d.href.endsWith(".pdf");
              return (
                <Reveal key={d.title} delay={(i % 3) * 90}>
                  <div
                    className={`flex h-full flex-col rounded-md border border-line border-t-2 bg-white p-7 shadow-[0_2px_10px_rgba(20,26,70,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,26,70,0.1)] ${
                      i === 0 ? "border-t-koralle" : "border-t-gold"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        i === 0 ? "bg-koralle/12 text-koralle" : "bg-gold/15 text-gold-deep"
                      }`}
                    >
                      <Icon name="doc" />
                    </span>
                    <h3 className="subheading mt-4 text-[15.5px] leading-snug text-navy">{d.title}</h3>
                    <div className="my-3 h-px bg-line" />
                    <p className="flex-1 text-[13px] leading-relaxed text-muted">{d.text}</p>
                    <Button
                      variant={i === 0 ? "koralle" : "primary"}
                      size="sm"
                      href={d.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 self-start"
                    >
                      <Icon name={isPdf ? "download" : "arrow"} className="h-4 w-4" strokeWidth={2.2} />
                      {d.action}
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
