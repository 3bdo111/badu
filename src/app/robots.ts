import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/cart", "/checkout", "/checkout/*", "/confirmation/*", "/api/*"],
      },
    ],
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}
