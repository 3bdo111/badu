/**
 * Minimal line-drawn sun over a horizon — a nod to the embroidered
 * chest artwork. Decorative only.
 */
export function SunMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="24" cy="16" r="7" />
      <line x1="24" y1="2" x2="24" y2="5" />
      <line x1="10.2" y1="8.2" x2="12.3" y2="10.3" />
      <line x1="37.8" y1="8.2" x2="35.7" y2="10.3" />
      <line x1="5" y1="16" x2="8" y2="16" />
      <line x1="43" y1="16" x2="40" y2="16" />
      <line x1="4" y1="34" x2="44" y2="34" />
    </svg>
  );
}
