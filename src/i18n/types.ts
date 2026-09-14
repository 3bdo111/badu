export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export type Direction = "ltr" | "rtl";

export const LOCALE_COOKIE = "badu-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function directionFor(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Dot-notation paths of the dictionary, e.g. "hero.title" — used for `t()` keys. */
export type DictionaryPath<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : `${Prefix}${K}` | DictionaryPath<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export interface FaqItem {
  q: string;
  a: string;
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  common: {
    skipToContent: string;
    menuOpen: string;
    menuClose: string;
  };
  nav: {
    home: string;
    store: string;
    hoodie: string;
    story: string;
  };
  cart: {
    label: string;
    ariaLabel: string;
    title: string;
    empty: string;
    emptySubtitle: string;
    exploreCta: string;
    subtotal: string;
    viewCart: string;
    checkout: string;
    checkoutSoon: string;
    continueShopping: string;
    remove: string;
    increaseQty: string;
    decreaseQty: string;
    selectSize: string;
    added: string;
    openDrawer: string;
    closeDrawer: string;
    sizePrefix: string;
    unavailableItem: string;
    stockLimit: string;
  };
  checkout: {
    title: string;
    customerInfo: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    notes: string;
    paymentMethod: string;
    codNotice: string;
    placeOrder: string;
    submitting: string;
    orderSummary: string;
    total: string;
    confirmationTitle: string;
    confirmationMsg: string;
    orderNumber: string;
    backToShop: string;
    orderNotFound: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    arabic: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
    index: string;
  };
  product: {
    colorLabel: string;
    sizeLabel: string;
  };
  sections: {
    intro: {
      label: string;
      heading: string;
      body: string;
    };
    showcase: {
      label: string;
      frontLabel: string;
      backLabel: string;
      detail1Label: string;
      detail2Label: string;
    };
    artwork: {
      label: string;
      statement: string;
      body: string;
      caption: string;
      scene: {
        sun: string;
        mountains: string;
        camel: string;
        traveler: string;
        birds: string;
      };
    };
    story: {
      label: string;
      heading: string;
      body: string;
      philosophyHeading: string;
      philosophyBody: string;
    };
    craft: {
      label: string;
      heading: string;
      features: {
        title: string;
        body: string;
      }[];
    };
    purchase: {
      label: string;
      available: string;
      unavailable: string;
      selectSize: string;
      addToCart: string;
      added: string;
      fitLabel: string;
      artworkLabel: string;
      accordion: {
        details: string;
        fit: string;
        care: string;
        shipping: string;
        returns: string;
        detailsBody: string;
        fitBody: string;
        careBody: string;
        shippingBody: string;
        returnsBody: string;
        soon: string;
      };
    };
    sizeGuide: {
      label: string;
      heading: string;
      note: string;
      fitNote: string;
      columns: {
        size: string;
        chest: string;
        length: string;
        sleeve: string;
      };
    };
    reviews: {
      label: string;
      heading: string;
      body: string;
      verifiedBadge: string;
    };
    faq: {
      label: string;
      heading: string;
      items: FaqItem[];
    };
    finalCta: {
      heading: string;
      cta: string;
    };
  };
  footer: {
    tagline: string;
    rights: string;
    socialLabel: string;
    instagram: string;
    tiktok: string;
  };
  admin: {
    dashboard: string;
    products: string;
    orders: string;
    settings: string;
    comingSoon: string;
    addProduct: string;
    editProduct: string;
    deleteProduct: string;
    searchPlaceholder: string;
    noProducts: string;
    filterAll: string;
    filterVisible: string;
    filterHidden: string;
    filterInStock: string;
    filterOutOfStock: string;
    filterFeatured: string;
    colProduct: string;
    colPrice: string;
    colStock: string;
    colStatus: string;
    colFeatured: string;
    colActions: string;
    statusVisible: string;
    statusHidden: string;
    statusInStock: string;
    statusOutOfStock: string;
    statusFeatured: string;
    statusNotFeatured: string;
    edit: string;
    delete: string;
    confirmDeleteTitle: string;
    confirmDeleteBody: string;
    cancel: string;
    saveProduct: string;
    productSaved: string;
    productDeleted: string;
    fieldNameEn: string;
    fieldNameAr: string;
    fieldSlug: string;
    fieldPrice: string;
    fieldCurrency: string;
    fieldDescEn: string;
    fieldDescAr: string;
    fieldColorEn: string;
    fieldColorAr: string;
    fieldColorHex: string;
    fieldSizes: string;
    fieldVisibility: string;
    fieldFeatured: string;
    fieldImages: string;
    imageNotice: string;
    metricTotal: string;
    metricVisible: string;
    metricOutOfStock: string;
    metricFeatured: string;
    adminLabel: string;
    backToStore: string;
    requiredError: string;
    priceError: string;
    storefront: string;
    landingCMS: string;
    storeCMS: string;
    saveDraft: string;
    publish: string;
    sectionOrder: string;
    featuredProductSelect: string;
    sectionVisible: string;
    sectionHidden: string;
  };
  store: {
    title: string;
    subtitle: string;
    noProducts: string;
    inStock: string;
    outOfStock: string;
    exploreProduct: string;
    cardsView: string;
    listView: string;
  };
}
