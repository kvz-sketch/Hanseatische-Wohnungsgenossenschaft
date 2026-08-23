import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "gold" | "on-navy" | "primary" | "outline" | "koralle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-bold uppercase tracking-[0.08em] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-deep hover:shadow-[0_10px_24px_rgba(221,184,81,0.4)]",
  "on-navy":
    "bg-white/0 text-white border border-white/40 hover:border-white hover:bg-white/10",
  primary: "bg-navy text-white hover:bg-navy-light hover:shadow-[0_10px_24px_rgba(20,26,70,0.35)]",
  outline: "bg-transparent text-navy border border-navy/25 hover:border-navy",
  koralle:
    "bg-koralle text-white hover:bg-[#f2604f] hover:shadow-[0_10px_24px_rgba(249,119,104,0.4)]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-[15px] px-7 py-3.5",
};

type Shared = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
};

type ButtonProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement>;
type NativeButtonProps = Shared & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <a
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

// Same look as Button, but a real <button> — for form submits and in-page
// actions where an anchor would be the wrong element.
export function ButtonEl({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  children,
  ...rest
}: NativeButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
