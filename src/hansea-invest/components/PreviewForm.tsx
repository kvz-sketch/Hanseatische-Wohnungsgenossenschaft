import { useState, type FormEvent } from "react";
import { ButtonEl } from "../../components/ui/Button";

const inputClass =
  "w-full rounded-[3px] border border-line bg-white px-3.5 py-3 text-[15px] text-navy placeholder-muted/60 outline-none transition-colors focus:border-gold-deep focus:ring-2 focus:ring-gold/30";

const labelClass = "subheading mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-ink";

// Stand-in for the HubSpot form in shareable previews (`vite build --mode
// artifact`), where HubSpot's script cannot load. Submits nowhere.
export function PreviewForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[3px] bg-mist px-3 py-2 text-[11.5px] leading-snug text-muted">
        Vorschau: Im Livebetrieb steht hier das HubSpot-Formular.
      </div>
      <div>
        <label className={labelClass} htmlFor="pf-name">
          Name
        </label>
        <input id="pf-name" required autoComplete="name" placeholder="Vor- und Nachname" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="pf-email">
          E-Mail
        </label>
        <input id="pf-email" required type="email" autoComplete="email" placeholder="ihre@email.de" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="pf-phone">
          Telefon <span className="normal-case tracking-normal text-muted/70">(optional)</span>
        </label>
        <input id="pf-phone" type="tel" autoComplete="tel" placeholder="+49 …" className={inputClass} />
      </div>
      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted">
        <input id="pf-consent" type="checkbox" required className="mt-0.5 h-4 w-4 flex-none accent-[#141a46]" />
        <span>Ich möchte Informationen zu Hansea Invest per E-Mail und ggf. Telefon erhalten.</span>
      </label>
      <ButtonEl variant="gold" size="lg" type="submit" block>
        Infopaket kostenlos anfordern
      </ButtonEl>
      {submitted && (
        <p className="text-[12.5px] leading-relaxed text-navy">
          Vorschau: Diese Angaben wurden nicht gesendet. Live übernimmt HubSpot den Versand und die Bestätigung.
        </p>
      )}
    </form>
  );
}
