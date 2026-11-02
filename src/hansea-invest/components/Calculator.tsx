import { useState } from "react";
import { offer } from "../content";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const MAX_SHARES = 10;

export function Calculator() {
  const [shares, setShares] = useState(3);
  const amount = shares * offer.shareAmount;
  const yearly = (amount * offer.plannedInterest) / 100;
  const pct = ((shares - 1) / (MAX_SHARES - 1)) * 100;

  return (
    <div className="rounded-lg border border-line bg-white p-6 shadow-[0_16px_40px_rgba(20,26,70,0.08)] sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="calc-amount" className="subheading text-[12px] uppercase tracking-[0.12em] text-ink">
          {shares} {shares === 1 ? "Anteil" : "Anteile"}
        </label>
        <span className="subheading text-[26px] text-navy sm:text-[30px]">{euro.format(amount)}</span>
      </div>
      <input
        id="calc-amount"
        type="range"
        min={1}
        max={MAX_SHARES}
        step={1}
        value={shares}
        onChange={(e) => setShares(Number(e.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-[#c6a248]"
        style={{ background: `linear-gradient(90deg, #ddb851 ${pct}%, #e7e8ec ${pct}%)` }}
      />
      <div className="mt-1.5 flex justify-between text-[11.5px] text-muted">
        <span>1 Anteil · {euro.format(offer.shareAmount)}</span>
        <span>{MAX_SHARES} Anteile</span>
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
        Beispielrechnung bei der vorgesehenen Rendite von {offer.plannedInterest} % p. a. laut Geschäftsordnung, vor
        Steuern. Die Rendite ist nicht garantiert und kann niedriger ausfallen oder entfallen.
      </p>
    </div>
  );
}
