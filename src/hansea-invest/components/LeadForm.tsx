import { useEffect, useRef } from "react";
import { contact, hubspot } from "../content";
import { trackLead } from "../tracking";

type LegacyHbspt = {
  forms: {
    create: (options: Record<string, unknown>) => void;
  };
};

declare global {
  interface Window {
    hbspt?: LegacyHbspt;
  }
}

const isConfigured = Boolean(hubspot.portalId && hubspot.formId);

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    return existing.dataset.loaded ? Promise.resolve() : new Promise((r) => existing.addEventListener("load", () => r()));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

// Card that hosts the HubSpot form. Fields, consent checkbox, thank-you
// message and the form's look are all managed in HubSpot; this component only
// loads the embed and fires the Taboola "lead" event on a successful submit.
export function LeadForm({ id }: { id: string }) {
  const legacyCreated = useRef(false);

  useEffect(() => {
    if (!isConfigured) return;

    // New HubSpot forms (iframe embed) announce submissions as window events.
    window.addEventListener("hs-form-event:on-submission:success", trackLead);

    if (hubspot.embed === "legacy") {
      loadScript(`https://js-${hubspot.region}.hsforms.net/forms/embed/v2.js`)
        .then(() => {
          if (legacyCreated.current) return;
          legacyCreated.current = true;
          window.hbspt?.forms.create({
            region: hubspot.region,
            portalId: hubspot.portalId,
            formId: hubspot.formId,
            target: `#${id}-hubspot`,
            onFormSubmitted: trackLead,
          });
        })
        .catch(() => {});
    } else {
      loadScript(`https://js-${hubspot.region}.hsforms.net/forms/embed/${hubspot.portalId}.js`).catch(() => {});
    }

    return () => window.removeEventListener("hs-form-event:on-submission:success", trackLead);
  }, [id]);

  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-lg border-t-[3px] border-gold bg-white p-6 text-left shadow-[0_24px_60px_rgba(15,20,56,0.35)] sm:p-8"
    >
      <div className="subheading text-[20px] leading-tight text-navy">Kostenloses Infopaket anfordern</div>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
        Alle Konditionen, Chancen und Risiken — unverbindlich per E-Mail.
      </p>

      <div className="mt-5 min-h-[320px]">
        {!isConfigured ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-md border border-dashed border-line bg-mist p-6 text-center">
            <p className="text-[13.5px] leading-relaxed text-muted">
              Hier erscheint das HubSpot-Formular, sobald Portal- und Formular-ID in
              <code className="mx-1 text-navy">src/hansea-invest/content.ts</code>
              eingetragen sind.
            </p>
            <a href={contact.phoneHref} className="mt-4 text-[14px] font-semibold text-navy underline underline-offset-2">
              Oder direkt anrufen: {contact.phone}
            </a>
          </div>
        ) : hubspot.embed === "legacy" ? (
          <div id={`${id}-hubspot`} />
        ) : (
          <div
            className="hs-form-frame"
            data-region={hubspot.region}
            data-form-id={hubspot.formId}
            data-portal-id={hubspot.portalId}
          />
        )}
      </div>

      <p className="mt-3 text-center text-[11.5px] text-muted">Kostenlos · unverbindlich · in 1 Minute ausgefüllt</p>
    </div>
  );
}
