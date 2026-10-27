import { useState } from "react";
import { offer } from "../content";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const MAX = 100_000;
const STEP = 1_000;

export function Calculator() {
  const [amount, setAmount] = useState(25_000);
  const yearly = (amount * offer.targetDividend) / 100;
  const pct = ((amount - offer.minAmount) / (MAX - offer.minAmount)) * 100;

  return (
    <div className="rounded-lg border border-line bg-white p-6 shadow-[0_16px_40px_rgba(20,26,70,0.08)] sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="calc-amount" className="subheading text-[12px] uppercase tracking-[0.12em] text-ink">
          Ihr Betrag
        </label>
        <span className="subheading text-[26px] text-navy sm:text-[30px]">{euro.format(amount)}</span>
      </div>
      <input
        id="calc-amount"
        type="range"
        min={offer.minAmount}
        max={MAX}
        step={STEP}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-[#c6a248]"
        style={{ background: `linear-gradient(90deg, #ddb851 ${pct}%, #e7e8ec ${pct}%)` }}
      />
      <div className="mt-1.5 flex justify-between text-[11.5px] text-muted">
        <span>{euro.format(offer.minAmount)}</span>
        <span>{euro.format(MAX)}</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-navy p-4 text-white sm:p-5">
          <div className="subheading text-[10.5px] uppercase tracking-[0.12em] text-gold">pro Jahr</div>
          <div className="subheading mt-1 text-[24px] sm:text-[28px]">{euro.format(yearly)}</div>
        </div>
        <div className="rounded-md bg-mist p-4 sm:p-5">
          <div className="subheading text-[10.5px] uppercase tracking-[0.12em] text-gold-deep">pro Quartal</div>
          <div className="subheading mt-1 text-[24px] text-navy sm:text-[28px]">{euro.format(yearly / 4)}</div>
        </div>
      </div>
      <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
        Beispielrechnung bei einer Ziel-Dividende von {offer.targetDividend} % p. a., vor Steuern. Die tatsächliche
        Dividende wird jährlich von der Generalversammlung beschlossen und kann niedriger ausfallen oder entfallen.
      </p>
    </div>
  );
}
