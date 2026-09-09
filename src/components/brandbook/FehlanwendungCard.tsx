import type { fehlanwendungen } from "../../data/brandbook";
import { RoofIcon } from "./RoofIcon";

type Demo = (typeof fehlanwendungen)[number];

const wordmarkStyle = "font-serif-display text-[30px] leading-none text-[#111318]";

function DemoMark({ demo }: { demo: Demo["demo"] }) {
  if (demo === "wrong-color") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <RoofIcon color="#8b3dd1" className="h-9 w-14" />
        <span className={wordmarkStyle} style={{ color: "#8b3dd1" }}>
          GIG
        </span>
      </div>
    );
  }
  if (demo === "shadow") {
    return (
      <div
        className="flex flex-col items-center gap-1.5"
        style={{ filter: "drop-shadow(4px 6px 5px rgba(0,0,0,0.55))" }}
      >
        <RoofIcon color="#111318" className="h-9 w-14" />
        <span className={wordmarkStyle}>GIG</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <RoofIcon color="#111318" className="h-9 w-14" />
      <span className={wordmarkStyle}>GIG</span>
    </div>
  );
}

export function FehlanwendungCard({ item }: { item: Demo }) {
  const wrapStyle: Record<Demo["demo"], string> = {
    stretch: "scale-x-[1.9] scale-y-[0.55]",
    "wrong-color": "",
    rotate: "rotate-[22deg]",
    "busy-bg": "",
    shadow: "",
    cramped: "",
  };

  return (
    <div>
      <div
        className={`relative flex h-[150px] items-center justify-center overflow-hidden rounded-[3px] ${
          item.demo === "busy-bg" ? "bg-navy" : "bg-mist"
        }`}
      >
        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e0453d] text-[10px] font-bold text-white">
          ✕
        </span>

        {item.demo === "busy-bg" && (
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #2a3266 0, #2a3266 10px, #1c2354 10px, #1c2354 20px)",
            }}
          />
        )}

        {item.demo === "cramped" ? (
          <div className="relative flex h-full w-full items-center justify-center border border-dashed border-gold/70 p-1">
            <DemoMark demo={item.demo} />
            <span className="absolute -left-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold text-center text-[8px] leading-3 text-navy">
              x
            </span>
            <span className="absolute -right-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold text-center text-[8px] leading-3 text-navy">
              x
            </span>
          </div>
        ) : (
          <div className={`relative ${wrapStyle[item.demo]}`}>
            <DemoMark demo={item.demo} />
          </div>
        )}
      </div>
      <p className="mt-2.5 text-[12.5px] text-muted">{item.caption}</p>
    </div>
  );
}
