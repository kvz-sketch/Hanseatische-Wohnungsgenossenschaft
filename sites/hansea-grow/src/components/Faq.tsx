import { useState } from "react";
import { Reveal } from "./shared";
import { faq } from "../content";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-11">
      <div className="mx-auto max-w-[820px]">
        <Reveal>
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold-deep">
            FAQ
          </span>
          <h2 className="font-serif-display mt-3 text-[28px] text-navy sm:text-[36px]">
            Häufig gestellte Fragen
          </h2>
        </Reveal>
        <div className="mt-8 flex flex-col gap-2.5">
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div
                  className={`rounded-[4px] border transition-colors ${isOpen ? "border-koralle/40" : "border-line"}`}
                >
                  <button
                    className="subheading flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[14.5px] text-navy"
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
                    <div className="min-h-0 px-5 text-[13.5px] leading-relaxed text-muted">
                      <div className="pb-5">
                        {item.intro && <p className="font-semibold text-navy">{item.intro}</p>}
                        {item.bullets && (
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {item.bullets.map((b) => (
                              <li key={b} className="flex gap-2.5">
                                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-koralle" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.outro && <p className="mt-3">{item.outro}</p>}
                      </div>
                    </div>
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
