import { useState } from "react";
import { faq } from "../data/content";
import { Reveal } from "./Reveal";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="wissen" className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[820px]">
        <Reveal>
          <h2 className="font-serif-display text-[24px] font-normal text-navy sm:text-[26px]">
            Häufige Fragen
          </h2>
        </Reveal>
        <div className="mt-6 flex flex-col gap-2.5">
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div
                  className={`rounded-[4px] border transition-colors ${isOpen ? "border-koralle/40" : "border-line"}`}
                >
                  <button
                    className="subheading flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13.5px] text-navy"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <span
                      className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[15px] transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-koralle text-white" : "bg-mist text-gold-deep"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <p className="min-h-0 px-5 pb-4 text-[12.5px] leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
