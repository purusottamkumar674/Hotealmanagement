import { demoMode } from "@/lib/platform";
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return !demoMode && process.env.SITE_INDEXING_ENABLED === "true"
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin",
            "/admin-login",
            "/api/",
            "/account",
            "/checkout",
            "/booking/",
            "/search",
            "/login",
            "/signup",
            "/forgot-password",
          ],
        },
        sitemap: `${base}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
