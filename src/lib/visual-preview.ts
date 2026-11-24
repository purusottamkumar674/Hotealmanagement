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
export const localPhoto = (hotel = "flower-inn", name = "exterior") =>
  hotel === "flower-inn" && flowerPhotos[name]
    ? flowerPhotos[name]
    : `/images/hotels/${hotel === "petal-inn" ? "petal-inn" : "flower-inn"}/${name}.webp`;
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
  note: "Public Google hotel listing; property identity confirmed by the client. Photography and inventory remain illustrative.",
};
export const previewHotels: Hotel[] = ["flower-inn", "petal-inn"].map(
  (id, i) => ({
    id,
    name: i ? "Petal Inn" : "Flower Inn",
    tagline: i
      ? "Make a little space for yourself."
      : "A fresh perspective on your next stay.",
    subtitle: i
      ? "A distinct expression of the collection."
      : "Your Patna stay, thoughtfully presented.",
    description: i
      ? "Explore the Petal Inn collection preview: room and apartment concepts, inviting interiors and a simpler way to plan your stay. Official property details and accommodation availability are awaiting confirmation."
      : "Explore Flower Inn, identified by the client as Hotel Flowers Inn in Patna. Discover the accommodation collection below; the photographs and unpublished room categories are illustrative while management confirms the final inventory.",
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
    "1 BHK apartment",
    "A one-bedroom apartment concept, with room for everyday moments.",
  ],
  [
    "two-bhk",
    "2 BHK apartment",
    "A two-bedroom apartment concept for travellers exploring a little more space.",
  ],
  [
    "three-bhk",
    "3 BHK apartment",
    "A three-bedroom apartment concept for planning a shared stay.",
  ],
  [
    "deluxe-room",
    "Deluxe room",
    "A conventional guest-room concept with a warm, considered atmosphere.",
  ],
  [
    "premium-room",
    "Premium room",
    "A guest-room concept with a more expansive visual character.",
  ],
];
export const previewRooms: Room[] = previewHotels.flatMap((h) =>
  categories.map(([slug, name, description]) => ({
    id: `preview-${h.id}-${slug}`,
    hotelId: h.id,
    hotelName: h.name,
    slug,
    name,
    subtitle: "Accommodation design preview",
    description,
    image: `/images/accommodations/${slug}.webp`,
    gallery: [
      `/images/accommodations/${slug}.webp`,
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
    alt: `Illustrative ${category} photography for the ${h.name} visual preview; not an actual property photograph`,
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
    "A beautiful beginning.",
    "Explore Flower Inn and Petal Inn, one considered collection.",
  ],
  [
    "petal-inn",
    "hero-1",
    "A little room to unwind.",
    "Find inspiration for your next stay in the Petal collection.",
  ],
  [
    "flower-inn",
    "hero-2",
    "Slow down. Settle in.",
    "Browse room and apartment concepts while official inventory is confirmed.",
  ],
  [
    "petal-inn",
    "hero-2",
    "Make yourself at home.",
    "A fresh look at the spaces that shape a memorable stay.",
  ],
].map(([hotel, name, heading, subtitle], i) => ({
  id: `preview-slide-${i}`,
  hotel,
  image: localPhoto(hotel, name),
  heading,
  subtitle,
  cta_text: "Book your stay",
  cta_link: `/search?hotel=${hotel}`,
  alt: "Licensed illustrative hotel photograph, not the actual property",
  preview: true,
}));
export const planningFaqs = [
  [
    "Are these photographs of the properties?",
    "Photographs marked “Illustrative photo” are licensed design-preview images. Published official uploads replace them when available.",
  ],
  [
    "Are the apartment categories available to book?",
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
const uploadedPhotos: GalleryPhoto[] = [
  ["img", "Flower Inn exterior and entrance", "exterior"],
  ["img8", "Flower Inn reception desk", "reception"],
  ["img1", "Double guest room with seating", "rooms"],
  ["img2", "Guest room and seating area", "rooms"],
  ["img3", "Guest bathroom with shower and washbasin", "bathroom"],
  ["img4", "Hotel corridor and lift", "facilities"],
  ["img5", "Covered hotel parking area", "facilities"],
  ["img6", "Flower and foliage close-up", "details"],
  ["img7", "Hibiscus flower close-up", "details"],
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
  ...previewPhotos.filter((p) => p.hotelId !== "flower-inn"),
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
for (const slide of previewSlides.filter((s) => s.hotel === "flower-inn")) {
  slide.preview = false;
  slide.alt = "Flower Inn guest room";
}
