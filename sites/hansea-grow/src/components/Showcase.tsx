import { Button, GhostWord, Reveal } from "./shared";
import { brands, links } from "../content";
import buchImg from "../assets/buch.jpg";
import kuecheImg from "../assets/kueche.jpg";
import portalImg from "../assets/portal.webp";
import presseImg from "../assets/presse.jpg";

export function Book() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gold" />
      <div
        className="pointer-events-none absolute -top-24 right-[5%] h-[320px] w-[320px] rounded-full bg-koralle/15 blur-[100px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">Buch</GhostWord>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Neues Buch
          </span>
          <h2 className="font-serif-display mt-3 text-[30px] leading-[1.12] text-white sm:text-[40px]">
            Dein Weg zur <span className="text-shimmer">finanziellen Freiheit</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-fog">
            Das neue Buch von <strong className="text-white">Stephan Gerlach</strong>, des{" "}
            <strong className="text-white">
              Spiegel-Bestsellerautors und CEO der Gerlach Immobilien Gruppe,
            </strong>{" "}
            ist dein Leitfaden für Immobilien als Kapitalanlage. Nutze sein Expertenwissen, um
            fundierte Entscheidungen zu treffen und gezielt für deine finanzielle Freiheit und eine
            sichere Zukunft vorzusorgen.
          </p>
          <Button variant="gold" size="md" href={links.buch} target="_blank" rel="noreferrer" className="mt-7">
            Zum Buchkauf
          </Button>
        </Reveal>
        <Reveal delay={140} className="flex justify-center lg:justify-end">
          <img
            src={buchImg}
            alt="Buchcover: Immobilien Investitionen leicht gemacht von Stephan Gerlach"
            loading="lazy"
            className="animate-float w-full max-w-[480px] rounded-md shadow-[0_24px_50px_rgba(0,0,0,0.4)]"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Transparency() {
  return (
    <section className="overflow-hidden bg-mist">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center lg:grid-cols-2">
        <Reveal className="px-5 py-16 sm:px-8 md:py-20 lg:py-24 lg:pl-[max(2.75rem,calc((100vw-1200px)/2+2.75rem))] lg:pr-12">
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            Mitgliederportal
          </span>
          <h2 className="font-serif-display mt-3 text-[30px] leading-[1.12] text-navy sm:text-[38px]">
            Volle Transparenz.
            <br />
            <span className="text-koralle">Jederzeit digital einsehbar.</span>
          </h2>
          <div className="my-5 h-[3px] w-12 bg-koralle" />
          <p className="max-w-[500px] text-[14px] leading-relaxed text-ink">
            Du siehst jederzeit, wie sich deine Beteiligung entwickelt und hast Zugriff auf die
            Verwaltung deiner Stammdaten sowie wichtige Dokumente. Zudem kannst du deine
            Bankverbindung und Konten bequem verwalten sowie alle Anteilsbewegungen und
            Renditeeinsicht jederzeit einsehen.
          </p>
          <Button variant="primary" size="md" href="/mitgliederportal/" className="mt-7">
            Zum Mitgliederportal
          </Button>
        </Reveal>
        <Reveal delay={140} className="relative h-[420px] sm:h-[520px]">
          <img
            src={kuecheImg}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/30 to-transparent" />
          <img
            src={portalImg}
            alt="Das Hansea-Grow-Mitgliederportal auf dem Smartphone"
            loading="lazy"
            className="animate-float absolute left-1/2 top-1/2 h-[88%] w-auto -translate-x-1/2 -translate-y-1/2 rounded-[22px] drop-shadow-[0_30px_40px_rgba(20,26,70,0.4)] lg:left-[30%]"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Press() {
  return (
    <section className="relative overflow-hidden bg-navy-deep px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <GhostWord className="text-white">Presse</GhostWord>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Blog & PR
          </span>
          <h2 className="font-serif-display mt-3 text-[30px] leading-[1.12] text-white sm:text-[38px]">
            Öffentlichkeitsarbeit
            <br />& Artikel
          </h2>
          <p className="mt-5 max-w-[500px] text-[14px] leading-relaxed text-fog">
            In diesem Bereich finden Sie ausgewählte Artikel und Veröffentlichungen rund um unser
            Unternehmen. Hier erhalten Sie kompakte Einblicke in unser Business und erfahren, wo und
            zu welchen Themen wir publizieren.
          </p>
          <Button variant="gold" size="md" href={links.blog} target="_blank" rel="noreferrer" className="mt-7">
            Mehr erfahren
          </Button>
        </Reveal>
        <Reveal delay={140} className="flex justify-center lg:justify-end">
          <a
            href={links.blog}
            target="_blank"
            rel="noreferrer"
            className="group block w-full max-w-[400px] overflow-hidden rounded-md border-t-[3px] border-koralle bg-white shadow-[0_24px_50px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
          >
            <img
              src={presseImg}
              alt="Artikel über Stephan Gerlach in der Süddeutschen Zeitung"
              loading="lazy"
              className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Brands() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            Gerlach Immobilien Gruppe
          </span>
          <h2 className="font-serif-display mt-3 text-[28px] text-navy sm:text-[36px]">
            Tochterunternehmen
          </h2>
          <p className="mt-4 max-w-[760px] text-[14px] leading-relaxed text-ink">
            Mit unseren Marken decken wir die gesamte Wertschöpfungskette entlang der
            Bestandssanierung bis hin zum Verkauf als optimierte Kapitalanlage ab. Durch diese
            Synergien entstehen für uns und unsere Kunden relevante Kostenvorteile.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((b, i) => {
            const tile = (
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            );
            const cls =
              "group flex aspect-[16/9] items-center justify-center rounded-md border border-line bg-white p-2 shadow-[0_2px_10px_rgba(20,26,70,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_10px_24px_rgba(20,26,70,0.1)]";
            return (
              <Reveal key={b.name} delay={(i % 5) * 60}>
                {b.href ? (
                  <a href={b.href} target="_blank" rel="noreferrer" className={cls}>
                    {tile}
                  </a>
                ) : (
                  <div className={cls}>{tile}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LegalNote() {
  return (
    <section className="bg-white px-5 pt-16 sm:px-8 md:pt-20 lg:px-11">
      <Reveal className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-md bg-navy p-8 sm:p-10">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gold" />
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            * Rechtlicher Hinweis
          </span>
          <p className="subheading mt-3 max-w-[820px] text-[17px] leading-relaxed text-white sm:text-[19px]">
            Die Zinsen von 7% p.a. sind rechtlich nicht garantiert. Sie hängen vom wirtschaftlichen
            Erfolg der Genossenschaft ab.
          </p>
          <p className="mt-3 text-[14px] text-fog">
            Es handelt sich nicht um ein Festzinsprodukt, sondern um eine Beteiligung.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
