import type { ReactNode } from "react";

type Accent = "gold" | "koralle" | "flat";

const accentBorder: Record<Accent, string> = {
  gold: "border-t-gold",
  koralle: "border-t-koralle",
  flat: "border-t-line",
};

export function Card({
  accent = "flat",
  className = "",
  children,
}: {
  accent?: Accent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-md border border-line ${accentBorder[accent]} border-t-2 bg-white p-6 shadow-[0_2px_10px_rgba(20,26,70,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,26,70,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}
