import { useState } from "react";
import { faq } from "../data/content";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="wissen" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[820px]">
        <h2 className="font-serif-display text-[24px] font-normal text-navy sm:text-[26px]">
          Häufige Fragen
        </h2>
        <div className="mt-6 flex flex-col gap-2.5">
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="rounded-[4px] border border-line">
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13px] font-medium text-navy"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="text-lg text-gold-deep">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-[12.5px] leading-relaxed text-muted">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
