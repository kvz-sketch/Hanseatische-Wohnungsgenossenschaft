import { useState } from "react";
import type { LogoConfig } from "../../data/brandbook";
import { buildLogoSvg } from "../../lib/logoSvg";
import { downloadPng, downloadSvg, slugify } from "../../lib/exportLogo";

export function LogoDownload({
  config,
  fg,
  bg = null,
  filenameBase,
  variant = "light",
}: {
  config: LogoConfig;
  fg: string;
  bg?: string | null;
  filenameBase: string;
  variant?: "light" | "dark";
}) {
  const [busy, setBusy] = useState<"svg" | "png" | null>(null);
  const base = slugify(filenameBase);

  const handleSvg = () => {
    const { svg } = buildLogoSvg(config, { fg, bg });
    downloadSvg(svg, `${base}.svg`);
  };

  const handlePng = async () => {
    setBusy("png");
    try {
      const { svg, width, height } = buildLogoSvg(config, { fg, bg: bg ?? "#FFFFFF" });
      await downloadPng(svg, width, height, `${base}.png`, 4);
    } finally {
      setBusy(null);
    }
  };

  const btnClass =
    variant === "dark"
      ? "border-white/25 text-white hover:border-white hover:bg-white/10"
      : "border-navy/20 text-navy hover:border-navy hover:bg-navy/5";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSvg}
        className={`rounded-[2px] border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors ${btnClass}`}
      >
        SVG
      </button>
      <button
        type="button"
        onClick={handlePng}
        disabled={busy === "png"}
        className={`rounded-[2px] border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-50 ${btnClass}`}
      >
        {busy === "png" ? "…" : "PNG"}
      </button>
    </div>
  );
}
