import type { ReactNode } from "react";

type Variant = "gold" | "koralle" | "outline";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy",
  koralle: "bg-koralle text-white",
  outline: "border border-gold/50 text-gold",
};

export function Badge({
  variant = "gold",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-[2px] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
