"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { productRepository } from "@/lib/services/product-service";
import { getProductStockForSize, isProductAvailable } from "@/lib/types/product";

function addItemToStore(input: AddItemInput) {
  const product = productRepository.getProductById(input.productId) || productRepository.getProductBySlug(input.slug);
  if (!product || !isProductAvailable(product)) return;

  const maxStock = getProductStockForSize(product, input.size);
  if (maxStock <= 0) return;

  const existing = items.find(
    (item) => item.productId === input.productId && item.size === input.size
  );
  
  const currentQty = existing ? existing.quantity : 0;
  const newQty = Math.min(currentQty + 1, maxStock);

  if (existing) {
    items = items.map((item) =>
      item === existing ? { ...item, quantity: newQty } : item
    );
  } else {
    items = [...items, { ...input, quantity: 1 }];
  }
  persist();
  emit();
}

function updateQuantityInStore(productId: string, size: string, quantity: number) {
  if (quantity <= 0) {
    removeItemFromStore(productId, size);
    return;
  }

  const product = productRepository.getProductById(productId);
  const maxStock = product ? getProductStockForSize(product, size) : 999;
  const cappedQty = Math.min(quantity, maxStock);

  items = items.map((item) =>
    item.productId === productId && item.size === size
      ? { ...item, quantity: cappedQty }
      : item
  );
  persist();
  emit();
}

function removeItemFromStore(productId: string, size: string) {
  items = items.filter(
    (item) => !(item.productId === productId && item.size === size)
  );
  persist();
  emit();
}

function clearCartStore() {
  items = EMPTY;
  persist();
  emit();
}

export interface CartItem {
  productId: string;
  slug: string;
  size: string;
  quantity: number;
}

export interface AddItemInput {
  productId: string;
  slug: string;
  size: string;
}

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddItemInput, autoOpen?: boolean) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
  getCartItems: () => CartItem[];
  getCartCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "badu-cart";

const EMPTY: CartItem[] = [];

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Partial<CartItem>;
  return (
    typeof candidate.productId === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.size === "string" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0
  );
}

function loadStoredCart(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(isValidCartItem);
  } catch {
    return EMPTY;
  }
}

let items: CartItem[] = loadStoredCart();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartItem[] {
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode, etc.) — cart stays in memory.
  }
}



export function CartProvider({ children }: { children: ReactNode }) {
  const itemsSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (input: AddItemInput, autoOpen = true) => {
      addItemToStore(input);
      if (autoOpen) setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      updateQuantityInStore(productId, size, quantity);
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string) => {
    removeItemFromStore(productId, size);
  }, []);

  const clearCart = useCallback(() => {
    clearCartStore();
  }, []);

  const count = useMemo(
    () => itemsSnapshot.reduce((total, item) => total + item.quantity, 0),
    [itemsSnapshot]
  );

  const subtotal = useMemo(() => {
    return itemsSnapshot.reduce((total, item) => {
      const product =
        productRepository.getProductById(item.productId) ||
        productRepository.getProductBySlug(item.slug);
      if (!product || !isProductAvailable(product)) return total;
      return total + product.price * item.quantity;
    }, 0);
  }, [itemsSnapshot]);

  const getCartItems = useCallback(() => itemsSnapshot, [itemsSnapshot]);
  const getCartCount = useCallback(() => count, [count]);
  const getSubtotal = useCallback(() => subtotal, [subtotal]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: itemsSnapshot,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getCartItems,
      getCartCount,
      getSubtotal,
    }),
    [
      itemsSnapshot,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getCartItems,
      getCartCount,
      getSubtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return context;
}
