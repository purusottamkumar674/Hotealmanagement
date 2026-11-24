import { PHOTOS } from "./catalog";
export const INFO_META: Record<
  string,
  { eyebrow: string; title: string; description: string; hero: string }
> = {
  about: {
    eyebrow: "A COLLECTION OF TWO",
    title: "Our story",
    description: "Thoughtful hospitality begins with the feeling of belonging.",
    hero: PHOTOS.flowerLobby,
  },
  gallery: {
    eyebrow: "THROUGH OUR LENS",
    title: "The gallery",
    description: "A visual mood board for our two hotel experiences.",
    hero: PHOTOS.room4,
  },
  amenities: {
    eyebrow: "THE LITTLE DETAILS",
    title: "Amenities & experiences",
    description: "Discover the comforts planned across our collection.",
    hero: PHOTOS.spa,
  },
  offers: {
    eyebrow: "MORE TO DISCOVER",
    title: "Special offers",
    description: "A place for seasonal experiences and hotel promotions.",
    hero: PHOTOS.petalLobby,
  },
  contact: {
    eyebrow: "WE ARE HERE TO HELP",
    title: "Get in touch",
    description: "Questions about your next stay? Get in touch with our team.",
    hero: PHOTOS.flowerPool,
  },
  faq: {
    eyebrow: "GOOD TO KNOW",
    title: "Frequently asked questions",
    description:
      "Helpful answers about the booking experience and platform preview.",
    hero: PHOTOS.flowerLobby,
  },
  policies: {
    eyebrow: "IMPORTANT INFORMATION",
    title: "Stay policies",
    description: "Hotel policies, terms and important stay information.",
    hero: PHOTOS.room2,
  },
  "privacy-policy": {
    eyebrow: "YOUR PRIVACY MATTERS",
    title: "Privacy policy",
    description:
      "Our public privacy statement will be published after legal review.",
    hero: PHOTOS.room3,
  },
  "terms-and-conditions": {
    eyebrow: "IMPORTANT INFORMATION",
    title: "Terms & conditions",
    description: "Provisional website terms and booking requirements.",
    hero: PHOTOS.room5,
  },
  "cancellation-policy": {
    eyebrow: "HELPFUL INFORMATION",
    title: "Cancellation policy",
    description: "Cancellation rules must be approved by the hotel operator.",
    hero: PHOTOS.flower,
  },
};

INFO_META["booking-policy"] = {
  eyebrow: "PLAN YOUR STAY",
  title: "Booking policy",
  description:
    "Management-approved reservation and payment requirements for each property.",
  hero: PHOTOS.room2,
};
