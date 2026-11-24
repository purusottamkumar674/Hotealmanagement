import { z } from "zod";

export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const uuid = z.uuid();
const text = (max = 200) => z.string().trim().max(max);
const required = (max = 200) => text(max).min(1);
const nullableText = (max = 200) => text(max).nullable().optional();
const integer = (min: number, max: number) =>
  z.number().int().min(min).max(max);
export const isoDate = z.iso.date();
export const mapsUrl = z
  .string()
  .url()
  .refine((value) => {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      [
        "www.google.com",
        "google.com",
        "maps.google.com",
        "search.google.com",
        "g.page",
        "maps.app.goo.gl",
        "goo.gl",
      ].includes(u.hostname)
    );
  }, "Use a Google Maps HTTPS link");
const base = { hotel_id: uuid };
const status = {
  active: z.boolean().default(false),
  sort_order: integer(0, 10000).default(0),
};
export const contentSchemas = {
  "seo-observations": z
    .object({
      ...base,
      keyword: required(500),
      observed_on: isoDate,
      search_location: required(500),
      metric_type: z.enum(["maps", "organic"]),
      observed_position: integer(1, 1000).nullable().optional(),
      source_note: required(2000),
      evidence_url: z
        .url()
        .refine((v) => new URL(v).protocol === "https:")
        .nullable()
        .optional(),
    })
    .strict(),
  hotels: z
    .object({
      name: required(),
      sample_images_enabled:z.boolean().default(true),
      slug: z.enum(["flower-inn", "petal-inn"]),
      description: nullableText(10000),
      address: nullableText(1000),
      city: nullableText(),
      state: nullableText(),
      country: required(),
      postal_code: nullableText(20),
      latitude: z.number().min(-90).max(90).nullable().optional(),
      longitude: z.number().min(-180).max(180).nullable().optional(),
      google_maps_url: mapsUrl.nullable().optional(),
      google_place_id: nullableText(),
      contact_email: z.email().nullable().optional(),
      contact_phone: nullableText(30),
      check_in_time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/)
        .nullable()
        .optional(),
      check_out_time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/)
        .nullable()
        .optional(),
      logo_id: uuid.nullable().optional(),
      status: z.enum(["draft", "published", "archived"]),
      booking_enabled: z.boolean().default(false),
      pay_at_property: z.boolean().default(false),
      tax_approved: z.boolean().default(false),
      tax_basis_points: integer(0, 10000).default(0),
      seo_title: nullableText(160),
      seo_description: nullableText(320),
      review_url: mapsUrl.nullable().optional(),
      local_keywords: text(2000).default(""),
    })
    .strict()
    .refine(
      (x) => (x.latitude == null) === (x.longitude == null),
      "Supply both coordinates",
    ),
  accommodations: z
    .object({
      ...base,
      name: required(),
      slug: required(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      description: nullableText(10000),
      accommodation_category: z.enum(["room", "apartment"]),
      bhk_count: integer(1, 3).nullable().optional(),
      bedrooms: integer(0, 20).default(1),
      bathrooms: integer(0, 20).default(1),
      beds: integer(0, 30).default(1),
      living_room: z.boolean().default(false),
      kitchen_available: z.boolean().default(false),
      max_guests: integer(1, 30),
      inventory: integer(0, 1000),
      base_rate_minor: integer(0, 100000000),
      pricing_change_reason: required(1000),
      currency: z.literal("INR").default("INR"),
      published: z.boolean().default(false),
    })
    .strict()
    .refine(
      (x) =>
        x.accommodation_category === "apartment"
          ? x.bhk_count != null && x.bedrooms === x.bhk_count
          : x.bhk_count == null,
      "Apartments require a matching BHK and bedroom count; conventional rooms have no BHK",
    ),
  nearby: z
    .object({
      ...base,
      ...status,
      name: required(),
      category: z.enum([
        "railway",
        "airport",
        "hospital",
        "shopping",
        "restaurant",
        "attraction",
        "bus",
        "business",
        "landmark",
      ]),
      description: nullableText(2000),
      distance_km: z.number().min(0).max(10000).nullable().optional(),
      travel_time_minutes: integer(0, 100000).nullable().optional(),
      travel_mode: z
        .enum(["walking", "driving", "transit", "bicycling"])
        .default("driving"),
      google_maps_url: mapsUrl.nullable().optional(),
      source_note: required(1000),
    })
    .strict(),
  amenities: z
    .object({
      ...base,
      ...status,
      room_type_id: uuid.nullable().optional(),
      name: required(),
      icon: z
        .enum([
          "Wifi",
          "Car",
          "Wind",
          "BedDouble",
          "Coffee",
          "ShieldCheck",
          "Utensils",
          "Droplets",
          "ConciergeBell",
          "Tv",
          "Accessibility",
          "WashingMachine",
          "Zap",
        ])
        .default("BedDouble"),
      description: nullableText(2000),
      category: required(100),
    })
    .strict(),
  faqs: z
    .object({
      ...base,
      ...status,
      question: required(500),
      answer: required(10000),
      category: required(100),
    })
    .strict(),
  content: z
    .object({
      ...base,
      slug: z.enum([
        "about",
        "terms-and-conditions",
        "privacy-policy",
        "cancellation-policy",
        "booking-policy",
      ]),
      title: required(),
      body: required(30000),
      approved: z.boolean().default(false),
      active: z.boolean().default(false),
    })
    .strict(),
  "hero-slides": z
    .object({
      ...base,
      ...status,
      image_id: uuid.nullable(),
      mobile_image_id: uuid.nullable().optional(),
      heading: required(160),
      subtitle: text(1000),
      cta_text: required(80),
      cta_link: required(500).refine(
        (s) => /^\/(?!\/)[^\\]*$/.test(s),
        "Use an internal site path",
      ),
    })
    .strict(),
  gallery: z
    .object({
      ...base,
      ...status,
      room_type_id: uuid.nullable().optional(),
      alt_text: required(300),
      rights_note:text(2000).default(''),
      category: z.enum([
        "exterior",
        "reception", "rooms", "other",
        "interior",
        "bedroom",
        "living-room",
        "bathroom",
        "kitchen",
        "amenities",
        "nearby",
        "logo",
        "hero",
      ]),
      featured: z.boolean().default(false),
    })
    .strict(),
  "pricing-rules": z
    .object({
      ...base,
      room_type_id: uuid,
      name: required(),
      kind: z.enum(["season", "event", "weekend"]),
      start_date: isoDate,
      end_date: isoDate,
      weekdays: z.array(integer(0, 6)).min(1).max(7),
      rate_minor: integer(0, 100000000),
      priority: integer(0, 10000).default(0),
      approved: z.boolean().default(false),
      active: z.boolean().default(false),
      reason: required(1000),
    })
    .strict()
    .refine(
      (x) => x.end_date >= x.start_date,
      "End date must follow start date",
    )
    .refine(
      (x) =>
        x.kind !== "weekend" || x.weekdays.every((d) => d === 0 || d === 6),
      "Weekend rules must use Saturday/Sunday (6,0)",
    ),
  seo: z
    .object({
      ...base,
      title: required(1000),
      status: z.enum(["todo", "in_progress", "done"]),
    })
    .strict(),
  reviews: z
    .object({
      ...base,
      source: required(),
      external_review_id: nullableText(),
      review_content: required(10000),
      star_rating: integer(1, 5).nullable().optional(),
      reply_draft: text(10000),
      workflow_status: z.enum([
        "new",
        "draft",
        "approved",
        "published",
        "archived",
      ]),
      source_verified: z.boolean().default(false),
    })
    .strict(),
};
export type Resource = keyof typeof contentSchemas;
export const resourceTables: Record<Resource, string> = {
  "seo-observations": "seo_observations",
  hotels: "hotels",
  accommodations: "room_types",
  nearby: "nearby_places",
  amenities: "amenities",
  faqs: "faqs",
  content: "site_content",
  "hero-slides": "hero_slides",
  gallery: "media_assets",
  "pricing-rules": "pricing_rules",
  seo: "seo_tasks",
  reviews: "reviews_worklist",
};
export const staySchema = z
  .object({
    hotel: z
      .union([uuid, z.enum(["all", "flower-inn", "petal-inn"])])
      .default("all"),
    roomId: uuid.optional(),
    checkin: isoDate,
    checkout: isoDate,
    rooms: integer(1, 5).default(1),
    guests: integer(1, 150).default(2),
  })
  .strict()
  .refine((x) => {
    const nights = (Date.parse(x.checkout) - Date.parse(x.checkin)) / 86400000;
    return nights > 0 && nights <= 30;
  }, "Choose a stay of 1 to 30 nights");
