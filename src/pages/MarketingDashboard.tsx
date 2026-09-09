import type { ReactElement } from "react";
import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";

type Tile = {
  id: string;
  title: string;
  description: string;
  to?: string;
  external?: string;
  status: "live" | "soon";
  icon: (props: { className?: string }) => ReactElement;
};

function IconBook({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 5.2c0-.66.54-1.2 1.2-1.2H11a2 2 0 0 1 2 2v14a1.6 1.6 0 0 0-1.6-1.6H5.2A1.2 1.2 0 0 1 4 17.2V5.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.2c0-.66-.54-1.2-1.2-1.2H13a2 2 0 0 0-2 2v14a1.6 1.6 0 0 1 1.6-1.6h6.2a1.2 1.2 0 0 0 1.2-1.2V5.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGrid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconImage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16.5 9 12l3.5 3.5L16 12l4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19c.7-3.2 3-5 5.5-5s4.8 1.8 5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 13.3c2.1.3 3.8 1.9 4.3 4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSpeaker({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10v4h3.5L13 17.5v-11L7.5 10H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 9.5c1 .9 1 3.6 0 4.5M19.3 7.3c2 2.3 2 6.6 0 8.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconChat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v8A1.5 1.5 0 0 1 18.5 16H10l-4 3.2V16H5.5A1.5 1.5 0 0 1 4 14.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tiles: Tile[] = [
  {
    id: "brandbook",
    title: "Markenbuch",
    description:
      "Logo, Schutzraum, Farbsystem, Typografie und alle Submarken der Gruppe — inklusive downloadbarer Logo-Dateien.",
    to: "/dashboard/brandbook",
    status: "live",
    icon: IconBook,
  },
  {
    id: "templates",
    title: "Vorlagen",
    description: "Präsentationen, Briefpapier, Signaturen und Social-Media-Formate zum Download.",
    status: "soon",
    icon: IconGrid,
  },
  {
    id: "assets",
    title: "Bildmaterial",
    description: "Freigegebene Fotografie, Objektbilder und Grafikelemente für Marketing & Vertrieb.",
    status: "soon",
    icon: IconImage,
  },
  {
    id: "social",
    title: "Social-Media-Kit",
    description: "Post-Vorlagen, Captions und Formatregeln für LinkedIn, Instagram & Co.",
    status: "soon",
    icon: IconChat,
  },
  {
    id: "press",
    title: "Presse",
    description: "Pressemitteilungen, Unternehmensprofil und Ansprechpartner für Medienanfragen.",
    status: "soon",
    icon: IconSpeaker,
  },
  {
    id: "contacts",
    title: "Ansprechpartner",
    description: "Wer verantwortet welche Marke — Marketing-Kontakte je Gesellschaft der Gruppe.",
    status: "soon",
    icon: IconUsers,
  },
];

function TileCard({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const isLive = tile.status === "live";

  const inner = (
    <div
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-md border p-6 transition-all duration-200 ${
        isLive
          ? "border-navy/10 bg-white shadow-[0_2px_10px_rgba(20,26,70,0.06)] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,26,70,0.14)]"
          : "border-navy/8 bg-white/60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[3px] ${
            isLive ? "bg-navy text-gold" : "bg-navy/[0.06] text-navy/40"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`rounded-[2px] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] ${
            isLive ? "bg-gold/15 text-gold-deep" : "bg-navy/[0.06] text-muted"
          }`}
        >
          {isLive ? "Verfügbar" : "Bald verfügbar"}
        </span>
      </div>

      <div className="mt-8">
        <h3 className={`subheading text-[18px] ${isLive ? "text-navy" : "text-navy/50"}`}>{tile.title}</h3>
        <p className={`mt-2 text-[13px] leading-relaxed ${isLive ? "text-muted" : "text-muted/60"}`}>
          {tile.description}
        </p>
        {isLive && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-koralle">
            Öffnen
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </div>

      {isLive && (
        <div className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
      )}
    </div>
  );

  if (tile.to) {
    return (
      <Link to={tile.to} className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full cursor-default">{inner}</div>;
}

export function MarketingDashboard() {
  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <RoofIcon color="#141A46" className="h-6 w-6" />
            <span className="subheading text-[14px] leading-none text-navy">
              Marketing Dashboard
            </span>
          </Link>
          <Link
            to="/"
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle"
          >
            Zur Website ↗
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy px-5 py-16 sm:px-8 md:py-20 lg:px-11">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-koralle/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1200px]">
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Gerlach Immobilien Gruppe · Intern
          </span>
          <h1 className="font-serif-display mt-4 max-w-[640px] text-[34px] leading-tight text-white sm:text-[44px]">
            Marketing Dashboard
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-fog">
            Die zentrale Anlaufstelle für Markenmaterial, Vorlagen und Ressourcen der Gruppe —
            damit jede Marke der GIG konsistent, präzise und in gleicher Qualität auftritt.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:py-16 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile) => (
              <TileCard key={tile.id} tile={tile} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-navy/8 px-5 py-8 sm:px-8 lg:px-11">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 text-[11.5px] text-muted sm:flex-row sm:items-center">
          <span>Markenbuch · Ausgabe 01 · 2026 — Gerlach Immobilien Gruppe</span>
          <Link to="/dashboard/brandbook" className="font-bold uppercase tracking-[0.08em] text-navy hover:text-koralle">
            Zum Markenbuch →
          </Link>
        </div>
      </footer>
    </div>
  );
}
