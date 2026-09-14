import styles from "./section.module.css";
import type { ReactNode } from "react";

export function Section({
  children,
  id,
  className,
  ariaLabelledby,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  ariaLabelledby?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={[styles.section, className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
