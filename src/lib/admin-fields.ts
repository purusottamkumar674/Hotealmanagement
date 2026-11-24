import type { Resource } from "./platform";
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "money"
    | "checkbox"
    | "date"
    | "time"
    | "select"
    | "room"
    | "media";
  options?: string[];
  nullable?: boolean;
  initial?: unknown;
  step?: string;
};
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  extra: Partial<Field> = {},
): Field => ({ key, label, type, ...extra });
const active = [
  f("sort_order", "Display order", "number", { initial: 0 }),
  f("active", "Published / active", "checkbox", { initial: false }),
];
export const adminFields: Record<Resource, Field[]> = {
  "seo-observations": [
    f("keyword", "Observed keyword"),
    f("observed_on", "Date observed", "date"),
    f("search_location", "Search location"),
    f("metric_type", "Search type", "select", { options: ["maps", "organic"] }),
    f(
      "observed_position",
      "Verified position (blank when not observed)",
      "number",
      { nullable: true },
    ),
    f("source_note", "Source and verification notes", "textarea"),
    f("evidence_url", "HTTPS evidence link", "text", { nullable: true }),
  ],
  hotels: [
    f("name", "Property name"),
    f("sample_images_enabled","Allow clearly labeled local sample photography","checkbox",{initial:true}),
    f("slug", "Website address", "select", {
      options: ["flower-inn", "petal-inn"],
    }),
    f("description", "Property introduction", "textarea", { nullable: true }),
    f("status", "Publication status", "select", {
      options: ["draft", "published", "archived"],
    }),
    f("address", "Verified street address", "textarea", { nullable: true }),
    f("city", "City"),
    f("state", "State"),
    f("country", "Country", "text", { initial: "India" }),
    f("postal_code", "Postal code"),
    f("latitude", "Verified latitude", "number", {
      nullable: true,
      step: "any",
    }),
    f("longitude", "Verified longitude", "number", {
      nullable: true,
      step: "any",
    }),
    f("google_maps_url", "Google Maps link", "text", { nullable: true }),
    f("google_place_id", "Google Place ID", "text", { nullable: true }),
    f("contact_phone", "Reservations phone", "text", { nullable: true }),
    f("contact_email", "Reservations email", "text", { nullable: true }),
    f("check_in_time", "Approved check-in time", "time", { nullable: true }),
    f("check_out_time", "Approved check-out time", "time", { nullable: true }),
    f("logo_id", "Official logo", "media", { nullable: true }),
    f("seo_title", "SEO title"),
    f("seo_description", "SEO description", "textarea"),
    f("review_url", "Approved Google review link", "text", { nullable: true }),
    f("local_keywords", "Local keywords", "textarea"),
    f("booking_enabled", "Enable reservations", "checkbox"),
    f("pay_at_property", "Pay at property approved", "checkbox"),
    f(
      "tax_approved",
      "Tax treatment approved (including zero if applicable)",
      "checkbox",
    ),
    f("tax_basis_points", "Approved tax rate (%)", "money", { initial: 0 }),
  ],
  accommodations: [
    f("name", "Accommodation name"),
    f("slug", "Accommodation website address"),
    f("description", "Description", "textarea", { nullable: true }),
    f("accommodation_category", "Accommodation category", "select", {
      options: ["room", "apartment"],
    }),
    f("bhk_count", "Confirmed BHK category", "select", {
      options: ["1", "2", "3"],
      nullable: true,
    }),
    f("bedrooms", "Bedrooms", "number", { initial: 1 }),
    f("bathrooms", "Bathrooms", "number", { initial: 1 }),
    f("beds", "Beds", "number", { initial: 1 }),
    f("living_room", "Living room available", "checkbox"),
    f("kitchen_available", "Kitchen available", "checkbox"),
    f("max_guests", "Maximum guests per unit", "number", { initial: 2 }),
    f("inventory", "Total inventory", "number", { initial: 0 }),
    f("base_rate_minor", "Approved base rate (INR)", "money", {
      initial: 0,
    }),
    f(
      "pricing_change_reason",
      "Reason for accommodation / base rate changes",
      "textarea",
    ),
    f("currency", "Currency", "select", { options: ["INR"] }),
    f("published", "Publish accommodation", "checkbox"),
  ],
  nearby: [
    f("name", "Place name"),
    f("category", "Category", "select", {
      options: [
        "railway",
        "airport",
        "hospital",
        "shopping",
        "restaurant",
        "attraction",
        "bus",
        "business",
        "landmark",
      ],
    }),
    f("description", "Description", "textarea", { nullable: true }),
    f("distance_km", "Verified distance (km)", "number", {
      nullable: true,
      step: "any",
    }),
    f("travel_time_minutes", "Verified travel time (minutes)", "number", {
      nullable: true,
    }),
    f("travel_mode", "Travel mode", "select", {
      options: ["driving", "walking", "transit", "bicycling"],
    }),
    f("google_maps_url", "Google Maps directions link", "text", {
      nullable: true,
    }),
    f("source_note", "Verification source or hotel approval", "textarea"),
    ...active,
  ],
  amenities: [
    f("name", "Amenity name"),
    f("room_type_id", "Accommodation (leave blank for property-wide)", "room", {
      nullable: true,
    }),
    f("icon", "Icon", "select", {
      options: [
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
      ],
    }),
    f("description", "Description", "textarea", { nullable: true }),
    f("category", "Category"),
    ...active,
  ],
  faqs: [
    f("question", "Question"),
    f("answer", "Answer", "textarea"),
    f("category", "Category"),
    ...active,
  ],
  content: [
    f("slug", "Page", "select", {
      options: [
        "about",
        "terms-and-conditions",
        "privacy-policy",
        "cancellation-policy",
        "booking-policy",
      ],
    }),
    f("title", "Heading"),
    f("body", "Management-approved content", "textarea"),
    f("approved", "Approved by management", "checkbox"),
    f("active", "Publish content", "checkbox"),
  ],
  "hero-slides": [
    f("image_id", "Desktop image", "media",{nullable:true}),
    f("mobile_image_id", "Mobile image (optional)", "media", {
      nullable: true,
    }),
    f("heading", "Headline"),
    f("subtitle", "Subtitle", "textarea"),
    f("cta_text", "Button label"),
    f("cta_link", "Button destination", "text", { initial: "/search" }),
    ...active,
  ],
  gallery: [
    f("alt_text", "Image description (alt text)"),
    f("category", "Image category", "select", {
      options: [
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
      ],
    }),
    f("room_type_id", "Accommodation (optional)", "room", { nullable: true }),
    f("featured", "Featured image", "checkbox"),
    ...active,
  ],
  "pricing-rules": [
    f("room_type_id", "Accommodation", "room"),
    f("name", "Rule name"),
    f("kind", "Rule type", "select", {
      options: ["season", "event", "weekend"],
    }),
    f("start_date", "First date (inclusive)", "date"),
    f("end_date", "Last date (inclusive)", "date"),
    f("weekdays", "Days of week: Sunday = 0 through Saturday = 6", "text", {
      initial: "0,1,2,3,4,5,6",
    }),
    f("rate_minor", "Approved nightly rate (INR)", "money", { initial: 0 }),
    f("priority", "Priority within rule type", "number", { initial: 0 }),
    f("reason", "Reason for this rule", "textarea"),
    f("approved", "Approved pricing rule", "checkbox"),
    f("active", "Enable rule", "checkbox"),
  ],
  seo: [
    f("title", "Local SEO task", "textarea"),
    f("status", "Progress", "select", {
      options: ["todo", "in_progress", "done"],
    }),
  ],
  reviews: [
    f("source", "Review platform"),
    f("external_review_id", "Verified source identifier", "text", {
      nullable: true,
    }),
    f("review_content", "Authentic review content", "textarea"),
    f("star_rating", "Rating supplied by reviewer", "number", {
      nullable: true,
    }),
    f("reply_draft", "Reply draft", "textarea"),
    f("workflow_status", "Workflow status", "select", {
      options: ["new", "draft", "approved", "published", "archived"],
    }),
    f("source_verified", "Source verified", "checkbox"),
  ],
};
