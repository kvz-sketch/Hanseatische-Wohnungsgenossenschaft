import { useState } from "react";
import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";
import { BrandLogo } from "../components/brandbook/BrandLogo";
import { LogoDownload } from "../components/brandbook/LogoDownload";
import { ColorSwatch } from "../components/brandbook/ColorSwatch";
import { SectionHeading } from "../components/brandbook/SectionHeading";
import { SubmarkCard } from "../components/brandbook/SubmarkCard";
import { FehlanwendungCard } from "../components/brandbook/FehlanwendungCard";
import {
  gigLogo,
  gigColorVariants,
  masterPalette,
  submarks,
  fehlanwendungen,
  logoConstruction,
  typography,
  claim,
  toLogoConfig,
} from "../data/brandbook";
import { shadeRamp } from "../lib/color";

const sections = [
  { id: "architektur", n: "01", label: "Markenarchitektur" },
  { id: "logo", n: "02", label: "Das Logo" },
  { id: "schutzraum", n: "03", label: "Schutzraum" },
  { id: "mindestgroesse", n: "04", label: "Mindestgröße" },
  { id: "farbvarianten", n: "05", label: "Farbvarianten" },
  { id: "fehlanwendungen", n: "06", label: "Fehlanwendungen" },
  { id: "submarken", n: "07", label: "Submarken" },
  { id: "kombinationslogos", n: "08", label: "Kombinationslogos" },
  { id: "farbsystem", n: "09", label: "Farbsystem" },
  { id: "typografie", n: "10", label: "Typografie" },
];

