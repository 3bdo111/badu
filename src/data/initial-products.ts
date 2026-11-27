import type { Product } from "@/lib/types/product";

const IMAGE_BASE = "/images/products/badu-hoodie";
const BLOB_BASE =
  "https://fvidz2mv6avjliic.public.blob.vercel-storage.com/products/badu-hoodie";

export const initialProducts: Product[] = [
  {
    id: "d55c9f50-d2ca-46e8-a6df-22854126cab6",
    slug: "desert-x",
    price: 1500,
    currency: "EGP",
    images: [
      {
        id: "img-desertx-front-cream",
        src: "/images/products/desert-x/front-cream.jpg",
        alt: {
          en: "Desert X black hoodie front on cream",
          ar: "الهودي الأسود من الأمام على خلفية كريمي",
        },
        isPrimary: true,
        sortOrder: 0,
        colorKey: "black",
      },
      {
        id: "img-desertx-front",
        src: "/images/products/desert-x/front.jpg",
        alt: {
          en: "Desert X black hoodie front",
          ar: "الهودي الأسود من الأمام",
        },
        isPrimary: false,
        sortOrder: 1,
        colorKey: "black",
      },
      {
        id: "img-desertx-back",
        src: "/images/products/desert-x/back.jpg",
        alt: {
          en: "Desert X black hoodie back",
          ar: "الهودي الأسود من الضهر",
        },
        isPrimary: false,
        sortOrder: 2,
        colorKey: "black",
      },
      {
        id: "img-desertx-brown-front",
        src: "/images/products/desert-x/brown-front.jpg",
        alt: {
          en: "Desert X earth brown hoodie front",
          ar: "الهودي البني الترابي من الأمام",
        },
        isPrimary: false,
        sortOrder: 3,
        colorKey: "earth-brown",
      },
      {
        id: "img-desertx-brown-back",
        src: "/images/products/desert-x/brown-back.jpg",
        alt: {
          en: "Desert X earth brown hoodie back",
          ar: "الهودي البني الترابي من الضهر",
        },
        isPrimary: false,
        sortOrder: 4,
        colorKey: "earth-brown",
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 10, M: 10, L: 10, XL: 10 },
    colors: [
      { name: { en: "Black", ar: "أسود" }, hex: "#1C1A17" },
      { name: { en: "Earth Brown", ar: "بني ترابي" }, hex: "#5B4A3C" },
    ],
    fit: { en: "Relaxed fit", ar: "قصة واسعة" },
    features: [
      {
        title: { en: "HEAVYWEIGHT FABRIC", ar: "قماش تقيل" },
        body: {
          en: "Substantial feel for structure and wear.",
          ar: "خامة تقيلة بتدّي شكل ثابت وراحة في اللبس.",
        },
      },
      {
        title: { en: "RELAXED FIT", ar: "قصة واسعة" },
        body: {
          en: "Relaxed silhouette for everyday wear.",
          ar: "قصة واسعة مريحة لكل يوم.",
        },
      },
      {
        title: { en: "EMBROIDERED ARTWORK", ar: "تطريز مميز" },
        body: {
          en: "Back artwork defining character.",
          ar: "التطريز اللي على الظهر هو اللي بيميّز الهودي.",
        },
      },
    ],
    faqs: [
      {
        question: { en: "How does the hoodie fit?", ar: "قصة الهودي إيه؟" },
        answer: {
          en: "It features a relaxed streetwear fit.",
          ar: "قصته واسعة ستريت وير، مريحة وطبيعية.",
        },
      },
    ],
    sizeGuide: {
      enabled: true,
      title: { en: "Size Guide", ar: "دليل المقاسات" },
      unit: "cm",
      columns: ["Size", "Chest", "Length", "Sleeve"],
      rows: [
        { Size: "S", Chest: "58", Length: "68", Sleeve: "60" },
        { Size: "M", Chest: "60", Length: "70", Sleeve: "61" },
        { Size: "L", Chest: "62", Length: "72", Sleeve: "62" },
        { Size: "XL", Chest: "64", Length: "74", Sleeve: "64" },
      ],
      notes: {
        en: "Relaxed oversized fit. Take your normal size.",
        ar: "قصة واسعة. خد مقاسك المعتاد.",
      },
    },
    storyContent: {
      title: { en: "BUILT FOR THE JOURNEY", ar: "معمول للرحلة" },
      description: {
        en: "Inspired by open desert landscapes and open paths.",
        ar: "مستوحى من الصحرا المفتوحة والطرق اللي ملهاش آخر.",
      },
      images: ["/images/products/desert-x/front-cream.jpg"],
    },
    artworkContent: {
      title: { en: "ARTWORK & SYMBOLISM", ar: "التطريز ومعناه" },
      description: {
        en: "Detailed back embroidery celebrating movement.",
        ar: "تطريز على الظهر بيحكي عن الحركة والرحلة.",
      },
      images: ["/images/products/desert-x/brown-front.jpg"],
      captions: [
        { en: "Embroidered artwork", ar: "تطريز مستوحى من الرحلة" },
      ],
    },
    seo: {
      title: { en: "Desert X Hoodie", ar: "Desert X" },
      metaDescription: {
        en: "Oversized embroidered hoodie in black and earth brown. Sun and desert ridge embroidery across the chest, back and sleeve. Cash on delivery across Egypt.",
        ar: "هودي أوفرسايز مطرز بالأسود والبني الترابي، بتطريز شمس وجبال الصحرا على الصدر والضهر والكم. الدفع عند الاستلام في كل مصر.",
      },
      ogImage: "/images/products/desert-x/front-cream.jpg",
      indexable: true,
    },
    status: "PUBLISHED",
    sortOrder: 0,
    available: true,
    featured: true,
    createdAt: "2026-11-27T19:13:03.777Z",
    updatedAt: "2026-11-27T21:27:44.272Z",
    translations: {
      en: {
        name: "Desert X",
        description:
          "Oversized embroidered hoodie in black and earth brown. Sun and desert ridge embroidery across the chest, back and sleeve. Cash on delivery across Egypt.",
        artwork: "Embroidered artwork",
      },
      ar: {
        name: "Desert X",
        description:
          "هودي أوفرسايز مطرز بلونين، أسود وبني ترابي. تطريز شمس وجبال الصحرا على الصدر والضهر والكم. الدفع عند الاستلام في كل مصر.",
        artwork: "تطريز مستوحى من الرحلة",
      },
    },
  },
  {
    id: "bd-hoodie-001",
    slug: "badu-hoodie",
    price: 1199.99,
    compareAtPrice: 1500,
    currency: "EGP",
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
    fit: { en: "Relaxed fit", ar: "قصة واسعة" },
    features: [
      {
        title: { en: "HEAVYWEIGHT FABRIC", ar: "قماش تقيل" },
        body: {
          en: "A substantial feel designed for everyday comfort and structure.",
          ar: "خامة تقيلة بتدّي شكل حلو وراحة في اللبس اليومي.",
        },
      },
      {
        title: { en: "RELAXED FIT", ar: "قصة واسعة" },
        body: {
          en: "A relaxed silhouette made for effortless everyday wear.",
          ar: "قصة واسعة مريحة بتدّيك لوك طبيعي كل يوم.",
        },
      },
      {
        title: { en: "EMBROIDERED ARTWORK", ar: "تطريز على الظهر" },
        body: {
          en: "The back artwork gives the hoodie its defining character.",
          ar: "التطريز اللي على الظهر هو اللي بيميّز الهودي.",
        },
      },
      {
        title: { en: "DESERT SAND", ar: "رملي صحراوي" },
        body: {
          en: "A warm neutral tone inspired by the landscape that shaped the collection.",
          ar: "لون دافي وهادي مستوحى من الصحرا اللي شكّلت التشكيلة.",
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
          "هودي الرحلة بقصة واسعة وخامة تقيلة بلون رملي صحراوي، مع تطريز مستوحى من الطريق والجبال والصحرا.",
        artwork:
          "التطريز بيجمع الشمس والجبال والطريق في مشهد واحد مستوحى من رحلات الصحرا.",
      },
    },
  },
];
