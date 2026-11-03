/**
 * Canonical landing-page section registry — the single source of truth that
 * connects the BADU admin CMS with the storefront landing page.
 *
 * Every section rendered on `/` must have a definition here. The database
 * seeder (`src/lib/db/seed.ts`) uses this list to create any missing
 * `storefront_sections` rows, and both admin editors (the classic storefront
 * page and the visual editor) use it for bilingual labels and field hints.
 *
 * Structured section bodies (trust items, craft features, FAQs, reviews,
 * size rows) use a simple pipe format, one item per line:
 *
 *   trust_bar   →  "🧵 | 480GSM Organic Cotton Fleece"
 *   features    →  "Heavyweight Fabric | Body copy for the feature"
 *   faq         →  "Question text? | Answer text"
 *   reviews     →  "Author Name | 5 | Review text"
 *   size_guide  →  "S | 58 cm | 68 cm | 61 cm"
 *
 * Empty section fields always fall back to the built-in translations so a
 * freshly seeded section renders exactly like the previous hard-coded version.
 */

export type SectionBodyFormat =
  | "plain"
  | "lines-icon-text"
  | "lines-title-text"
  | "lines-question-answer"
  | "lines-author-rating-text"
  | "lines-size-row";

export interface LandingSectionDefinition {
  key: string;
  labelEn: string;
  labelAr: string;
  /** Default content used when the seeder creates the row. Empty strings keep the legacy translation fallback. */
  defaults: {
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    bodyEn: string;
    bodyAr: string;
    ctaLabelEn: string;
    ctaLabelAr: string;
    ctaUrl: string;
    imageUrl: string;
  };
  /** Admin editors show CTA label (EN/AR) + URL fields for these sections. */
  hasCta: boolean;
  /** Admin editors show the media picker for these sections. */
  hasImage: boolean;
  /** Admin editors show the featured-product selector for these sections. */
  hasFeaturedProduct: boolean;
  bodyFormat: SectionBodyFormat;
  /** Hint shown above the body textarea in the admin editors. */
  bodyHintEn: string;
  bodyHintAr: string;
}

const emptyDefaults = {
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  bodyEn: "",
  bodyAr: "",
  ctaLabelEn: "",
  ctaLabelAr: "",
  ctaUrl: "",
  imageUrl: "",
};

