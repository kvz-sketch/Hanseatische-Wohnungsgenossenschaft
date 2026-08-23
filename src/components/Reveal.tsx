import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

export function Reveal({
  children = null,
  delay = 0,
  className = "",
  as = "div",
}: {
  children?: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => setVisible(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    // Safety net: guarantees content is never stuck invisible if the
    // observer is slow/unavailable (e.g. automated snapshots, older browsers).
    const fallback = window.setTimeout(reveal, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
