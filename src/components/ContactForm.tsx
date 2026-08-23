import { useState, type FormEvent } from "react";
import { company } from "../data/content";
import { ButtonEl } from "./ui/Button";

const inputClass =
  "w-full rounded-[3px] border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13.5px] text-white placeholder-fog/50 outline-none transition-colors focus:border-gold focus:bg-white/[0.14]";

const labelClass = "subheading mb-1.5 block text-[10.5px] uppercase tracking-[0.1em] text-fog";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = `Kontaktanfrage von ${form.name}`;
    const body = [
      `Name: ${form.name}`,
      `E-Mail: ${form.email}`,
      form.phone ? `Telefon: ${form.phone}` : null,
      "",
      form.message,
    ]
      .filter((line) => line !== null)
      .join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-white/15 bg-white/[0.07] p-7 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="subheading mb-2 text-[15px] text-white">Vielen Dank, {form.name.split(" ")[0] || ""}!</div>
        <p className="text-[13px] leading-relaxed text-fog">
          Ihr E-Mail-Programm öffnet sich mit einer vorausgefüllten Nachricht an unser Team. Falls
          sich nichts öffnet, schreiben Sie uns direkt an{" "}
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
          ← Neue Nachricht
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/15 bg-white/[0.07] p-7 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cf-name">
            Name
          </label>
          <input
            id="cf-name"
            required
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="Ihr vollständiger Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cf-email">
            E-Mail
          </label>
          <input
            id="cf-email"
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="ihre@email.de"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass} htmlFor="cf-phone">
          Telefon <span className="text-fog/50">(optional)</span>
        </label>
        <input
          id="cf-phone"
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          placeholder="+49 ..."
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label className={labelClass} htmlFor="cf-message">
          Nachricht
        </label>
        <textarea
          id="cf-message"
          required
          rows={4}
          value={form.message}
          onChange={update("message")}
          placeholder="Ich interessiere mich für ein kostenloses Erstgespräch zu …"
          className={`${inputClass} resize-none`}
        />
      </div>

      <ButtonEl variant="gold" size="lg" type="submit" block className="mt-5">
        Nachricht senden
      </ButtonEl>
      <p className="mt-3 text-[11px] leading-relaxed text-fog/70">
        Mit dem Absenden öffnet sich Ihr E-Mail-Programm. Details zur Datenverarbeitung finden Sie
        in unserer{" "}
        <a
          href="https://gerlachgroup.de/datenschutzerklarung/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-gold"
        >
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}
