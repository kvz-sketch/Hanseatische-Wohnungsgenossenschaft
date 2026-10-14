import { ButtonLink } from './ui'

export default function FinalCta() {
  return (
    <section className="section">
      <div className="container-site flex flex-col gap-8 rounded-card bg-ink-panel px-6 py-10 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[600px]">
          <h2 className="m-0 text-[clamp(26px,2.6vw,32px)] leading-snug font-extrabold tracking-tight">
            Lassen Sie es sich in 20 Minuten erklären.
          </h2>
          <p className="m-0 mt-3 text-[16px] text-light-dark">
            Ein Berater ruft Sie im gewählten Zeitfenster an. Der Berater sagt Ihnen auch, wenn es nicht passt.
          </p>
        </div>
        <div className="text-center">
          <ButtonLink href="#termin" className="px-6 py-3.5 text-[16px]">
            Mein Erstgespräch buchen
          </ButtonLink>
          <p className="m-0 mt-3 text-[12px] text-light-dark">Kostenlos · Unverbindlich · Kein Verkaufsdruck</p>
        </div>
      </div>
    </section>
  )
}
