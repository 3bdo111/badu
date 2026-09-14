import type { Product } from "@/lib/types/product";

const IMAGE_BASE = "/images/products/badu-hoodie";

export const initialProducts: Product[] = [
  {
    id: "bd-hoodie-001",
    slug: "badu-hoodie",
    price: 120,
    currency: "USD",
    images: [
      {
        id: "img-001-front",
        src: `${IMAGE_BASE}/front-v6.jpg`,
        alt: {
          en: "BADU Desert Sand hoodie front",
          ar: "هودي BADU باللون الرملي من الأمام",
        },
        isPrimary: true,
        sortOrder: 0,
      },
      {
        id: "img-001-back",
        src: `${IMAGE_BASE}/back-v6.jpg`,
        alt: {
          en: "BADU Desert Sand hoodie back embroidery",
          ar: "تطريز ظهر هودي BADU باللون الرملي",
        },
        isPrimary: false,
        sortOrder: 1,
      },
      {
        id: "img-001-detail1",
        src: `${IMAGE_BASE}/detail-1-v2.jpg`,
        alt: {
          en: "BADU Desert Sand hoodie chest sun embroidery macro close-up",
          ar: "تفاصيل ماكرو لتطريز الشمس على الصدر لهودي BADU",
        },
        isPrimary: false,
        sortOrder: 2,
      },
      {
        id: "img-001-detail2",
        src: `${IMAGE_BASE}/detail-2-v2.jpg`,
        alt: {
          en: "BADU Desert Sand hoodie back embroidery macro close-up",
          ar: "تفاصيل ماكرو لتطريز الظهر الصحراوي لهودي BADU",
        },
        isPrimary: false,
        sortOrder: 3,
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: {
      S: 10,
      M: 10,
      L: 8,
      XL: 5,
    },
    colors: [
      {
        name: { en: "Desert Sand", ar: "رمال الصحراء" },
        hex: "#C8A77D",
      },
    ],
    fit: { en: "Relaxed fit", ar: "قصة مريحة" },
    features: [
      {
        title: { en: "HEAVYWEIGHT FABRIC", ar: "قماش ثقيل" },
        body: {
          en: "A substantial feel designed for everyday comfort and structure.",
          ar: "خامة ذات إحساس متين، مصممة للراحة والشكل في الاستخدام اليومي.",
        },
      },
      {
        title: { en: "RELAXED FIT", ar: "قصة مريحة" },
        body: {
          en: "A relaxed silhouette made for effortless everyday wear.",
          ar: "قصة مريحة تمنحك مظهرًا طبيعيًا وسهلًا كل يوم.",
        },
      },
      {
        title: { en: "EMBROIDERED ARTWORK", ar: "تطريز مستوحى من الرحلة" },
        body: {
          en: "The back artwork gives the hoodie its defining character.",
          ar: "التطريز الخلفي يمنح الهودي هويته البصرية المميزة.",
        },
      },
      {
        title: { en: "DESERT SAND", ar: "رملي صحراوي" },
        body: {
          en: "A warm neutral tone inspired by the landscape that shaped the collection.",
          ar: "درجة دافئة ومحايدة مستوحاة من المشهد الذي شكّل روح المجموعة.",
        },
      },
    ],
    available: true,
    featured: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    translations: {
      en: {
        name: "The Journey Hoodie",
        description:
          "The Journey Hoodie is a heavyweight, relaxed-fit silhouette in Desert Sand, finished with embroidered artwork inspired by the road, the mountains, and the open desert.",
        artwork:
          "The artwork brings together the sun, mountains, and the road into a single scene inspired by desert journeys.",
      },
      ar: {
        name: "هودي الرحلة",
        description:
          "هودي الرحلة بقصة مريحة وخامة ثقيلة باللون الرملي الصحراوي، مع تطريز مستوحى من الطريق والجبال واتساع الصحراء.",
        artwork:
          "يجمع التطريز بين الشمس والجبال والطريق في مشهد واحد مستوحى من رحلات الصحراء.",
      },
    },
  },
];
