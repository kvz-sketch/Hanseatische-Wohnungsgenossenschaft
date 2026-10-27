import { useState, type ChangeEvent, type FormEvent } from "react";
import { ButtonEl } from "../../components/ui/Button";
import { amountOptions, contact, legal } from "../content";
import { submitLead, type Lead } from "../tracking";

const inputClass =
  "w-full rounded-[3px] border border-line bg-white px-3.5 py-3 text-[15px] text-navy placeholder-muted/60 outline-none transition-colors focus:border-gold-deep focus:ring-2 focus:ring-gold/30";

const labelClass = "subheading mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-ink";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function LeadForm({ id }: { id: string }) {
  const [form, setForm] = useState<Lead>({ name: "", email: "", phone: "", amount: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const update = (field: keyof Lead) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    try {
      setStatus(await submitLead(form, contact.email));
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent" || status === "mailto") {
    const firstName = form.name.split(" ")[0];
    return (
      <div className="rounded-lg border-t-[3px] border-gold bg-white p-7 text-navy shadow-[0_24px_60px_rgba(15,20,56,0.35)] sm:p-8">
        <div className="subheading text-[20px]">Vielen Dank{firstName ? `, ${firstName}` : ""}!</div>
        <p className="mt-3 text-[14px] leading-relaxed text-ink">
          {status === "sent"
            ? "Ihre Anfrage ist bei uns eingegangen. Sie erhalten Ihr kostenloses Infopaket in Kürze per E-Mail."
            : "Ihr E-Mail-Programm öffnet sich mit einer vorausgefüllten Anfrage — bitte senden Sie diese ab."}{" "}
          Fragen beantworten wir gern telefonisch unter{" "}
          <a href={contact.phoneHref} className="font-semibold text-navy underline underline-offset-2">
            {contact.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="scroll-mt-24 rounded-lg border-t-[3px] border-gold bg-white p-6 text-left shadow-[0_24px_60px_rgba(15,20,56,0.35)] sm:p-8"
    >
      <div className="subheading text-[20px] leading-tight text-navy">Kostenloses Infopaket anfordern</div>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
        Alle Konditionen, Chancen und Risiken — unverbindlich per E-Mail.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor={`${id}-name`}>
            Name
          </label>
          <input
            id={`${id}-name`}
            required
            autoComplete="name"
            value={form.name}
            onChange={update("name")}
            placeholder="Vor- und Nachname"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${id}-email`}>
            E-Mail
          </label>
          <input
            id={`${id}-email`}
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            placeholder="ihre@email.de"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${id}-phone`}>
              Telefon <span className="normal-case tracking-normal text-muted/70">(optional)</span>
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+49 …"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${id}-amount`}>
              Geplanter Betrag
            </label>
            <select
              id={`${id}-amount`}
              required
              value={form.amount}
              onChange={update("amount")}
              className={`${inputClass} ${form.amount ? "" : "text-muted/60"}`}
            >
              <option value="" disabled>
                Bitte wählen
              </option>
              {amountOptions.map((o) => (
                <option key={o} value={o} className="text-navy">
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none accent-[#141a46]"
          />
          <span>
            Ich möchte Informationen zu Hansea Invest per E-Mail und ggf. Telefon erhalten. Die Einwilligung kann ich
            jederzeit widerrufen. Hinweise in der{" "}
            <a href={legal.privacy} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Datenschutzerklärung
            </a>
            .
          </span>
        </label>
      </div>

      <ButtonEl variant="gold" size="lg" type="submit" block className="mt-5" disabled={status === "sending"}>
        {status === "sending" ? "Wird gesendet …" : "Infopaket kostenlos anfordern"}
      </ButtonEl>
      {status === "error" && (
        <p className="mt-3 text-[12.5px] text-[#c0392b]">
          Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder rufen Sie uns an: {contact.phone}
        </p>
      )}
      <p className="mt-3 text-center text-[11.5px] text-muted">Kostenlos · unverbindlich · in 1 Minute ausgefüllt</p>
    </form>
  );
}
