import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";

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
  const visibleProducts = serverProductRepository.getVisible();
  for (const product of visibleProducts) {
    if (product.slug && product.available) {
      routes.push({
        url: getSiteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return routes;
}
