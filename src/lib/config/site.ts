export const SITE_CONFIG = {
  name: "BADU",
  shortName: "BADU",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://badu.store",
  defaultTitle: {
    en: "BADU — Made for the Journey",
    ar: "بادو — صُنِعَ للرحلة",
  },
  defaultDescription: {
    en: "A modern desert-inspired hoodie shaped by the road, the desert, and the stories that travel with us.",
    ar: "هودي عصري مستوحى من الصحراء، والطريق، والحكايات التي ترافقنا في كل رحلة.",
  },
  twitterHandle: "@badustore",
  ogImage: "/images/og-image.jpg",
};

/**
 * Returns absolute canonical URL for a given relative path.
 */
export function getSiteUrl(path: string = ""): string {
  const baseUrl = SITE_CONFIG.url.replace(/\/+$/, "");
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${baseUrl}${cleanPath}`;
}
