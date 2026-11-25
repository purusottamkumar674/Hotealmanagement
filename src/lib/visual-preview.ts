import type { Hotel, Room } from "./catalog";
export const visualPreviewEnabled =
  process.env.NEXT_PUBLIC_VISUAL_PREVIEW !== "false";
const flowerPhotos: Record<string, string> = {
  exterior: "/images/img.png",
  reception: "/images/img8.png",
  "room-1": "/images/img1.png",
  "room-2": "/images/img2.png",
  "hero-1": "/images/img1.png",
  "hero-2": "/images/img2.png",
};
// Only client-supplied photographs are bundled with the site.
const collectionPhotos: Record<string, string> = {
  exterior: "/images/img15.png", reception: "/images/img12.png",
  "room-1": "/images/img9.png", "room-2": "/images/img10.png",
  "hero-1": "/images/img9.png", "hero-2": "/images/img10.png",
};
export const localPhoto = (hotel = "flower-inn", name = "exterior") =>
  (hotel === "petal-inn" ? collectionPhotos[name] : flowerPhotos[name]) || flowerPhotos.exterior;
const accommodationPhotos: Record<string, string> = {
  "one-bhk": "/images/img2.png", "two-bhk": "/images/img9.png",
  "three-bhk": "/images/img10.png", "deluxe-room": "/images/img1.png",
  "premium-room": "/images/img2.png",
};
export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  hotelId: string;
  hotelName: string;
  category: string;
  preview: boolean;
};
export const flowerListing = {
  name: "Hotel Flowers Inn",
  address:
    "Opp A.n.collage, Vivekanand Marg, Vishwamitra Path, North S.K. Puri, Boring Road",
  city: "Patna",
  state: "Bihar",
  postalCode: "800013",
  country: "India",
  phone: "+919304704520",
  source:
    "https://www.google.com/travel/hotels/entity/ChoI8-TWybCWqpHpARoNL2cvMTFzeXN0NDh6NBAB",
  mapsUrl: "https://www.google.com/maps?cid=16799175046952497779",
  note: "Public Google hotel listing; property identity confirmed by the client. Client-supplied photography; inventory awaits confirmation.",
};
export const previewHotels: Hotel[] = ["flower-inn", "petal-inn"].map(
  (id, i) => ({
    id,
    name: i ? "Petal Inn" : "Flower Inn",
    tagline: i
      ? "Plan your stay at Petal Inn."
      : "Welcome to Flower Inn, Patna.",
    subtitle: i
      ? "Explore Petal Inn rooms and hotel details."
      : "Hotel rooms for your visit to Patna.",
    description: i
      ? "Explore Petal Inn room options and plan your visit. Contact the hotel to confirm room details and availability."
      : "Welcome to Flower Inn in Patna. Browse hotel photographs, explore room options and contact the team to plan your stay.",
    image: localPhoto(id, "exterior"),
    gallery: ["exterior", "reception", "room-1", "room-2"].map((n) =>
      localPhoto(id, n),
    ),
    highlight: i ? "The Petal collection" : "The Flower collection",
    accent: i ? "THE PETAL COLLECTION" : "THE FLOWER COLLECTION",
    location: i ? "Location being updated" : "Patna, Bihar",
    address: i ? "Verified address being updated" : flowerListing.address,
    amenities: [],
    checkIn: "Confirm with the property",
    checkOut: "Confirm with the property",
    preview: true,
    samplesEnabled: true,
  }),
);
const categories = [
  [
    "one-bhk",
    "1 BHK room",
    "Explore this room option and contact the hotel to confirm the layout.",
  ],
  [
    "two-bhk",
    "2 BHK room",
    "Planning a stay together? Confirm room arrangements with the hotel.",
  ],
  [
    "three-bhk",
    "3 BHK room",
    "Contact the hotel to discuss room arrangements for your group.",
  ],
  [
    "deluxe-room",
    "Deluxe room",
    "View our Deluxe room photos and check availability for your stay.",
  ],
  [
    "premium-room",
    "Premium room",
    "Explore our Premium room option and confirm details with the hotel.",
  ],
];
export const previewRooms: Room[] = previewHotels.flatMap((h) =>
  categories.map(([slug, name, description]) => ({
    id: `preview-${h.id}-${slug}`,
    hotelId: h.id,
    hotelName: h.name,
    slug,
    name,
    subtitle: "Hotel room details",
    description,
    image: accommodationPhotos[slug],
    gallery: [
      accommodationPhotos[slug],
      localPhoto(h.id, "room-1"),
      localPhoto(h.id, "room-2"),
    ],
    baseRate: 0,
    inventory: 0,
    guests: 0,
    size: "Layout to be confirmed",
    bed: "Bed configuration to be confirmed",
    amenities: [],
    preview: true,
    samplesEnabled: true,
  })),
);
export const previewPhotos: GalleryPhoto[] = previewHotels.flatMap((h) =>
  [
    ["exterior", "exterior"],
    ["reception", "reception"],
    ["room-1", "rooms"],
    ["room-2", "bedroom"],
  ].map(([name, category]) => ({
    id: `sample-${h.id}-${name}`,
    src: localPhoto(h.id, name),
    alt: `Client-supplied ${category} photograph`,
    hotelId: h.id,
    hotelName: h.name,
    category,
    preview: true,
  })),
);
export const previewSlides = [
  [
    "flower-inn",
    "hero-1",
    "Welcome to Flower Inn.",
    "Explore our hotel rooms and plan your stay.",
  ],
  [
    "petal-inn",
    "hero-1",
    "A warm welcome awaits.",
    "Browse our hotel spaces and contact the team for your stay.",
  ],
  [
    "flower-inn",
    "hero-2",
    "Explore our hotel room.",
    "Explore room options and check availability for your dates.",
  ],
  [
    "petal-inn",
    "hero-2",
    "Plan your stay at Petal Inn.",
    "View hotel rooms and find the details you need before booking.",
  ],
].map(([hotel, name, heading, subtitle], i) => ({
  id: `preview-slide-${i}`,
  hotel,
  image: i === 1 ? "/images/img8.png" : localPhoto(hotel, name),
  heading,
  subtitle,
  cta_text: "Book your stay",
  cta_link: `/search?hotel=${hotel}`,
  alt: "Client-supplied guest room photograph",
  preview: true,
}));
export const planningFaqs = [
  [
    "Are these photographs of the properties?",
    "The website uses the real photographs supplied by the client. Room categories and availability are confirmed separately by management.",
  ],
  [
    "Are the room categories available to book?",
    "Categories marked “Preview” show design concepts. Only management-published accommodation can appear in live availability and booking.",
  ],
  [
    "How do I see the current price?",
    "Choose a property and stay dates. Rates and availability come from the booking database when the property is configured.",
  ],
  [
    "Where can I find the hotel policies?",
    "Approved booking, cancellation and privacy policies are linked from the footer and checkout. We do not publish unapproved refund promises.",
  ],
];

