import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, ButtonEl, GhostWord, Reveal } from "./shared";
import { Icon } from "./Icon";
import { company, links } from "../content";

const inputClass =
  "w-full rounded-[3px] border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13.5px] text-white placeholder-fog/50 outline-none transition-colors focus:border-gold focus:bg-white/[0.14]";
const labelClass = "subheading mb-1.5 block text-[10.5px] uppercase tracking-[0.1em] text-fog";

const fields = [
  { key: "firstName", label: "Vorname", type: "text", autoComplete: "given-name", half: true },
  { key: "lastName", label: "Nachname", type: "text", autoComplete: "family-name", half: true },
  { key: "email", label: "E-Mail", type: "email", autoComplete: "email" },
  { key: "phone", label: "Telefonnummer", type: "tel", autoComplete: "tel" },
] as const;

type FormState = Record<(typeof fields)[number]["key"], string>;

function ContactForm() {
  const [form, setForm] = useState<FormState>({ firstName: "", lastName: "", email: "", phone: "" });
  const [sent, setSent] = useState(false);

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // No backend on the static host: the request opens a prefilled e-mail to the team.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    const body = [
      "Hallo Hansea-Grow-Team,",
      "",
      "ich interessiere mich für Hansea Grow und bitte um Rückmeldung.",
      "",
      `Name: ${name}`,
      `E-Mail: ${form.email}`,
      `Telefon: ${form.phone}`,
    ].join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      `Anfrage Hansea Grow – ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const card =
    "rounded-lg border border-white/15 bg-white/[0.07] p-7 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8";

  if (sent) {
    return (
      <div className={card}>
        <div className="subheading mb-2 text-[15px] text-white">Vielen Dank, {form.firstName}!</div>
        <p className="text-[13px] leading-relaxed text-fog">
          Dein E-Mail-Programm öffnet sich mit einer vorausgefüllten Anfrage an unser Team. Falls
          sich nichts öffnet, schreib uns direkt an{" "}
          <a href={`mailto:${company.email}`} className="text-gold underline underline-offset-2">
            {company.email}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-[12px] font-semibold text-koralle hover:text-white"
        >
          ← Neue Anfrage
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={card}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={"half" in f ? "" : "sm:col-span-2"}>
            <label className={labelClass} htmlFor={`cf-${f.key}`}>
              {f.label} <span className="text-koralle">*</span>
            </label>
            <input
              id={`cf-${f.key}`}
              required
              type={f.type}
              autoComplete={f.autoComplete}
              value={form[f.key]}
              onChange={update(f.key)}
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <ButtonEl variant="gold" size="lg" type="submit" block className="mt-6">
        Anfrage senden
      </ButtonEl>
      <p className="mt-3 text-[11px] leading-relaxed text-fog/70">
        Mit dem Absenden öffnet sich dein E-Mail-Programm. Details zur Datenverarbeitung findest du
        in unserer{" "}
        <a href="/datenschutz/" className="underline underline-offset-2 hover:text-gold">
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}

export function Contact() {
  return (
    <section
      id="kontakt"
      className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-20 sm:px-8 lg:px-11"
      style={{ clipPath: "polygon(0 24px, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-koralle/15 blur-[100px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">Kontakt</GhostWord>

      <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">
            Nächster Schritt
          </span>
          <h2 className="font-serif-display mt-3 text-[32px] text-white sm:text-[40px]">Kontakt</h2>
          <p className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-fog">
            Bei Fragen oder wenn du einen Termin für weitere Informationen vereinbaren möchtest,
            melde dich gerne bei uns. Wir organisieren jederzeit ein persönliches Gespräch zu einem
            passenden Zeitpunkt und freuen uns auf deine Anfrage.
          </p>
          <Button
            variant="gold"
            size="md"
            href={links.beitritt}
            target="_blank"
            rel="noreferrer"
            className="mt-7"
          >
            Zum Beitrittsformular
          </Button>

          <div className="mt-9 flex flex-col gap-3 text-[13.5px] text-fog">
            <a href={company.phoneHref} className="flex items-center gap-3 hover:text-gold">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20">
                <Icon name="phone" className="h-4 w-4" />
              </span>
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-gold">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20">
                <Icon name="mail" className="h-4 w-4" />
              </span>
              {company.email}
            </a>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/20">
                <Icon name="pin" className="h-4 w-4" />
              </span>
              {company.street}, {company.city}
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
