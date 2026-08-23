import { useEffect, useState } from "react";
import { GigMark } from "./GigMark";
import { Button } from "./ui/Button";
import { nav } from "../data/content";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-[0_2px_10px_rgba(20,26,70,0.08)]" : ""
      } border-b border-navy/8`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
        <a href="#top" className="flex items-center gap-2.5">
          <GigMark size={26} color="#141A46" />
          <span className="font-serif-display text-[19px] leading-none text-navy">GIG</span>
        </a>

        <nav className="hidden items-center gap-7 text-[12.5px] font-medium text-navy lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-koralle transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button variant="gold" size="sm" href="#kontakt">
            Beratung sichern
          </Button>
        </div>

        <button
          aria-label="Menü öffnen"
          className="text-2xl text-navy lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-navy/8 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-navy">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <Button variant="primary" size="sm" block href="#kontakt" className="mt-4">
            Beratung sichern
          </Button>
        </div>
      )}
    </header>
  );
}
