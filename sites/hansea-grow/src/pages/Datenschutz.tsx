import { Reveal } from "../components/shared";
import { PageHero } from "../components/PageHero";
import { LegalSection } from "./Impressum";
import { company } from "../content";

// TODO(before go-live): the old hanseagrow.de only carried Wix's generic
// sample text here, not a real privacy policy. Replace this page with the
// legally reviewed Datenschutzerklärung of the Hanseatische
// Wohnungsgenossenschaft eG (covering hosting, the contact e-mail,
// Google Fonts, DocuSign and the social links).
export function Datenschutz() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutz" ghost="Datenschutz" />
      <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
        <div className="mx-auto flex max-w-[820px] flex-col gap-8">
          <Reveal>
            <div className="rounded-md border border-line border-t-2 border-t-koralle bg-mist p-7 text-[14px] leading-relaxed text-ink">
              Die Datenschutzerklärung für diese Website wird derzeit aktualisiert. Bei Fragen zum
              Umgang mit deinen Daten erreichst du uns jederzeit unter{" "}
              <a href={`mailto:${company.email}`} className="text-koralle hover:underline">
                {company.email}
              </a>
              .
            </div>
          </Reveal>
          <LegalSection title="Verantwortliche Stelle">
            <p>
              {company.legalName}
              <br />
              {company.street}, {company.city}
              <br />
              E-Mail: {company.email} · Tel.: {company.phone}
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
