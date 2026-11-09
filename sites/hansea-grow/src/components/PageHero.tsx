import type { ReactNode } from "react";
import { GhostWord, Reveal } from "./shared";

export function PageHero({
  eyebrow,
  title,
  ghost,
  children,
}: {
  eyebrow: string;
  title: string;
  ghost: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep px-5 py-16 sm:px-8 md:py-20 lg:px-11">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-koralle" />
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-koralle/20 blur-[110px]"
        aria-hidden="true"
      />
      <GhostWord className="text-white">{ghost}</GhostWord>
      <div className="relative mx-auto max-w-[1200px]">
        <Reveal>
          <span className="subheading text-[11px] uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </span>
          <h1 className="font-serif-display mt-3 text-[36px] leading-[1.08] text-white sm:text-[52px]">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={120} className="my-6 h-[3px] w-16 origin-left animate-draw bg-koralle" />
        {children && (
          <Reveal delay={180}>
            <div className="max-w-[640px] text-[15px] leading-relaxed text-fog">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
