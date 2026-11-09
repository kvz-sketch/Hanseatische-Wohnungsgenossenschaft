import type { ReactNode } from "react";
import { Reveal } from "./shared";

export function SectionTitle({
  eyebrow,
  children,
  intro,
  tone = "dark",
  className = "",
}: {
  eyebrow: string;
  children: ReactNode;
  intro?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Reveal className={className}>
      <span
        className={`subheading text-[10.5px] uppercase tracking-[0.16em] ${light ? "text-gold" : "text-gold-deep"}`}
      >
        {eyebrow}
      </span>
      <h2
        className={`font-serif-display mt-3 max-w-[720px] text-[28px] leading-[1.12] sm:text-[36px] ${light ? "text-white" : "text-navy"}`}
      >
        {children}
      </h2>
      {intro && (
        <p
          className={`mt-4 max-w-[620px] text-[14px] leading-relaxed ${light ? "text-fog" : "text-ink"}`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
