import styles from "./badge.module.css";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <span className={styles.badge}>{children}</span>;
}
