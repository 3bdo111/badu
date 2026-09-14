import styles from "./container.module.css";
import type { ReactNode } from "react";

export function Container({
  children,
  narrow = false,
  className,
}: {
  children: ReactNode;
  /** Use the narrow reading-width container. */
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[styles.container, narrow && styles.narrow, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
