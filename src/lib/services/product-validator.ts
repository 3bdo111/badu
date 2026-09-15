import type { Product, ProductImage, LocalizedString } from "@/lib/types/product";

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

export function generateUniqueSlug(baseSlug: string, existingProducts: Product[], currentId?: string): string {
  const cleanBase = slugify(baseSlug) || "product";
  let candidate = cleanBase;
  let counter = 1;

  while (
    existingProducts.some((p) => p.slug === candidate && p.id !== currentId)
  ) {
    candidate = `${cleanBase}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function validateProduct(data: Partial<Product>): {
  isValid: boolean;
  errors: Record<string, LocalizedString>;
} {
  const errors: Record<string, LocalizedString> = {};

  const nameEn = data.translations?.en?.name?.trim();
  const nameAr = data.translations?.ar?.name?.trim();

  if (!nameEn) {
    errors.nameEn = {
      en: "English product name is required.",
      ar: "اسم المنتج بالإنجليزية مطلوب.",
    };
  }

  if (!nameAr) {
    errors.nameAr = {
      en: "Arabic product name is required.",
      ar: "اسم المنتج بالعربية مطلوب.",
    };
  }

  if (typeof data.price !== "number" || isNaN(data.price) || data.price < 0) {
    errors.price = {
      en: "Price must be a valid number greater than or equal to 0.",
      ar: "يجب أن يكون السعر رقمًا صحيحًا أكبر من أو يساوي 0.",
    };
  }

  if (
    data.compareAtPrice !== undefined &&
    data.compareAtPrice !== null &&
    (typeof data.compareAtPrice !== "number" || isNaN(data.compareAtPrice) || (typeof data.price === "number" && data.compareAtPrice <= data.price))
  ) {
    errors.compareAtPrice = {
      en: "Original price (Compare-at price) must be greater than current price.",
      ar: "السعر الأصلي (قبل الخصم) يجب أن يكون أكبر من سعر البيع الحالي.",
    };
  }

  if (!data.sizes || data.sizes.length === 0) {
    errors.sizes = {
      en: "At least one size must be selected.",
      ar: "يجب اختيار مقاس واحد على الأقل.",
    };
  }

  if (data.stock) {
    for (const [sizeKey, qty] of Object.entries(data.stock)) {
      if (typeof qty !== "number" || isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
        errors[`stock_${sizeKey}`] = {
          en: `Stock quantity for size ${sizeKey} must be a non-negative integer.`,
          ar: `كمية المخزون للمقاس ${sizeKey} يجب أن تكون رقمًا صحيحًا غير سالب.`,
        };
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function normalizeProduct(
  raw: Partial<Product>,
  existingProducts: Product[] = []
): Product {
  const now = new Date().toISOString();
  const id = raw.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `bd-product-${Date.now()}`);

  const rawSlug = raw.slug || raw.translations?.en?.name || "product";
  const slug = generateUniqueSlug(rawSlug, existingProducts, id);

  const sizes = Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ["S", "M", "L", "XL"];

  // Normalize stock map per size
  const stock: Record<string, number> = {};
  sizes.forEach((s) => {
    if (raw.stock && typeof raw.stock[s] === "number") {
      stock[s] = Math.max(0, Math.floor(raw.stock[s]));
    } else {
      stock[s] = raw.available !== false ? 10 : 0;
    }
  });

  // Normalize images
  const rawImages: ProductImage[] = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : [
        {
          src: "/images/products/badu-hoodie/front-v6.jpg",
          alt: { en: "BADU Product front", ar: "منتج BADU من الأمام" },
        },
        {
          src: "/images/products/badu-hoodie/back-v6.jpg",
          alt: { en: "BADU Product back", ar: "منتج BADU من الخلف" },
        },
      ];

  const images: ProductImage[] = rawImages.map((img, idx) => ({
    id: img.id || `img-${id}-${idx}`,
    src: img.src,
    alt: {
      en: img.alt?.en || raw.translations?.en?.name || "Product image",
      ar: img.alt?.ar || raw.translations?.ar?.name || "صورة المنتج",
    },
    isPrimary: idx === 0,
    sortOrder: idx,
  }));

  const colors = Array.isArray(raw.colors) && raw.colors.length > 0
    ? raw.colors
    : [{ name: { en: "Desert Sand", ar: "رمال الصحراء" }, hex: "#C8A77D" }];

  return {
    id,
    slug,
    price: typeof raw.price === "number" && !isNaN(raw.price) && raw.price >= 0 ? raw.price : 0,
    compareAtPrice: typeof raw.compareAtPrice === "number" && !isNaN(raw.compareAtPrice) && raw.compareAtPrice > (raw.price ?? 0) ? raw.compareAtPrice : undefined,
    currency: raw.currency || "USD",
    images,
    sizes,
    stock,
    colors,
    fit: raw.fit || { en: "Relaxed fit", ar: "قصة مريحة" },
    features: Array.isArray(raw.features) ? raw.features : [],
    measurements: raw.measurements,
    available: raw.available !== undefined ? Boolean(raw.available) : true,
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt || now,
    updatedAt: now,
    translations: {
      en: {
        name: raw.translations?.en?.name || "Untitled Product",
        description: raw.translations?.en?.description || "",
        artwork: raw.translations?.en?.artwork || "Embroidered artwork",
      },
      ar: {
        name: raw.translations?.ar?.name || "منتج بدون عنوان",
        description: raw.translations?.ar?.description || "",
        artwork: raw.translations?.ar?.artwork || "تطريز مستوحى من الرحلة",
      },
    },
  };
}
