import { testimonials } from "../data/content";
import { Reveal } from "./Reveal";

export function Testimonials() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="font-serif-display text-[26px] font-normal text-navy sm:text-[28px]">
            Was unsere Investoren sagen
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 110}>
              <div
                className={`relative overflow-hidden rounded-md border border-line p-6 shadow-[0_2px_10px_rgba(20,26,70,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(20,26,70,0.12)] ${
                  i === 1 ? "bg-navy" : "bg-white"
                }`}
              >
                <span
                  className={`font-serif-display absolute -top-3 right-4 text-[64px] leading-none ${
                    i === 1 ? "text-white/10" : "text-navy/[0.06]"
                  }`}
                  aria-hidden="true"
                >
                  &rdquo;
                </span>
                <div className="relative mb-3 text-gold" aria-hidden="true">
                  ★★★★★
                </div>
                <p
                  className={`relative text-[13px] leading-relaxed ${i === 1 ? "text-fog" : "text-ink"}`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="subheading relative mt-4 text-[12.5px]">
                  <span className={i === 1 ? "text-white" : "text-navy"}>{t.name}</span>
                  <span className={`ml-1.5 font-normal ${i === 1 ? "text-fog" : "text-muted"}`}>
                    {t.meta}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
