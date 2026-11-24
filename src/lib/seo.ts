import type { HotelRow, Row } from "./server/catalog";
export function hotelSchema(h: HotelRow, amenities: Row[]) {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: h.name,
    url: `${base}/hotels/${h.slug}`,
    ...(h.description ? { description: h.description } : {}),
    ...(h.contact_phone ? { telephone: h.contact_phone } : {}),
    ...(h.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: h.address,
            addressLocality: h.city || undefined,
            addressRegion: h.state || undefined,
            postalCode: h.postal_code || undefined,
            addressCountry: h.country,
          },
        }
      : {}),
    ...(h.latitude != null && h.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: Number(h.latitude),
            longitude: Number(h.longitude),
          },
        }
      : {}),
    ...(h.google_maps_url ? { hasMap: h.google_maps_url } : {}),
    amenityFeature: amenities
      .filter((a) => !a.room_type_id && a.active)
      .map((a) => ({
        "@type": "LocationFeatureSpecification",
        name: String(a.name),
        value: true,
      })),
  };
}
export const jsonLd = (value: unknown) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");