export const LANDING_SECTIONS: LandingSectionDefinition[] = [
  {
    key: "hero",
    labelEn: "Hero Section",
    labelAr: "الواجهة الرئيسية (Hero)",
    defaults: {
      ...emptyDefaults,
      titleEn: "MADE FOR THE JOURNEY",
      titleAr: "صُنِعَ للرحلة",
      subtitleEn:
        "Desert inspired. Modern streetwear crafted with intention and heavyweight organic cotton.",
      subtitleAr:
        "مستوحى من الصحراء. ملابس شريعية عصرية صُنعت بعناية من القطن العضوي الثقيل.",
      ctaLabelEn: "EXPLORE HOODIE",
      ctaLabelAr: "استكشف الهودي",
      ctaUrl: "#hoodie",
    },
    hasCta: true,
    hasImage: false,
    hasFeaturedProduct: true,
    bodyFormat: "plain",
    bodyHintEn: "Plain text — not used by the hero section.",
    bodyHintAr: "نص عادي — لا يستخدمه قسم الواجهة.",
  },
  {
    key: "trust_bar",
    labelEn: "Trust Bar",
    labelAr: "شريط الثقة",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "lines-icon-text",
    bodyHintEn: "One item per line: ICON | Text  (e.g. 🚚 | Express 2-4 Day Delivery)",
    bodyHintAr: "عنصر في كل سطر: أيقونة | النص (مثال: 🚚 | شحن سريع خلال 2-4 أيام)",
  },
  {
    key: "product_intro",
    labelEn: "Brand Introduction",
    labelAr: "مقدمة العلامة التجارية",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn: "Title overrides the section heading; body overrides the intro paragraph.",
    bodyHintAr: "العنوان يستبدل ترويسة القسم، والنص يستبدل فقرة المقدمة.",
  },
  {
    key: "product_showcase",
    labelEn: "Product Showcase",
    labelAr: "عرض المنتج (التصوير)",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn: "Title overrides the small section label. Photos come from the featured product's gallery — edit them on the Products page (تعديل المنتج).",
    bodyHintAr: "العنوان يستبدل التسمية الصغيرة أعلى الشبكة. الصور نفسها من معرض صور المنتج المميز — عدّلها من صفحة المنتجات.",
  },
  {
    key: "product_grid",
    labelEn: "Featured Products Grid",
    labelAr: "شبكة المنتجات المميزة",
    defaults: {
      ...emptyDefaults,
      titleEn: "THE COLLECTION",
      titleAr: "المجموعة",
      subtitleEn: "Every piece, ready for the journey.",
      subtitleAr: "كل قطعة، جاهزة للرحلة.",
    },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn:
      "Subtitle sets the number of products shown (e.g. 4). Empty = 4. Only products flagged 'Featured Product on Home' in the admin appear here; if none are flagged, all available products are shown.",
    bodyHintAr:
      "العنوان الفرعي يحدد عدد المنتجات المعروضة (مثال: 4). فارغ = 4. تظهر هنا فقط المنتجات المفعّل لها «منتج مميز في الرئيسية» من الأدمن؛ وإن لم يوجد يُعرض كل المنتجات المتاحة.",
  },
  {
    key: "story",
    labelEn: "Brand Story",
    labelAr: "قصة العلامة (Our Story)",
    defaults: { ...emptyDefaults, imageUrl: "/images/story.jpg" },
    hasCta: false,
    hasImage: true,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn: "Body = story paragraph. Image replaces the default product photo.",
    bodyHintAr: "النص = فقرة القصة. الصورة تستبدل صورة المنتج الافتراضية.",
  },
  {
    key: "artwork",
    labelEn: "Artwork / Craftsmanship",
    labelAr: "اللوحة الفنية والتطريز",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: true,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn: "Title = statement heading; body = description under it. The section image REPLACES the main artwork photo (default: product gallery).",
    bodyHintAr: "العنوان = ترويسة العبارة؛ النص = الوصف أسفلها. صورة القسم تستبدل صورة التطريز الرئيسية (الافتراضي: معرض صور المنتج).",
  },
  {
    key: "campaign",
    labelEn: "Lifestyle Campaign",
    labelAr: "حملة لايف ستايل",
    defaults: {
      ...emptyDefaults,
      titleEn: "BORN OF THE DESERT",
      titleAr: "وُلِد من الصحراء",
      subtitleEn: "BADU is a conversation between heritage and the street.",
      subtitleAr: "بادو حوارٌ بين الأصالة والشارع.",
      ctaLabelEn: "SHOP THE COLLECTION",
      ctaLabelAr: "تسوّق المجموعة",
      ctaUrl: "/store",
      imageUrl: "/images/story.jpg",
    },
    hasCta: true,
    hasImage: true,
    hasFeaturedProduct: false,
    bodyFormat: "plain",
    bodyHintEn: "Full-bleed campaign banner. Image is required (falls back to the story image).",
    bodyHintAr: "بانر حملة بعرض كامل. الصورة مطلوبة (تسقط على صورة القصة عند غيابها).",
  },
  {
    key: "featured_product",
    labelEn: "Featured Product (Purchase)",
    labelAr: "المنتج المميز (الشراء)",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: true,
    bodyFormat: "plain",
    bodyHintEn: "Title overrides the small label above the product name.",
    bodyHintAr: "العنوان يستبدل التسمية الصغيرة أعلى اسم المنتج.",
  },
  {
    key: "features",
    labelEn: "Craft & Details",
    labelAr: "الحرفية والتفاصيل",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "lines-title-text",
    bodyHintEn: "One feature per line: Title | Body text",
    bodyHintAr: "ميزة في كل سطر: العنوان | نص الميزة",
  },
  {
    key: "size_guide",
    labelEn: "Size Guide",
    labelAr: "دليل المقاسات",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "lines-size-row",
    bodyHintEn:
      'One size per line: Size | Chest | Length | Sleeve  (e.g. L | 64 cm | 74 cm | 65 cm). Empty = built-in table.',
    bodyHintAr:
      "مقاس في كل سطر: المقاس | الصدر | الطول | الكم (مثال: L | 64 cm | 74 cm | 65 cm). فارغ = الجدول المدمج.",
  },
  {
    key: "reviews",
    labelEn: "Reviews & Trust",
    labelAr: "آراء العملاء والثقة",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "lines-author-rating-text",
    bodyHintEn:
      "One review per line: Author | Rating 1-5 | Review text. Only genuine, verified reviews. Empty = trust badges only.",
    bodyHintAr:
      "رأي في كل سطر: الاسم | التقييم 1-5 | نص الرأي. فقط آراء حقيقية موثقة. فارغ = شارات الثقة فقط.",
  },
  {
    key: "faq",
    labelEn: "FAQ",
    labelAr: "الأسئلة الشائعة",
    defaults: { ...emptyDefaults },
    hasCta: false,
    hasImage: false,
    hasFeaturedProduct: false,
    bodyFormat: "lines-question-answer",
    bodyHintEn: "One FAQ per line: Question | Answer. Empty = built-in translated FAQs.",
    bodyHintAr: "سؤال في كل سطر: السؤال | الجواب. فارغ = الأسئلة المدمجة المترجمة.",
  },
  {
    key: "final_cta",
    labelEn: "Final CTA",
    labelAr: "دعوة الشراء الأخيرة",
    defaults: { ...emptyDefaults },
    hasCta: true,
    hasImage: false,
    hasFeaturedProduct: true,
    bodyFormat: "plain",
    bodyHintEn: "Title overrides the headline; subtitle = supporting line under it.",
    bodyHintAr: "العنوان يستبدل الترويسة؛ العنوان الفرعي = السطر التوضيحي أسفلها.",
  },
];

/** Canonical render order used when (re)seeding — admin reorder persists afterwards. */
export const LANDING_SECTION_ORDER: string[] = LANDING_SECTIONS.map((s) => s.key);

export function getSectionDefinition(key: string): LandingSectionDefinition | undefined {
  return LANDING_SECTIONS.find((s) => s.key === key);
}

/**
 * Parse a structured section body into rows of pipe-separated cells.
 * Blank lines are skipped; surrounding whitespace is trimmed.
 */
export function parseSectionBodyLines(body: string | null | undefined): string[][] {
  if (!body) return [];
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()));
}
