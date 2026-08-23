import { useEffect, useRef, useState } from "react";

// Animates the leading integer of a stat string (e.g. "1.200+", "7%", "10")
// while preserving any prefix/suffix text untouched.
export function CountUp({ value, durationMs = 1400 }: { value: string; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/([\d.]+)/);
    setDisplay(match ? value.replace(match[0], "0") : value);

    const el = ref.current;
    if (!el || !match) return;

    const target = parseFloat(match[0].replace(/\./g, ""));
    const hasThousands = match[0].includes(".");
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[0].length);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let cancelled = false;
    let started = false;
    const runCountUp = () => {
      if (started || cancelled) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        const formatted = hasThousands ? current.toLocaleString("de-DE") : String(current);
        setDisplay(`${prefix}${formatted}${suffix}`);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          runCountUp();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    // Safety net: guarantees the final value is always reached, even if the
    // observer never fires (e.g. automated snapshots, older browsers).
    const fallback = window.setTimeout(() => {
      observer.disconnect();
      if (!started) setDisplay(value);
    }, 1200);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [value, durationMs]);

  return <span ref={ref}>{display}</span>;
}
