import type { IconName } from "../content";

const paths: Record<IconName | "x" | "download" | "arrow" | "mail" | "phone" | "pin", string> = {
  euro: "M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9",
  repeat: "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  screen: "M3 5h18v11H3zM8 20h8M12 16v4M7 9h4M7 12h7",
  hands: "M2 12l4-4 4 2 3-2 5 4 4-2M6 8l-3 7 5 4 3-1 3 2 5-4M10 14l2 2M13 12l3 3",
  home: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5L15.5 10",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  x: "M6 6l12 12M18 6L6 18",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  arrow: "M5 12h14M13 6l6 6-6 6",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  pin: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
};

export function Icon({
  name,
  className = "h-6 w-6",
  strokeWidth = 1.8,
}: {
  name: keyof typeof paths;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
