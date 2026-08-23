import { testimonials } from "../data/content";

export function Testimonials() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-serif-display text-[26px] font-normal text-navy sm:text-[28px]">
          Was unsere Investoren sagen
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-md border border-line bg-white p-6 shadow-[0_2px_10px_rgba(20,26,70,0.06)]"
            >
              <div className="mb-3 text-gold" aria-hidden="true">
                ★★★★★
              </div>
              <p className="text-[13px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 text-[12.5px] font-semibold text-navy">
                {t.name}
                <span className="ml-1.5 font-normal text-muted">{t.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
