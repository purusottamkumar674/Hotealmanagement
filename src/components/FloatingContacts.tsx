import { Instagram, MapPin, Phone, MessageCircle } from "lucide-react";
import type { FooterContact } from "./SiteFooter";
import { flowerListing } from "@/lib/visual-preview";
export function FloatingContacts({ contacts = [] }: { contacts?: FooterContact[] }) {
  const hotel = contacts.find(c => c.slug === "flower-inn");
  const phone = hotel?.phone || flowerListing.phone;
  const instagram = process.env.NEXT_PUBLIC_HOTEL_INSTAGRAM_URL;
  const links = [
    { label: "WhatsApp", icon: MessageCircle, color: "whatsapp", href: process.env.NEXT_PUBLIC_HOTEL_WHATSAPP_URL || "https://wa.me/" + phone.replace(/\D/g, "") },
    { label: "Call hotel", icon: Phone, color: "call", href: "tel:" + phone },
    { label: "Location", icon: MapPin, color: "location", href: hotel?.maps || flowerListing.mapsUrl },
    { label: "Instagram", icon: Instagram, color: "instagram", href: instagram },
  ];
  return <>{[0, 1].map(side => <nav key={side} className={"floating-contacts floating-contacts-" + (side ? "right" : "left")} aria-label={side ? "Hotel location and Instagram" : "Call or message the hotel"}>
    {links.slice(side * 2, side * 2 + 2).map(({label, icon: Icon, color, href}) => href ? <a key={label} className={"floating-contact contact-" + color} href={href} aria-label={label} target={href.startsWith("https:") ? "_blank" : undefined} rel={href.startsWith("https:") ? "noopener noreferrer" : undefined}><Icon aria-hidden="true"/><span>{label}</span></a> : <button key={label} type="button" className={"floating-contact contact-" + color} disabled aria-label="Instagram link coming soon" title="Instagram link coming soon"><Icon aria-hidden="true"/><span>Coming soon</span></button>)}
  </nav>)}</>;
}
