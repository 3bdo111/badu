import type { ReactNode } from "react";

/**
 * Inline SVG icon set for storefront trust marks.
 *
 * These replace the emoji glyphs the storefront used to rely on. Emoji are
 * rendered by the operating system's emoji font, and devices or browsers
 * without one draw an empty box instead of the icon. Vector icons always
 * render, inherit the text colour, and stay consistent across platforms.
 */
export type IconName = "fabric" | "truck" | "return" | "cash" | "shield";

const PATHS: Record<IconName, ReactNode> = {
  // Fabric swatch: stacked weave lines inside a panel.
  fabric: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M4 9h16M4 14h16M9 4v16M15 4v16" />
    </>
  ),
  // Delivery truck.
  truck: (
    <>
      <path d="M3 7h10.5v9H3z" />
      <path d="M13.5 10h3.2L20 13.2V16h-6.5z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.4" cy="18" r="1.6" />
    </>
  ),
  // Return / exchange loop.
  return: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4.6h-4.6" />
    </>
  ),
  // Cash on delivery: banknote.
  cash: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6.5 10.5v3M17.5 10.5v3" />
    </>
  ),
  // Quality guarantee.
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.2-3 7.4-7 8.9-4-1.5-7-4.7-7-8.9V6z" />
      <path d="M9 12.2l2.1 2.1 4-4.1" />
    </>
  ),
};

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Older CMS section bodies carry an emoji per line ("🚚 | Express 2-4 Day
 * Delivery"). Resolve the ones we know to vector icons; anything else renders
 * no glyph at all, so an unrecognised character can never show as a box.
 */
const FROM_EMOJI: Record<string, IconName> = {
  "🧵": "fabric",
  "✨": "fabric",
  "✂️": "fabric",
  "📏": "fabric",
  "🚚": "truck",
  "📦": "truck",
  "🔄": "return",
  "↩️": "return",
  "💵": "cash",
  "💳": "cash",
  "🔒": "shield",
  "🛡️": "shield",
};

export function iconFromEmoji(value: string | undefined): IconName | undefined {
  if (!value) return undefined;
  return FROM_EMOJI[value.trim()];
}
