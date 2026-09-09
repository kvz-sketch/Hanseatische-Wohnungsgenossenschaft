// The Dachsymbol on its own — used in nav bars and small UI contexts where
// the full BrandLogo lockup (roof + wordmark + tagline) would be too heavy.
export function RoofIcon({ color = "#141A46", className = "" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 44 26" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 24 L22 4 L40 24"
        stroke={color}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