function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8 lg:px-11">
        <Link to="/dashboard/brandbook" className="flex items-center gap-2.5">
          <RoofIcon color="#141A46" className="h-6 w-9" />
          <span className="subheading text-[13px] leading-none text-navy">
            Markenbuch <span className="text-fog">· GIG</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 overflow-x-auto text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted xl:flex">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap transition-colors hover:text-koralle">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="hidden text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle sm:block"
          >
            ← Dashboard
          </Link>
          <button
            aria-label="Inhalt öffnen"
            className="text-xl text-navy xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy/8 bg-white px-5 py-4 xl:hidden">
          <nav className="grid grid-cols-2 gap-3 text-[12px] font-bold uppercase tracking-[0.04em] text-navy">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setOpen(false)}>
                {s.n} {s.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Cover() {
  return (
    <section className="relative overflow-hidden bg-navy px-5 py-20 text-center sm:px-8 md:py-28">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-koralle/10 blur-3xl" />
      <div className="relative mx-auto max-w-[640px]">
        <div className="flex justify-center">
          <BrandLogo config={gigLogo} fg="#FFFFFF" className="w-full max-w-[220px]" />
        </div>
        <div className="mx-auto mt-7 h-px w-10 bg-gold" />
        <p className="subheading mt-7 text-[15px] text-gold sm:text-[18px]">{claim}</p>
        <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-fog/70">
          Markenbuch · Ausgabe 01 · 2026
        </p>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="px-5 py-14 sm:px-8 md:py-18 lg:px-11">
      <div className="mx-auto max-w-[720px] text-center">
        <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
          00 — Über dieses Buch
        </span>
        <h1 className="font-serif-display mt-3 text-[26px] text-navy sm:text-[32px]">
          Eine Dachmarke, <em className="text-koralle italic">ein Auftritt.</em>
        </h1>
        <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
          Die Gerlach Immobilien Gruppe (GIG) vereint mehrere Marken unter einem gemeinsamen
          Zeichen. Dieses Markenbuch stellt sicher, dass jede Marke — ob Dachmarke oder Submarke —
          wiedererkennbar, präzise und in gleicher Qualität auftritt. Der Schwerpunkt liegt auf
          Konsistenz: identische Aufbaulogik, definierter Schutzraum und ein gemeinsames
          Farbsystem für alle Marken der Gruppe.
        </p>
      </div>
    </section>
  );
}

function Architektur() {
  return (
    <section id="architektur" className="scroll-mt-20 bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="01"
          kicker="Markenarchitektur"
          title="Eine Dachmarke,"
          italic="viele Submarken."
          intro="Die GIG ist die Dachmarke der Gruppe. Alle Submarken folgen derselben Aufbaulogik — Dachsymbol, Wortmarke und der verbindende Zusatz „Gerlach Immobilien Gruppe“ — und teilen sich ein gemeinsames Farbsystem."
        />

        <div className="mt-10 rounded-md border border-navy/8 bg-white p-6 sm:p-10">
          <div className="flex flex-col items-center">
            <span className="subheading mb-4 text-[10px] uppercase tracking-[0.16em] text-gold-deep">
              Dachmarke
            </span>
            <div className="w-full max-w-[220px] rounded-[3px] bg-navy px-6 py-8">
              <BrandLogo config={gigLogo} fg="#FFFFFF" />
            </div>
            <div className="my-6 h-8 w-px bg-navy/20" />
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {submarks.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col items-center justify-center rounded-[3px] bg-mist px-3 py-5 text-center"
                >
                  <BrandLogo config={toLogoConfig(m)} fg="#141A46" className="w-full max-w-[120px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoSection() {
  return (
    <section id="logo" className="scroll-mt-20 px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="02"
          kicker="Das Logo"
          title="Der Aufbau"
          italic="des Zeichens."
          intro="Das Logo besteht aus drei festen Elementen in fixer Anordnung. Diese Struktur ist für alle Marken der Gruppe identisch und darf nicht verändert, neu angeordnet oder getrennt werden."
        />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="flex items-center justify-center rounded-md bg-mist p-10">
            <BrandLogo config={gigLogo} fg="#141A46" className="w-full max-w-[320px]" />
          </div>
          <div className="divide-y divide-line">
            {logoConstruction.map((item) => (
              <div key={item.n} className="flex gap-4 py-5 first:pt-0">
                <span className="font-serif-display text-[22px] text-fog">{item.n}</span>
                <div>
                  <h3 className="subheading text-[15px] text-navy">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Schutzraum() {
  return (
    <section id="schutzraum" className="scroll-mt-20 bg-navy px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="03"
          kicker="Schutzraum & Aufbau"
          title="Raum schafft"
          italic="Wertigkeit."
          intro="Der Schutzraum ist der Mindestabstand, der das Logo von Text, Bildkanten und anderen Elementen freihält. Er wird aus dem Logo selbst abgeleitet und skaliert dadurch immer korrekt mit — für alle Marken der Gruppe gleich."
          dark
        />

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-md bg-white/[0.04] p-8">
            <span className="subheading text-[11px] uppercase tracking-[0.14em] text-fog">
              Schutzraum = 1 X
            </span>
            <div className="relative mx-auto mt-6 max-w-[300px]">
              <div className="grid grid-cols-[16px_1fr_16px] grid-rows-[16px_1fr_16px] gap-1.5">
                <div />
                <XDot />
                <div />
                <XDot />
                <div className="rounded-[2px] border border-dashed border-gold/50 p-5">
                  <BrandLogo config={gigLogo} fg="#FFFFFF" />
                </div>
                <XDot />
                <div />
                <XDot />
                <div />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-md bg-white/[0.04] p-8">
            <span className="subheading text-[11px] uppercase tracking-[0.14em] text-fog">
              Herleitung der Maßeinheit X
            </span>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1 text-gold">
                <div className="h-16 w-px bg-gold/60" />
                <XDot />
              </div>
              <BrandLogo config={{ id: "gig-mini", lines: ["GIG"] }} fg="#FFFFFF" className="w-full max-w-[180px]" />
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-fog">
              Die Maßeinheit X entspricht der Höhe des Dachsymbols. Der Schutzraum von 1X gilt auf
              allen vier Seiten und ist konsequent freizuhalten — auf jeder Anwendung, in jeder
              Größe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function XDot() {
  return (
    <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy">
      X
    </div>
  );
}

function Mindestgroesse() {
  return (
    <section id="mindestgroesse" className="scroll-mt-20 px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="04"
          kicker="Mindestgröße"
          title="Lesbar bleiben,"
          italic="immer."
          intro="Damit Dachsymbol, Wortmarke und Namenszusatz sauber lesbar bleiben, gelten Mindestgrößen. Unter diesen Werten darf das Logo nicht eingesetzt werden."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            { label: "Print — Minimum 24 mm", value: "24 mm", sub: "Breite" },
            { label: "Digital — Minimum 100 px", value: "100 px", sub: "Breite" },
          ].map((item) => (
            <div key={item.label} className="rounded-md bg-mist p-8">
              <div className="flex items-center gap-5">
                <BrandLogo config={gigLogo} fg="#141A46" className="w-[110px] shrink-0" />
                <div className="border-l border-navy/10 pl-5">
                  <div className="font-serif-display text-[26px] text-navy">{item.value}</div>
                  <div className="text-[12px] text-muted">{item.sub}</div>
                </div>
              </div>
              <div className="mt-5 border-t border-navy/10 pt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-navy">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Farbvarianten() {
  return (
    <section id="farbvarianten" className="scroll-mt-20 bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="05"
          kicker="Farbvarianten"
          title="Positiv"
          italic="& Negativ."
          intro="Das Logo tritt in zwei Ausführungen auf: dunkel auf hellen Flächen und hell auf dunklen Flächen oder Bildern. Ausreichender Kontrast ist immer sicherzustellen."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gigColorVariants.map((v) => (
            <div key={v.id}>
              <div
                className="flex h-[190px] items-center justify-center rounded-[3px]"
                style={{ backgroundColor: v.bg }}
              >
                <BrandLogo config={gigLogo} fg={v.fg} className="w-full max-w-[150px]" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy">
                  {v.label}
                </span>
              </div>
              <div className="mt-2">
                <LogoDownload
                  config={gigLogo}
                  fg={v.fg}
                  bg={v.bg}
                  filenameBase={`gig-dachmarke-${v.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fehlanwendungen() {
  return (
    <section id="fehlanwendungen" className="scroll-mt-20 px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="06"
          kicker="Fehlanwendungen"
          title="Was nicht"
          italic="erlaubt ist."
          intro="Die Integrität des Zeichens hat Vorrang. Die folgenden Eingriffe schwächen die Marke und sind untersagt."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fehlanwendungen.map((item) => (
            <FehlanwendungCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Submarken() {
  return (
    <section id="submarken" className="scroll-mt-20 bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="07"
          kicker="Submarken"
          title="Die Marken"
          italic="der Gruppe."
          intro="Jede Submarke nutzt dieselbe Aufbaulogik und einen Teil des gemeinsamen Farbsystems. Navy ist die verbindende Primärfarbe aller Marken."
        />

        <div className="mt-10 flex flex-col gap-5">
          {submarks.map((mark) => (
            <SubmarkCard key={mark.id} mark={mark} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Kombinationslogos() {
  const trio = submarks.slice(0, 3);
  return (
    <section id="kombinationslogos" className="scroll-mt-20 px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="08"
          kicker="Kombinationslogos"
          title="Marken im"
          italic="Verbund."
          intro="Treten mehrere Marken gemeinsam auf, gelten zwei zugelassene Aufbauformen. In beiden bleibt der Schutzraum jeder Marke gewahrt und die Abstände sind gleichmäßig."
        />

        <div className="mt-10 flex flex-col gap-8">
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="subheading text-[14px] text-navy">Pyramidenaufbau</h3>
              <span className="text-[10.5px] uppercase tracking-[0.08em] text-fog">
                Dachmarke oben · Submarken gleichwertig darunter
              </span>
            </div>
            <div className="flex flex-col items-center gap-8 rounded-md bg-navy px-6 py-12">
              <BrandLogo config={gigLogo} fg="#FFFFFF" className="w-full max-w-[170px]" />
              <div className="h-px w-2/3 bg-white/15" />
              <div className="flex flex-wrap items-center justify-center gap-8">
                {trio.map((m) => (
                  <BrandLogo
                    key={m.id}
                    config={toLogoConfig(m)}
                    fg="#FFFFFF"
                    className="w-full max-w-[130px]"
                  />
                ))}
              </div>
              <p className="subheading text-[14px] text-white">{claim}</p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="subheading text-[14px] text-navy">Linearer Aufbau</h3>
              <span className="text-[10.5px] uppercase tracking-[0.08em] text-fog">
                Gleichwertige Reihung · Trennlinien · gleiche Abstände
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 rounded-md bg-mist px-6 py-12">
              <BrandLogo config={gigLogo} fg="#141A46" className="w-full max-w-[130px]" />
              {trio.map((m) => (
                <div key={m.id} className="flex items-center gap-8">
                  <div className="hidden h-16 w-px bg-navy/15 sm:block" />
                  <BrandLogo
                    config={toLogoConfig(m)}
                    fg="#141A46"
                    className="w-full max-w-[110px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Farbsystem() {
  const navyRamp = shadeRamp(masterPalette[0].hex, 8);
  const goldRamp = shadeRamp(masterPalette[1].hex, 8);
  return (
    <section id="farbsystem" className="scroll-mt-20 bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="09"
          kicker="Farbsystem"
          title="Navy führt."
          italic="Gold veredelt."
          intro="Ein gemeinsames Farbsystem verbindet alle Marken. Navy ist die dominante Primärfarbe. Gold wird als Akzent gezielt und sparsam eingesetzt; Koralle nur als Sekundärakzent. Auf eine Farbe klicken, um den Hex-Code zu kopieren."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {masterPalette.map((c) => (
            <div key={c.hex} className="rounded-md bg-white p-4">
              <ColorSwatch name={c.name} hex={c.hex} role={c.role} size="lg" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-md bg-white p-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-fog">
              Navy — Abstufungen
            </span>
            <div className="mt-3 flex overflow-hidden rounded-[3px]">
              {navyRamp.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={`${hex} kopieren`}
                  onClick={() => navigator.clipboard?.writeText(hex).catch(() => {})}
                  className="h-14 flex-1 transition-transform hover:scale-y-110"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-md bg-white p-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-fog">
              Gold — Abstufungen
            </span>
            <div className="mt-3 flex overflow-hidden rounded-[3px]">
              {goldRamp.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={`${hex} kopieren`}
                  onClick={() => navigator.clipboard?.writeText(hex).catch(() => {})}
                  className="h-14 flex-1 transition-transform hover:scale-y-110"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Typografie() {
  return (
    <section id="typografie" className="scroll-mt-20 px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          n="10"
          kicker="Typografie"
          title="TNR trifft"
          italic="Inter."
          intro="Zwei Schriften tragen den Auftritt: eine hochwertige Antiqua für Wortmarke und Headlines, eine klare Grotesk für Namenszusatz, Auszeichnungen und Fließtext."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-md bg-mist p-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-fog">
              {typography.display.label}
            </span>
            <div
              className="mt-4 text-[86px] leading-none text-navy"
              style={{ fontFamily: typography.display.stack }}
            >
              Aa
            </div>
            <div className="mt-4 text-[17px] text-navy" style={{ fontFamily: typography.display.stack }}>
              {typography.display.family}
            </div>
            <p className="mt-4 text-[14px] italic text-muted" style={{ fontFamily: typography.display.stack }}>
              „{typography.display.sample}“
            </p>
          </div>

          <div className="rounded-md bg-mist p-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-fog">
              {typography.text.label}
            </span>
            <div
              className="mt-4 text-[86px] leading-none text-navy"
              style={{ fontFamily: typography.text.stack }}
            >
              Aa
            </div>
            <div className="mt-4 text-[17px] font-semibold text-navy" style={{ fontFamily: typography.text.stack }}>
              {typography.text.family}
            </div>
            <div
              className="subheading mt-4 text-[13px] uppercase tracking-[0.2em] text-navy"
              style={{ fontFamily: typography.text.stack }}
            >
              Gerlach Immobilien Gruppe
            </div>
            <p className="mt-1 text-[11px] text-muted">Namenszusatz — Versalien, gesperrt (0,2 em)</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {typography.text.weights.map((w) => (
            <div key={w.n} className="border-t-2 border-navy pt-3">
              <div className="text-[22px] text-navy" style={{ fontFamily: typography.text.stack, fontWeight: w.n }}>
                {w.name}
              </div>
              <div className="text-[11px] text-fog">{w.n}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandBookFooter() {
  return (
    <footer className="bg-navy px-5 py-14 text-center sm:px-8">
      <BrandLogo config={gigLogo} fg="#FFFFFF" className="mx-auto w-full max-w-[170px]" />
      <div className="mx-auto mt-5 h-px w-8 bg-gold" />
      <p className="subheading mt-5 text-[14px] text-gold">{claim}</p>
      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-fog/60">
        Markenbuch · Ausgabe 01 · 2026 — Gerlach Immobilien Gruppe
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-block text-[11px] font-bold uppercase tracking-[0.08em] text-white/70 hover:text-gold"
      >
        ← Zurück zum Marketing Dashboard
      </Link>
    </footer>
  );
}

export function BrandBook() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <Cover />
      <Intro />
      <Architektur />
      <LogoSection />
      <Schutzraum />
      <Mindestgroesse />
      <Farbvarianten />
      <Fehlanwendungen />
      <Submarken />
      <Kombinationslogos />
      <Farbsystem />
      <Typografie />
      <BrandBookFooter />
    </div>
  );
}
