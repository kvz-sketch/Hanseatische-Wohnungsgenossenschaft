import { useState } from 'react'
import { ButtonLink } from './ui'

const MIN = 10_000
const MAX = 100_000
const STEP = 1_000
const PRESETS = [10_000, 25_000, 50_000, 100_000]
const YEARS = [1, 2, 3]
const TARGET = 0.07
const SAVINGS_RATE = 0.02

const num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const euro = (v: number) => `${num.format(Math.round(v))} €`
const yearsLabel = (y: number) => (y === 1 ? '1 Jahr' : `${y} Jahre`)

/** Target payout without compounding vs. a savings account with yearly reinvestment. */
function calcPayout(amount: number, years: number) {
  const total = TARGET * amount * years
  const savings = amount * (Math.pow(1 + SAVINGS_RATE, years) - 1)
  return {
    total,
    quarter: (TARGET * amount) / 4,
    savings,
    savingsPct: Math.max(2, Math.round((savings / total) * 100)),
  }
}

export default function Calculator() {
  const [amount, setAmount] = useState(25_000)
  const [years, setYears] = useState(2)
  const r = calcPayout(amount, years)
  const fill = ((amount - MIN) / (MAX - MIN)) * 100

  return (
    <section id="rechner" className="section bg-section">
      <div className="container-site">
        <h2 className="h2">Was Ihr Betrag bei 7&nbsp;% Ziel bringt</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-white p-6">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="hs-amt" className="text-[15px] font-bold">
                Betrag
              </label>
              <output htmlFor="hs-amt" className="text-[30px] font-extrabold tracking-tight tabular-nums">
                {euro(amount)}
              </output>
            </div>
            <input
              id="hs-amt"
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-valuetext={euro(amount)}
              className="hs-range mt-4 w-full"
              style={{ background: `linear-gradient(to right, var(--color-brick) ${fill}%, var(--color-line) ${fill}%)` }}
            />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={amount === p}
                  onClick={() => setAmount(p)}
                  className={`cursor-pointer rounded-control border py-3 text-[14px] font-semibold tabular-nums transition-colors ${
                    amount === p ? 'border-ink bg-section' : 'border-line bg-white hover:border-ink'
                  }`}
                >
                  {num.format(p)}
                </button>
              ))}
            </div>

            <p id="hs-years-label" className="m-0 mt-7 mb-3 text-[15px] font-bold">
              Laufzeit
            </p>
            <div role="radiogroup" aria-labelledby="hs-years-label" className="grid grid-cols-3 overflow-hidden rounded-control border border-line">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={years === y}
                  onClick={() => setYears(y)}
                  className={`cursor-pointer border-l border-line py-3 text-[15px] font-semibold first:border-l-0 ${
                    years === y ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-section'
                  }`}
                >
                  {yearsLabel(y)}
                </button>
              ))}
            </div>

            <p className="m-0 mt-5 text-[12px] leading-relaxed text-muted">
              Anteile: 7 % Zielrendite, quartalsweise ausgezahlt, kein Zinseszins. Tagesgeld 2 % mit jährlicher
              Wiederanlage. Ohne Steuern und Kosten. Annahmen, keine Zusagen.
            </p>
          </div>

          <div className="flex flex-col rounded-card bg-ink-panel p-6 text-white" aria-live="polite">
            <p className="m-0 text-[14px] text-light-dark">Ausschüttungen gesamt über {yearsLabel(years)} (Ziel)</p>
            <p className="m-0 mt-2 text-[clamp(40px,4.5vw,52px)] leading-none font-extrabold tracking-tight text-green-dark tabular-nums">
              {euro(r.total)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="m-0 text-[13px] text-light-dark">Pro Quartal auf Ihr Konto</p>
                <p className="m-0 mt-1 text-[22px] font-extrabold tabular-nums">{euro(r.quarter)}</p>
              </div>
              <div>
                <p className="m-0 text-[13px] text-light-dark">Dasselbe auf dem Tagesgeld</p>
                <p className="m-0 mt-1 text-[22px] font-extrabold tabular-nums">{euro(r.savings)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-[13px]">
              <div>
                <div className="mb-1.5 flex justify-between text-lighter-dark">
                  <span>Anteile (Ziel)</span>
                  <span className="tabular-nums">{euro(r.total)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-green-dark" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-lighter-dark">
                  <span>Tagesgeld</span>
                  <span className="tabular-nums">{euro(r.savings)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-muted-dark transition-[width]" style={{ width: `${r.savingsPct}%` }} />
                </div>
              </div>
            </div>

            <ButtonLink href="#termin" className="mt-6 w-full">
              Diese Rechnung mit einem Berater besprechen
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
