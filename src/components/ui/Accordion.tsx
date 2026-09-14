"use client";

import { useId, useState } from "react";
import styles from "./accordion.module.css";

export interface AccordionItem {
  title: string;
  content: string;
}

/**
 * Accessible accordion — button + region pattern, single open item,
 * smooth height transition, full keyboard support.
 *
 * variant "editorial": large questions, thin dividers (FAQ).
 * variant "compact": tighter rows for product details.
 */
export function Accordion({
  items,
  variant = "editorial",
  className,
}: {
  items: AccordionItem[];
  variant?: "editorial" | "compact";
  className?: string;
}) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      className={[styles.accordion, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-q-${index}`;
        const panelId = `${baseId}-a-${index}`;
        return (
          <div key={buttonId} className={styles.item}>
            <h3 className={styles.question}>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className={styles.button}
              >
                <span>{item.title}</span>
                <span className={styles.indicator} aria-hidden="true">
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={[styles.answer, open && styles.open]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.answerInner}>
                <p>{item.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
