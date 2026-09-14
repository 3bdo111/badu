import styles from "./heading.module.css";
import type { ElementType, ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3;

/**
 * Semantic heading with the BADU editorial scale.
 * Level maps to h1–h3; `display` is reserved for hero-scale statements.
 */
export function Heading({
  level,
  display = false,
  children,
  className,
  id,
}: {
  level: HeadingLevel;
  display?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag
      id={id}
      className={[
        styles.heading,
        display && styles.display,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
