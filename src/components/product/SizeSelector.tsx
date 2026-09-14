"use client";

import styles from "./size-selector.module.css";

/**
 * Reusable size selector.
 * `unavailableSizes` lets future stock data disable sizes without
 * changing the component API.
 */
export function SizeSelector({
  sizes,
  selected,
  onSelect,
  unavailableSizes = [],
  labelId,
}: {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
  unavailableSizes?: string[];
  /** ID of the visible label element the group is labelled by. */
  labelId: string;
}) {
  return (
    <div role="group" aria-labelledby={labelId} className={styles.group}>
      {sizes.map((size) => {
        const unavailable = unavailableSizes.includes(size);
        return (
          <button
            key={size}
            type="button"
            disabled={unavailable}
            aria-pressed={selected === size}
            onClick={() => onSelect(size)}
            className={[
              styles.size,
              selected === size && styles.selected,
              unavailable && styles.unavailable,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
