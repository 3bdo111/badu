import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Static public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getSiteUrl("/store"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic visible product routes
  try {
    const visibleProducts = await serverProductRepository.getVisible();
    for (const product of visibleProducts) {
      const isIndexable = product.seo?.indexable !== false;
      const isPublished = !product.status || product.status === "PUBLISHED";
      if (product.slug && product.available && isPublished && isIndexable) {
        routes.push({
          url: getSiteUrl(`/products/${product.slug}`),
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // If DB is unavailable during dynamic rendering, return baseline static routes
  }

  return routes;
}
