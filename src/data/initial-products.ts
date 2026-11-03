import type { Product } from "@/lib/types/product";

const IMAGE_BASE = "/images/products/badu-hoodie";
const BLOB_BASE =
  "https://fvidz2mv6avjliic.public.blob.vercel-storage.com/products/badu-hoodie";

export const initialProducts: Product[] = [
  {
    id: "bd-hoodie-001",
    slug: "badu-hoodie",
    price: 120,
    currency: "USD",
    images: [
      {
        id: "img-001-front",
        src: `${IMAGE_BASE}/front-v6.webp`,
        alt: {
          en: "BADU Desert Sand hoodie front",
          ar: "هودي BADU باللون الرملي من الأمام",
        },
        isPrimary: true,
        sortOrder: 0,
        colorKey: "desert-sand",
      },
      {
        id: "img-001-back",
        src: `${IMAGE_BASE}/back-v6.webp`,
        alt: {
          en: "BADU Desert Sand hoodie back embroidery",
          ar: "تطريز ظهر هودي BADU باللون الرملي",
        },
        isPrimary: false,
        sortOrder: 1,
        colorKey: "desert-sand",
      },
      {
        id: "img-001-detail1",
        src: `${IMAGE_BASE}/detail-1-v2.webp`,
        alt: {
          en: "BADU Desert Sand hoodie chest sun embroidery macro close-up",
          ar: "تفاصيل ماكرو لتطريز الشمس على الصدر لهودي BADU",
        },
        isPrimary: false,
        sortOrder: 2,
        colorKey: "desert-sand",
      },
      {
        id: "img-001-detail2",
        src: `${IMAGE_BASE}/detail-2-v2.webp`,
        alt: {
          en: "BADU Desert Sand hoodie back embroidery macro close-up",
          ar: "تفاصيل ماكرو لتطريز الظهر الصحراوي لهودي BADU",
        },
        isPrimary: false,
        sortOrder: 3,
        colorKey: "desert-sand",
      },
      {
        id: "img-001-black",
        src: "/images/campaign/model-black.jpg",
        alt: {
          en: "BADU hoodie in Black worn by model",
          ar: "هودي BADU باللون الأسود على الموديل",
        },
        isPrimary: false,
        sortOrder: 4,
        colorKey: "black",
      },
      {
        id: "img-001-blue-front",
        src: `${BLOB_BASE}/blue-front.jpg`,
        alt: { en: "BADU Slate Blue hoodie front", ar: "هودي بادو أزرق سليت من الأمام" },
        isPrimary: false,
        sortOrder: 5,
        colorKey: "slate-blue",
      },
      {
        id: "img-001-blue-back",
        src: `${BLOB_BASE}/blue-back.jpg`,
        alt: {
          en: "BADU Slate Blue hoodie back with camel embroidery",
          ar: "تطريز الظهر لهودي بادو أزرق سليت",
        },
        isPrimary: false,
        sortOrder: 6,
        colorKey: "slate-blue",
      },
      {
        id: "img-001-black-front",
        src: `${BLOB_BASE}/black-front.jpg`,
        alt: {
          en: "BADU Black hoodie front with dune embroidery",
          ar: "هودي بادو أسود من الأمام بتطريز الكثبان",
        },
        isPrimary: false,
        sortOrder: 7,
        colorKey: "black",
      },
      {
        id: "img-001-black-back",
        src: `${BLOB_BASE}/black-back.jpg`,
        alt: {
          en: "BADU Black hoodie back with dune and sun embroidery",
          ar: "تطريز الظهر لهودي بادو الأسود",
        },
        isPrimary: false,
        sortOrder: 8,
        colorKey: "black",
      },
      {
        id: "img-001-black-side",
        src: `${BLOB_BASE}/black-side.jpg`,
        alt: { en: "BADU Black hoodie side view", ar: "هودي بادو أسود من الجانب" },
        isPrimary: false,
        sortOrder: 9,
        colorKey: "black",
      },
      {
        id: "img-001-brown-front",
        src: `${BLOB_BASE}/brown-front.jpg`,
        alt: {
          en: "BADU Earth Brown hoodie front with dune embroidery",
          ar: "هودي بادو بني ترابي من الأمام",
        },
        isPrimary: false,
        sortOrder: 10,
        colorKey: "earth-brown",
      },
      {
        id: "img-001-brown-back",
        src: `${BLOB_BASE}/brown-back.jpg`,
        alt: {
          en: "BADU Earth Brown hoodie back with sun and birds embroidery",
          ar: "تطريز الظهر لهودي بادو البني الترابي",
        },
        isPrimary: false,
        sortOrder: 11,
        colorKey: "earth-brown",
      },
      {
        id: "img-001-brown-back2",
        src: `${BLOB_BASE}/brown-back-2.jpg`,
        alt: { en: "BADU Earth Brown hoodie back view", ar: "هودي بادو بني ترابي من الخلف" },
        isPrimary: false,
        sortOrder: 12,
        colorKey: "earth-brown",
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
      {
        name: { en: "Black", ar: "أسود" },
        hex: "#1C1A17",
      },
      {
        name: { en: "Slate Blue", ar: "أزرق سليت" },
        hex: "#7E96A6",
      },
      {
        name: { en: "Earth Brown", ar: "بني ترابي" },
        hex: "#5B4A3C",
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
