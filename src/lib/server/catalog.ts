import { HOTELS, ROOMS, type Hotel, type Room } from "@/lib/catalog";
import { demoMode } from "@/lib/platform";
import "server-only";
import { configured, rest, type Session } from "./db";

export type Row = { id: string; hotel_id: string; [key: string]: unknown };
export type HotelRow = Row & {
  slug: string;
  name: string;
  description: string | null;
  status: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  logo_id: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  seo_title: string | null;
  seo_description: string | null;
  review_url: string | null;
};
export type RoomRow = Row & {
  slug: string;
  name: string;
  description: string | null;
  accommodation_category: "room" | "apartment";
  bhk_count: number | null;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  living_room: boolean;
  kitchen_available: boolean;
  base_rate_minor: number;
  currency: string;
  inventory: number;
  max_guests: number;
  published: boolean;
};
export type MediaRow = Row & {
  room_type_id: string | null;
  url: string;
  storage_path: string;
  alt_text: string;
  category: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
};
export type Slide = {
  id: string;
  heading: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image: string;
  mobileImage?: string;
  alt: string;
  hotel: string;
};
export type Catalog = {
  hotels: Hotel[];
  rooms: Room[];
  hotelRows: HotelRow[];
  roomRows: RoomRow[];
  media: MediaRow[];
  nearby: Row[];
  amenities: Row[];
  faqs: Row[];
  content: Row[];
  slides: Slide[];
  error?: string;
};
const blank = (): Catalog => ({
  hotels: [],
  rooms: [],
  hotelRows: [],
  roomRows: [],
  media: [],
  nearby: [],
  amenities: [],
  faqs: [],
  content: [],
  slides: [],
});
export async function catalog(staff?: Session): Promise<Catalog> {
  if (demoMode && !staff) return { ...blank(), hotels: HOTELS, rooms: ROOMS };
  if (!configured())
    return {
      ...blank(),
      error: "Property information is being prepared. Please check back soon.",
    };
  try {
    const token = staff?.token;
    const [hotels, rooms, media, nearby, amenities, faqs, content, slides] =
      await Promise.all([
        rest<HotelRow>("hotels", "select=*&order=name", token),
        rest<RoomRow>("room_types", "select=*&order=name", token),
        rest<MediaRow>(
          "media_assets",
          "select=*&order=sort_order,created_at",
          token,
        ),
        rest<Row>(
          "nearby_places",
          "select=*&order=sort_order,created_at",
          token,
        ),
        rest<Row>("amenities", "select=*&order=sort_order,created_at", token),
        rest<Row>("faqs", "select=*&order=sort_order,created_at", token),
        rest<Row>("site_content", "select=*", token),
        rest<Row>("hero_slides", "select=*&order=sort_order,created_at", token),
      ]);
    const mappedHotels: Hotel[] = hotels.map((h) => {
      const photos = media.filter(
        (m) =>
          m.hotel_id === h.id &&
          !m.room_type_id &&
          m.category !== "logo" &&
          m.active,
      );
      return {
        id: h.slug,
        databaseId: h.id,
        name: h.name,
        tagline: h.description?.split("\n")[0] || "Welcome to your next stay.",
        subtitle: h.name,
        description:
          h.description || "Property information will be available shortly.",
        image: (photos.find((m) => m.featured) || photos[0])?.url || "",
        gallery: photos.map((m) => m.url),
        highlight: "The collection",
        accent: "The Inn Collection",
        location:
          [h.city, h.state].filter(Boolean).join(", ") ||
          "Location details pending",
        address: h.address || "Address awaiting confirmation",
        amenities: amenities
          .filter((a) => a.hotel_id === h.id && !a.room_type_id && a.active)
          .map((a) => String(a.name)),
        checkIn: h.check_in_time?.slice(0, 5) || "To be confirmed",
        checkOut: h.check_out_time?.slice(0, 5) || "To be confirmed",
        logo: media.find((m) => m.id === h.logo_id && m.active)?.url,
      };
    });
    const mappedRooms: Room[] = rooms.map((r) => {
      const photos = media.filter((m) => m.hotel_id === r.hotel_id && m.room_type_id === r.id && m.active);
      return {
        id: r.id,
        hotelId: hotels.find((h) => h.id === r.hotel_id)?.slug || "",
        hotelName: hotels.find((h) => h.id === r.hotel_id)?.name,
        slug: r.slug,
        name: r.name,
        subtitle:
          r.accommodation_category === "apartment"
            ? `${r.bhk_count} BHK room`
            : "Guest room",
        description: r.description || "",
        image: (photos.find((m) => m.featured) || photos[0])?.url || "",
        gallery: photos.map((m) => m.url),
        baseRate: r.base_rate_minor / 100,
        inventory: r.inventory,
        guests: r.max_guests,
        size: `${r.bedrooms} bedroom(s) · ${r.bathrooms} bathroom(s)`,
        bed: `${r.beds} bed(s)`,
        amenities: amenities
          .filter(
            (a) =>
              a.hotel_id === r.hotel_id &&
              (!a.room_type_id || a.room_type_id === r.id) &&
              a.active,
          )
          .map((a) => String(a.name)),
        live: true,
      };
    });
    return {
      hotels: mappedHotels,
      rooms: mappedRooms,
      hotelRows: hotels,
      roomRows: rooms,
      media,
      nearby,
      amenities,
      faqs,
      content,
      slides: slides
        .filter((s) => s.active)
        .flatMap((s) => {
          const img = media.find((m) => m.hotel_id === s.hotel_id && m.id === s.image_id && m.active);
          return img
            ? [
                {
                  id: s.id,
                  heading: String(s.heading),
                  subtitle: String(s.subtitle),
                  cta_text: String(s.cta_text),
                  cta_link: String(s.cta_link),
                  image: img.url,
                  mobileImage: media.find(
                    (m) => m.hotel_id === s.hotel_id && m.id === s.mobile_image_id && m.active,
                  )?.url,
                  alt: img.alt_text,
                  hotel: hotels.find((h) => h.id === s.hotel_id)?.slug || "",
                },
              ]
            : [];
        }),
    };
  } catch {
    return {
      ...blank(),
      error:
        "We could not load property information. Please try again shortly.",
    };
  }
}
