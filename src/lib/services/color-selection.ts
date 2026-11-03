/**
 * Shared storefront color selection — a tiny pub/sub store.
 *
 * PurchaseSection publishes the selected color key; other client
 * sections (e.g. ProductShowcase) subscribe so their imagery follows
 * the color the shopper picked. Key format matches
 * `colorKeyFromName(nameEn)` and `ProductImage.colorKey`.
 */

type Listener = () => void;

let selectedColorKey: string | null = null;
const listeners = new Set<Listener>();

export const colorSelectionStore = {
  get(): string | null {
    return selectedColorKey;
  },
  set(key: string | null): void {
    if (key === selectedColorKey) return;
    selectedColorKey = key;
    listeners.forEach((l) => l());
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
