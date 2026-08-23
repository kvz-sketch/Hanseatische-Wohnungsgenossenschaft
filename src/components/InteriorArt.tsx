// Original line-art motif (renovated interior corner) — not a photograph —
// used to echo the "modern living space" narrative without licensing a stock photo.
export function InteriorArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 380"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="interior-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5d78e" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f97768" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="480" height="380" fill="url(#interior-sky)" />

      {/* slanted roof window */}
      <path
        d="M60 40 L300 40 L300 190 L60 230 Z"
        fill="#ffffff"
        fillOpacity="0.55"
        stroke="#ddb851"
        strokeWidth="2"
      />
      <line x1="180" y1="40" x2="180" y2="215" stroke="#ddb851" strokeWidth="2" />
      <line x1="60" y1="135" x2="300" y2="135" stroke="#ddb851" strokeWidth="1.5" />

      {/* light rays */}
      <g stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5">
        <line x1="140" y1="90" x2="40" y2="260" />
        <line x1="200" y1="90" x2="130" y2="280" />
        <line x1="250" y1="100" x2="210" y2="290" />
      </g>

      {/* headboard */}
      <rect x="90" y="230" width="260" height="90" rx="14" fill="#141a46" fillOpacity="0.9" />
      {/* bed base */}
      <rect x="70" y="300" width="320" height="46" rx="6" fill="#ffffff" />
      {/* pillows */}
      <rect x="100" y="260" width="90" height="56" rx="12" fill="#ffffff" />
      <rect x="200" y="264" width="90" height="52" rx="12" fill="#f97768" fillOpacity="0.85" />
      <rect x="300" y="260" width="80" height="56" rx="12" fill="#ffffff" />

      {/* plant accent */}
      <circle cx="410" cy="300" r="4" fill="#ddb851" />
      <path
        d="M410 300 C 400 280, 420 260, 405 245"
        fill="none"
        stroke="#ddb851"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
