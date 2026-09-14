import { initialProducts as staticProducts } from "@/data/initial-products";
import type { Product } from "@/lib/types/product";
import { normalizeProduct } from "./product-validator";

const listeners = new Set<() => void>();
let clientProductsCache: Product[] = staticProducts;
let isFetchingClient = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

// Client-side fetch helper to sync with backend API
async function refreshClientProducts() {
  if (typeof window === "undefined" || isFetchingClient) return;
  isFetchingClient = true;
  try {
    const res = await fetch("/api/products?all=true");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        clientProductsCache = data;
        notify();
      }
    }
  } catch {
    // Keep cached state
  } finally {
    isFetchingClient = false;
  }
}

// Initial client fetch
if (typeof window !== "undefined") {
  refreshClientProducts();
}

export const productRepository = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getAll(): Product[] {
    return clientProductsCache;
  },

  getProducts(): Product[] {
    return this.getAll();
  },

  getVisible(): Product[] {
    return clientProductsCache.filter((p) => Boolean(p.available));
  },

  getVisibleProducts(): Product[] {
    return this.getVisible();
  },

  getById(id: string): Product | undefined {
    return clientProductsCache.find((p) => p.id === id);
  },

  getProductById(id: string): Product | undefined {
    return this.getById(id);
  },

  getBySlug(slug: string): Product | undefined {
    return clientProductsCache.find((p) => p.slug === slug);
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getBySlug(slug);
  },

  create(rawProduct: Partial<Product>): Product {
    const normalized = normalizeProduct(rawProduct, clientProductsCache);
    clientProductsCache = [normalized, ...clientProductsCache];
    notify();

    if (typeof window !== "undefined") {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawProduct),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            const updatedIndex = clientProductsCache.findIndex((p) => p.id === normalized.id);
            if (updatedIndex !== -1) {
              clientProductsCache[updatedIndex] = data.product;
              notify();
            }
          }
        })
        .catch(() => {
          refreshClientProducts();
        });
    }

    return normalized;
  },

  createProduct(rawProduct: Partial<Product>): Product {
    return this.create(rawProduct);
  },

  update(id: string, updatedFields: Partial<Product>): Product | undefined {
    const targetIndex = clientProductsCache.findIndex((p) => p.id === id);
    if (targetIndex === -1) return undefined;

    const existing = clientProductsCache[targetIndex];
    const merged = { ...existing, ...updatedFields, id: existing.id };
    const otherProducts = clientProductsCache.filter((p) => p.id !== id);
    const normalized = normalizeProduct(merged, otherProducts);

    clientProductsCache = [
      ...clientProductsCache.slice(0, targetIndex),
      normalized,
      ...clientProductsCache.slice(targetIndex + 1),
    ];
    notify();

    if (typeof window !== "undefined") {
      fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            const idx = clientProductsCache.findIndex((p) => p.id === id);
            if (idx !== -1) {
              clientProductsCache[idx] = data.product;
              notify();
            }
          }
        })
        .catch(() => {
          refreshClientProducts();
        });
    }

    return normalized;
  },

  updateProduct(id: string, updatedFields: Partial<Product>): Product | undefined {
    return this.update(id, updatedFields);
  },

  delete(id: string): boolean {
    const initialLength = clientProductsCache.length;
    clientProductsCache = clientProductsCache.filter((p) => p.id !== id);

    if (clientProductsCache.length !== initialLength) {
      notify();

      if (typeof window !== "undefined") {
        fetch(`/api/products/${id}`, {
          method: "DELETE",
        }).catch(() => {
          refreshClientProducts();
        });
      }

      return true;
    }
    return false;
  },

  deleteProduct(id: string): boolean {
    return this.delete(id);
  },

  refreshClient(): void {
    refreshClientProducts();
  },
};

export const productService = productRepository;
