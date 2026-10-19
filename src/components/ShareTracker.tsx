import { useState } from 'react'
import { anteile, exampleShares, nextPayout, SHARE_PRICE, shareStages } from '../data/content'
import { StageBar } from './ui'

const euro = (v: number) => `${new Intl.NumberFormat('de-DE').format(v)} €`

export default function ShareTracker() {
  const [active, setActive] = useState(0)
  const share = exampleShares[active]

  return (
    <section id="verfolgen" className="section">
      <div className="container-site grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="m-0 mb-3 text-[13px] font-bold text-gold-700">Meine Anteile</p>
          <h2 className="h2">Wo ist Ihr Geld gerade? Jeder Anteil hat ein Haus.</h2>
          <p className="m-0 mt-3 text-[17px] leading-relaxed text-ink-2">
            Jeder Anteil steckt in einem konkreten Haus. Wählen Sie ein Anteilspaket, um Phase, Baufortschritt und
            Ausschüttungen zu sehen.
          </p>

          <p id="hs-share-pick" className="m-0 mt-8 mb-3 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
            Anteilspaket wählen
          </p>
          <div role="radiogroup" aria-labelledby="hs-share-pick" className="grid max-w-[440px] gap-2">
            {exampleShares.map((s, i) => {
              const on = i === active
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-4 rounded-control border px-4 py-3 text-left transition-colors ${
                    on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
                  }`}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                      on ? 'bg-gold text-ink' : 'border border-line text-ink-2'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold">{s.city}</span>
                    <span className={`block text-[12px] ${on ? 'text-light-dark' : 'text-muted'}`}>
                      {s.id} · {anteile(s.units)} · {euro(s.units * SHARE_PRICE)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-card bg-section p-5 sm:p-6" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 basis-[260px]">
              <p className="m-0 text-[13px] text-muted">
                Anteilspaket {share.id} · {share.units} Anteile
              </p>
              <p className="m-0 mt-1 flex items-center gap-2 text-[14px] font-bold text-gold-700">
                <span className="size-2 rounded-full bg-gold" /> {share.status}
              </p>
              <p className="m-0 mt-1 text-[20px] leading-tight font-semibold">{share.where}</p>
            </div>
            <div className="text-right">
              <p className="m-0 text-[13px] text-muted">Nächste Ausschüttung</p>
              <p className="m-0 mt-1 text-[18px] font-semibold">{nextPayout.date}</p>
              <p className="m-0 text-[13px] font-bold text-green">{nextPayout.perShare}</p>
            </div>
          </div>

          <div className="mt-5">
            <StageBar stages={shareStages} current={share.stage} />
          </div>

          <ol className="m-0 mt-5 list-none overflow-hidden rounded-control border border-line bg-white p-0">
            {share.events.map((ev, i) => (
              <li key={ev.text} className="flex items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0">
                <span className={`size-2 shrink-0 rounded-full ${i === 0 ? 'bg-gold' : 'bg-muted'}`} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[14px] font-bold">{ev.text}</p>
                  <p className="m-0 mt-0.5 text-[12px] text-muted">
                    {ev.date} · {ev.place}
                  </p>
                </div>
                {ev.hasPhoto && <span className="stripe-light h-10 w-[52px] shrink-0 rounded" aria-label="Foto" />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
