import { useEffect, useState } from "react";
import { Button } from "./shared";
import { GrowLogo } from "./GrowLogo";
import { links, nav } from "../content";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const external = (href: string, isExternal?: boolean) =>
    isExternal ? { href, target: "_blank", rel: "noreferrer" } : { href };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-navy/8 bg-white transition-shadow ${
        scrolled ? "shadow-[0_2px_10px_rgba(20,26,70,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-11">
        <a href="/" aria-label="Hansea Grow – Startseite">
          <GrowLogo />
        </a>

        <nav className="hidden items-center gap-6 text-[11.5px] font-bold uppercase tracking-[0.06em] text-navy xl:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              {...external(item.href, item.external)}
              className="group relative py-1 transition-colors hover:text-koralle"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-koralle transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden xl:block">
          <Button variant="gold" size="sm" href={links.beitritt} target="_blank" rel="noreferrer">
            Jetzt beitreten
          </Button>
        </div>

        <button
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="text-2xl text-navy xl:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy/8 bg-white px-5 py-4 xl:hidden">
          <nav className="flex flex-col gap-4 text-[13px] font-bold uppercase tracking-[0.04em] text-navy">
            {nav.map((item) => (
              <a key={item.href} {...external(item.href, item.external)} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <Button
            variant="gold"
            size="sm"
            block
            href={links.beitritt}
            target="_blank"
            rel="noreferrer"
            className="mt-4"
          >
            Jetzt beitreten
          </Button>
        </div>
      )}
    </header>
  );
}
