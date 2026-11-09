import type { ReactNode } from "react";
import { Reveal } from "../components/shared";
import { PageHero } from "../components/PageHero";
import { company } from "../content";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal className="border-t border-line pt-8">
      <h2 className="subheading text-[13px] uppercase tracking-[0.12em] text-navy">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[14px] leading-relaxed text-ink">{children}</div>
    </Reveal>
  );
}

export function Impressum() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" ghost="Impressum" />
      <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="rounded-md border border-line border-t-2 border-t-gold bg-mist p-7 text-[14px] leading-relaxed text-ink">
              <p className="subheading text-[16px] text-navy">
                Hanseatische Wohnungsgenossenschaft eG – Hansea Grow
              </p>
              <p className="mt-3">
                {company.street}
                <br />
                {company.city}
              </p>
              <p className="mt-4">
                <strong className="text-navy">Vorstand:</strong> Stephan Hilmar Gerlach, Christine
                Georgia Pistorius
                <br />
                <strong className="text-navy">Aufsichtsrat:</strong> Vadim Kogan, Sophia Dobuch,
                Rainer Bartlau
              </p>
              <p className="mt-4">
                Amtsgericht Hamburg GnR 1175
                <br />
                Prüfungsverband: DIVK Hildesheim{" "}
                <a href="https://www.divk.de" target="_blank" rel="noreferrer" className="text-koralle hover:underline">
                  www.divk.de
                </a>
              </p>
              <p className="mt-4">
                E-Mail:{" "}
                <a href={`mailto:${company.email}`} className="text-koralle hover:underline">
                  {company.email}
                </a>
                <br />
                Tel.:{" "}
                <a href={company.phoneHref} className="hover:text-koralle">
                  {company.phone}
                </a>
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            <LegalSection title="Streitschlichtung">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-koralle hover:underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder
                verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                teilzunehmen.
              </p>
            </LegalSection>
            <LegalSection title="Haftung für Inhalte">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
                Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
                Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
                konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </LegalSection>
            <LegalSection title="Haftung für Links">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
                Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
                waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche
                Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
                Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
                derartige Links umgehend entfernen.
              </p>
            </LegalSection>
            <LegalSection title="Urheberrecht">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
                wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
                Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
                Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden
                Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
                umgehend entfernen.
              </p>
            </LegalSection>
          </div>
        </div>
      </section>
    </>
  );
}
