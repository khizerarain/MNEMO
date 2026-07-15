import type { MetadataRoute } from "next";

const siteUrl = "https://mnemo.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
