import { useState, type FormEvent } from "react";
import { GigMark } from "./GigMark";
import { brands, company, footerLegal, nav } from "../data/content";
import { ButtonEl } from "./ui/Button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      "Newsletter-Anmeldung",
    )}&body=${encodeURIComponent(`Bitte in den Newsletter aufnehmen: ${email}`)}`;
    setSubscribed(true);
  };

  return (
    <footer className="bg-navy-deep px-5 pt-14 text-fog sm:px-8 lg:px-11">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-center">
        <div>
          <div className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Newsletter
          </div>
          <h3 className="subheading mt-2 text-[19px] text-white">
            Neuigkeiten aus der Gruppe abonnieren
          </h3>
        </div>

        {subscribed ? (
          <p className="text-[13px] text-fog">
            Vielen Dank! Ihr E-Mail-Programm öffnet sich zur Bestätigung.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex w-full max-w-[380px] gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              className="w-full rounded-[2px] border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13px] text-white placeholder-fog/50 outline-none transition-colors focus:border-gold focus:bg-white/[0.14]"
            />
            <ButtonEl type="submit" variant="gold" size="md">
              Abonnieren
            </ButtonEl>
          </form>
        )}
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
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
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
            Marken
          </div>
          <ul className="flex flex-col gap-2 text-[12.5px]">
            {brands.map((b) => {
              const isExternal = b.href.startsWith("http");
              return (
                <li key={b.name}>
                  <a
                    href={b.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    className="hover:text-gold"
                  >
                    {b.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="subheading mb-3 text-[11px] uppercase tracking-[0.14em] text-white/70">
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

      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-[11.5px] text-fog/70 sm:flex-row sm:items-center">
        <span>
          © {new Date().getFullYear()} {company.legalName}
        </span>
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
