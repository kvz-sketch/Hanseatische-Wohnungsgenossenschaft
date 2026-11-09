import { Button } from "./shared";
import { GrowLogo } from "./GrowLogo";
import { company, nav, socials } from "../content";

const socialIcon: Record<string, string> = {
  Instagram:
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5h.01",
  Facebook: "M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z",
  LinkedIn: "M4 9h3.5v11H4zM5.75 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h3.3v1.6c.5-.9 1.7-1.9 3.6-1.9 3.6 0 4.1 2.3 4.1 5.3V20h-3.5v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10z",
};

export function Footer() {
  return (
    <footer className="bg-navy-deep px-5 pt-14 text-fog sm:px-8 lg:px-11">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-center">
        <div>
          <GrowLogo tone="light" />
          <p className="mt-4 text-[12.5px] italic text-fog/80">{company.tagline}</p>
        </div>
        <Button variant="on-navy" size="sm" href="/#kontakt">
          Jetzt anfragen
        </Button>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 py-10 sm:grid-cols-3">
        <div>
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
            Kontakt
          </div>
          <address className="text-[12.5px] not-italic leading-relaxed">
            <a href={`mailto:${company.email}`} className="hover:text-gold">
              {company.email}
            </a>
            <br />
            <a href={company.phoneHref} className="hover:text-gold">
              {company.phone}
            </a>
            <br />
            <br />
            {company.street}
            <br />
            {company.city}
          </address>
        </div>

        <div>
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
            Navigation
          </div>
          <ul className="flex flex-col gap-2 text-[12.5px]">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="hover:text-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
            Folge uns
          </div>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-fog transition-colors hover:border-gold hover:text-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill={s.label === "Instagram" ? "none" : "currentColor"}
                  stroke={s.label === "Instagram" ? "currentColor" : "none"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d={socialIcon[s.label]} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-[11.5px] text-fog/70 sm:flex-row sm:items-center">
        <span>
          © {new Date().getFullYear()} {company.name} | {company.legalName}
        </span>
        <div className="flex flex-wrap gap-5">
          <a href="/impressum/" className="hover:text-gold">
            Impressum
          </a>
          <a href="/datenschutz/" className="hover:text-gold">
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
