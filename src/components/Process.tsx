import { process } from "../data/content";

export function Process() {
  return (
    <section className="bg-mist px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-serif-display text-[26px] font-normal text-navy sm:text-[28px]">
          So arbeiten wir mit Ihnen
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {process.map((p) => (
            <div key={p.step}>
              <div className="font-serif-display text-[44px] leading-none text-koralle">
                {p.step}
              </div>
              <h3 className="mt-2.5 mb-1.5 text-[14.5px] font-semibold text-navy">{p.title}</h3>
              <p className="text-[12px] leading-relaxed text-muted">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
