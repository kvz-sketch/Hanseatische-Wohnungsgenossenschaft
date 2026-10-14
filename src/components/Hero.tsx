import { heroStats } from '../data/content'
import { CallbackForm } from './LeadForms'

export default function Hero() {
  return (
    <section id="top" className="bg-ink px-5 pt-14 pb-16 text-white lg:pt-[72px] lg:pb-16">
      <div className="container-site grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-[120px]">
        <div className="lg:pt-2">
          <p className="m-0 text-[13px] text-light-dark">Hamburg · Genossenschaft seit 2018 · Beteiligung ab 10.000 €</p>
          <h1 className="m-0 mt-4 text-[clamp(40px,5.2vw,62px)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance">
            Wohnhäuser, die Sie sich ansehen können. 7&nbsp;% p.a. Ziel&shy;rendite.
          </h1>
          <p className="m-0 mt-7 max-w-[540px] text-[18px] leading-relaxed font-light text-lighter-dark">
            Sie beteiligen sich an konkreten Objekten in Norddeutschland, mit Adresse, Fotos und Baustand. Ohne Kredit,
            ohne Mieter, ohne Verwaltung. Ausschüttung jedes Quartal.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <img
              src="/media/stephan-gerlach-avatar.jpg"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
            <p className="m-0 text-[14px] leading-snug text-light-dark">
              <strong className="font-bold text-white">Stephan Gerlach</strong>, Vorstandsvorsitzender
              <br />
              Autor „Immobilien-Investitionen leicht gemacht“
            </p>
          </div>

          <dl className="m-0 mt-8 grid max-w-[540px] grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="text-[clamp(20px,2.2vw,26px)] font-extrabold tracking-tight text-white">{s.value}</dt>
                <dd className="m-0 mt-1 text-[13px] text-light-dark">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <CallbackForm />
      </div>
    </section>
  )
}