export const bookingSchema = z
  .object({
    roomId: uuid,
    checkin: isoDate,
    checkout: isoDate,
    rooms: integer(1, 5),
    guests: integer(1, 150),
    name: required(100).min(2),
    email: z.email().max(254),
    phone: required(30).regex(/^\+?[\d\s()-]{8,30}$/),
    acceptedPolicies: z.literal(true),
    expectedTotalMinor: integer(0, 30000000000),
    idempotencyKey: uuid,
  })
  .strict();
export const rateSchema = z
  .object({
    hotel_id: uuid,
    room_type_id: uuid,
    from: isoDate,
    to: isoDate,
    rate_minor: integer(0, 100000000),
    weekdays: z
      .array(integer(0, 6))
      .min(1)
      .max(7)
      .default([0, 1, 2, 3, 4, 5, 6]),
    reason: required(1000),
  })
  .strict()
  .refine((x) => {
    const days = (Date.parse(x.to) - Date.parse(x.from)) / 86400000;
    return days >= 0 && days < 366;
  }, "Choose up to 366 dates, including the end date");
export type Assignment = {
  hotel_id: string | null;
  role: string;
  active: boolean;
};
export function canWrite(
  assignments: Assignment[],
  hotel: string,
  area: "content" | "pricing" | "operations" | "settings",
) {
  return assignments.some(
    (a) =>
      a.active &&
      ((["super_admin", "group_admin"].includes(a.role) &&
        a.hotel_id === null) ||
        (a.hotel_id === hotel &&
          (a.role === "property_manager" ||
            (area === "content" && a.role === "marketing") ||
            (area === "operations" && a.role === "front_desk") ||
            (area === "pricing" && a.role === "finance")))),
  );
}
export function resourceArea(resource: Resource) {
  return resource === "hotels" || resource === "accommodations"
    ? "settings"
    : resource === "pricing-rules"
      ? "pricing"
      : "content";
}
export function validateImage(bytes: Uint8Array, mime: string) {
  if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024)
    throw new Error("Images must be between 1 byte and 8 MB");
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(
    (mime === "image/jpeg" && jpg) ||
    (mime === "image/png" && png) ||
    (mime === "image/webp" && webp)
  ))
    throw new Error(
      "Upload a JPEG, PNG or WebP image with matching file contents",
    );
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
}
