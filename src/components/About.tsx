import { press } from '../data/content'

export default function About() {
  return (
    <section id="ueber-uns" className="section">
      <div className="container-site">
        <div className="grid items-center gap-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-[238px]">
          <img
            src="/media/stephan-gerlach-portraet.jpg"
            alt="Stephan Gerlach, Vorstandsvorsitzender der Hanseatischen Invest eG"
            width={760}
            height={1138}
            loading="lazy"
            className="mx-auto block aspect-[4/5] w-full max-w-[380px] rounded-card object-cover object-top"
          />

          <div>
            <h2 className="h2">Wer hinter Ihrem Geld steht</h2>
            <p className="m-0 mt-5 text-[17px] leading-relaxed text-ink-2">
              Stephan Gerlach kauft seit über zehn Jahren Bestandshäuser in Norddeutschland. Seit 2018 hat seine Gruppe 300
              Wohnungen saniert und verkauft.
            </p>
            <p className="m-0 mt-4 text-[17px] leading-relaxed text-ink-2">
              Die Genossenschaft gibt Privatanlegern Zugang zu genau diesen Projekten, mit Vorstand Christine Pistorius,
              Aufsichtsrat und jährlicher Prüfung durch den Prüfungsverband.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-card border border-line p-5">
                <img
                  src="/media/buch-immobilien-investitionen.png"
                  alt="Buchcover „Immobilien-Investitionen leicht gemacht“ von Stephan Gerlach"
                  width={250}
                  height={374}
                  loading="lazy"
                  className="h-[76px] w-auto rounded-sm shadow"
                />
                <div>
                  <p className="m-0 text-[12px] font-semibold text-link">Neues Buch</p>
                  <p className="m-0 mt-0.5 text-[14px] leading-snug font-bold">Immobilien-Investitionen leicht gemacht</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-card border border-line p-5">
                <img
                  src="/media/siegel-top-experte-2026.png"
                  alt="Siegel „Top-Experte 2026“, ERFOLG Magazin"
                  width={261}
                  height={400}
                  loading="lazy"
                  className="h-[76px] w-auto"
                />
                <div>
                  <p className="m-0 text-[14px] font-bold">Auszeichnungen</p>
                  <p className="m-0 mt-0.5 text-[13px] text-ink-2">TOP-Experte 2026 u. a.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="m-0 text-[13px] font-semibold text-muted">Veröffentlichungen und Interviews</p>
          <ul className="m-0 mt-3 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {press.map((p) =>
              p.href ? (
                <li key={p.name}>
                  <a
                    href={p.href}
                    className="flex items-baseline justify-between border-b border-line pb-2 text-[14px] text-ink no-underline"
                  >
                    <span className="font-bold">{p.name}</span>
                    <span className="text-ink-2">{p.kind} →</span>
                  </a>
                </li>
              ) : (
                <li key={p.name} className="text-[15px] text-ink-2">
                  <span className="font-extrabold text-ink-2">{p.name}</span>
                  {p.kind}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
