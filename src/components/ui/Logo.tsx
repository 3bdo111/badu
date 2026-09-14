import Link from "next/link";
import styles from "./logo.module.css";

/**
 * BADU text wordmark.
 * Pure typography — works on light and dark backgrounds.
 */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="BADU — home"
      className={[styles.logo, dark && styles.dark].filter(Boolean).join(" ")}
    >
      BADU
    </Link>
  );
}
