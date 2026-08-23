type GigMarkProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function GigMark({ size = 26, color = "#141A46", className }: GigMarkProps) {
  const height = Math.round(size * 0.58);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 44 26"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 24 L15 4 L22 15 L29 4 L42 24"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 24 L22 13 L29 24"
        stroke="#F97768"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
