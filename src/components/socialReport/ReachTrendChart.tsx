import { useState } from "react";

type Point = { label: string; value: number };

const W = 680;
const H = 220;
const PAD_L = 60;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 32;

export function ReachTrendChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const yTop = Math.ceil(max / 20000) * 20000;
  const yBottom = Math.floor((min * 0.9) / 20000) * 20000;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const x = (i: number) => PAD_L + (i / (data.length - 1)) * plotW;
  const y = (v: number) => PAD_T + plotH - ((v - yBottom) / (yTop - yBottom)) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.value)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD_T + plotH} L ${x(0)} ${PAD_T + plotH} Z`;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => yBottom + (i * (yTop - yBottom)) / gridLines);

  const fmt = (v: number) => new Intl.NumberFormat("de-DE").format(Math.round(v));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Reichweite der letzten sechs Monate">
        <defs>
          <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141A46" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#141A46" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="#e7e8ec" strokeWidth="1" />
            <text x={PAD_L - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9499b3">
              {fmt(v)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#reachFill)" />
        <path d={linePath} fill="none" stroke="#141A46" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <g key={d.label}>
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#5a5f78">
              {d.label}
            </text>
            <circle
              cx={x(i)}
              cy={y(d.value)}
              r={i === data.length - 1 ? 4 : hover === i ? 4 : 3}
              fill={i === data.length - 1 ? "#F97768" : "#141A46"}
              stroke="#fff"
              strokeWidth="1.5"
            />
            {i === data.length - 1 && (
              <text x={x(i)} y={y(d.value) - 12} textAnchor="end" fontSize="11" fontWeight="700" fill="#141A46">
                {fmt(d.value)}
              </text>
            )}
            <rect
              x={x(i) - plotW / data.length / 2}
              y={PAD_T}
              width={plotW / data.length}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            />
          </g>
        ))}

        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={PAD_T + plotH} stroke="#DDB851" strokeWidth="1" strokeDasharray="3 3" />}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-[3px] bg-navy px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100 - 2}%` }}
        >
          {data[hover].label}: {fmt(data[hover].value)}
        </div>
      )}
    </div>
  );
}
