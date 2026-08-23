import { GigMark } from "./GigMark";
import { brands, company, footerLegal, nav } from "../data/content";

export function Footer() {
  return (
    <footer className="bg-navy-deep px-5 py-14 text-fog sm:px-8 lg:px-11">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <GigMark size={24} color="#ffffff" />
            <span className="font-serif-display text-[17px] text-white">GIG</span>
          </div>
          <p className="mt-4 max-w-[220px] text-[12px] leading-relaxed text-fog/80">
            Gerlach Immobilien Gruppe — nachhaltige Immobilienentwicklung in Norddeutschland.
          </p>
        </div>

        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Navigation
          </div>
          <ul className="flex flex-col gap-2 text-[12.5px]">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-gold">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Marken
          </div>
          <ul className="flex flex-col gap-2 text-[12.5px]">
            {brands.slice(0, 5).map((b) => (
              <li key={b.name}>
                <a href={b.href} target="_blank" rel="noreferrer" className="hover:text-gold">
                  {b.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Kontakt
          </div>
          <address className="text-[12.5px] not-italic leading-relaxed">
            {company.address}
            <br />
            {company.phone}
            <br />
            <a href={`mailto:${company.email}`} className="hover:text-gold">
              {company.email}
            </a>
          </address>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[11.5px] text-fog/70 sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} {company.legalName}</span>
        <div className="flex flex-wrap gap-5">
          {footerLegal.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="hover:text-gold">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
