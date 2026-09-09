import { useMemo } from "react";
import type { LogoConfig } from "../../data/brandbook";
import { buildLogoSvg } from "../../lib/logoSvg";

export function BrandLogo({
  config,
  fg,
  bg = null,
  className = "",
}: {
  config: LogoConfig;
  fg: string;
  bg?: string | null;
  className?: string;
}) {
  const { svg } = useMemo(() => buildLogoSvg(config, { fg, bg }), [config, fg, bg]);
  return (
    <div
      // The generated <svg> carries fixed pixel width/height (so standalone exported
      // files open at a sensible size) — override them here so it scales to its box.
      className={`[&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`}
      // Markup is generated entirely by buildLogoSvg from typed brand data — no user input reaches it.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
