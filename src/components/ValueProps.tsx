import { valueProps } from "../data/content";
import { Card } from "./ui/Card";

export function ValueProps() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-serif-display text-[24px] font-normal text-navy sm:text-[26px]">
          Warum Genossenschaft und Gruppe
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {valueProps.map((v) => (
            <Card key={v.title} accent={v.accent}>
              <h3 className="mb-1.5 text-[13.5px] font-semibold text-navy">{v.title}</h3>
              <p className="text-[12px] leading-relaxed text-muted">{v.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
