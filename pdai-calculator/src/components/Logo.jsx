// Skin Lab Pro brand mark (A3 Region Stack). Презентационный SVG, без логики.
export default function Logo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Skin Lab Pro"
    >
      <defs>
        <linearGradient id="slpLogoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#slpLogoGradient)" />
      <circle cx="32" cy="16" r="6" fill="#ffffff" />
      <rect x="19" y="26.5" width="26" height="8" rx="4" fill="#ffffff" />
      <rect x="15" y="38" width="34" height="8" rx="4" fill="#c7d2fe" />
      <rect x="23" y="49.5" width="18" height="8" rx="4" fill="#a5b4fc" />
    </svg>
  );
}