// Client-supplied Flower Inn photography; keep Petal Inn imagery separate.
export const uploadedPhotos: GalleryPhoto[] = [
  ["img", "Flower Inn exterior and entrance", "exterior"],
  ["img8", "Flower Inn reception desk", "reception"],
  ["img1", "Double guest room with seating", "rooms"],
  ["img2", "Guest room and seating area", "rooms"],
  ["img3", "Guest bathroom with shower and washbasin", "bathroom"],
  ["img4", "Hotel corridor and lift", "facilities"],
  ["img5", "Covered hotel parking area", "facilities"],
  ["img6", "Flower and foliage close-up", "details"],
  ["img7", "Hibiscus flower close-up", "details"],
  ["img9", "Guest room with blue bedding and seating", "rooms"],
  ["img10", "Guest bedroom with armchairs and a glass table", "rooms"],
  ["img11", "Lift landing and guest room entrance", "facilities"],
  ["img12", "Reception counter and waiting area", "reception"],
  ["img13", "Lift and guest corridor", "facilities"],
  ["img14", "Breakfast tray with tea and accompaniments", "dining"],
  ["img15", "Glass entrance to the hotel lobby", "entrance"],
].map(([name, alt, category]) => ({
  id: "uploaded-" + name,
  src: "/images/" + name + ".png",
  alt,
  category,
  hotelId: "flower-inn",
  hotelName: "Flower Inn",
  preview: false,
}));
previewPhotos.splice(
  0,
  previewPhotos.length,
  ...uploadedPhotos,
);
const flower = previewHotels.find((h) => h.id === "flower-inn");
if (flower) flower.gallery = uploadedPhotos.map((p) => p.src);
for (const room of previewRooms.filter((r) => r.hotelId === "flower-inn")) {
  if (room.slug === "deluxe-room" || room.slug === "premium-room") {
    room.image = localPhoto(
      "flower-inn",
      room.slug === "deluxe-room" ? "room-1" : "room-2",
    );
    room.gallery = [
      room.image,
      localPhoto("flower-inn", "room-1"),
      localPhoto("flower-inn", "room-2"),
      "/images/img3.png",
    ].filter((src, i, a) => a.indexOf(src) === i);
  }
}
for (const slide of previewSlides) {
  slide.preview = false;
  slide.alt = "Flower Inn guest room";
}
