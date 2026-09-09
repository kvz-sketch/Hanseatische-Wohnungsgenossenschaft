import type { Submark } from "../../data/brandbook";
import { BrandLogo } from "./BrandLogo";
import { LogoDownload } from "./LogoDownload";
import { ColorSwatch } from "./ColorSwatch";

export function SubmarkCard({ mark, reverse = false }: { mark: Submark; reverse?: boolean }) {
  return (
    <div
      className={`grid grid-cols-1 gap-8 rounded-md border border-navy/8 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center ${
        reverse ? "lg:[direction:rtl]" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 [direction:ltr]">
        <div className="flex w-full items-center justify-center rounded-[3px] bg-mist px-6 py-10">
          <BrandLogo config={mark} fg="#141A46" className="w-full max-w-[280px]" />
        </div>
        <LogoDownload config={mark} fg="#141A46" bg="#FFFFFF" filenameBase={`gig-${mark.id}-navy`} />
      </div>

      <div className="[direction:ltr]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="subheading text-[10px] uppercase tracking-[0.14em] text-gold-deep">
            {mark.category}
          </span>
          {mark.status === "arbeitstitel" && (
            <span className="rounded-[2px] bg-navy/[0.06] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted">
              Arbeitstitel
            </span>
          )}
        </div>
        <h3 className="font-serif-display mt-2 text-[22px] text-navy">{mark.name}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{mark.description}</p>

        <div className="mt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-fog">
            Farbpalette
          </span>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {mark.palette.map((c) => (
              <ColorSwatch key={c.hex} name={c.name} hex={c.hex} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
