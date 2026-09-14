"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import styles from "./reveal.module.css";

/**
 * Subtle editorial reveal on scroll (fade + soft rise).
 * Respects prefers-reduced-motion: content is shown immediately.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={[styles.reveal, visible && styles.visible, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
