import { catalog } from "@/lib/server/catalog";
import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const data = await catalog();
  return [
    ...new Set([
      "/",
      "/hotels",
      "/rooms",
      "/about",
      "/offers",
      "/gallery",
      "/amenities",
      "/contact",
      "/faq",
      ...data.hotels.map((h) => `/hotels/${h.id}`),
      ...data.rooms.map((r) => `/hotels/${r.hotelId}/rooms/${r.slug}`),
      ...data.content.map((c) => `/${c.slug}`),
    ]),
  ].map((route) => ({ url: base + route }));
}
