"use client";
import {
  Instagram,
  Facebook,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Flower2,
  FileText,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { HotelImage } from "./HotelImage";

export type FooterContact = {
  slug: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  maps: string | null;
};
const quickLinks = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/hotels", "Our Hotels"],
  ["/rooms", "Rooms"],
  ["/gallery", "Gallery"],
  ["/amenities", "Amenities"],
  ["/contact", "Contact Us"],
];
const policies = [
  ["/privacy-policy", "Privacy Policy"],
  ["/terms-and-conditions", "Terms & Conditions"],
  ["/cancellation-policy", "Cancellation Policy"],
  ["/sitemap.xml", "Sitemap"],
];
const properties = [
  { slug: "flower-inn", name: "Flower Inn" },
  { slug: "petal-inn", name: "Petal Inn" },
];

export function SiteFooter({
  contacts = [],
  bannerImage = "",
}: {
  contacts?: FooterContact[];
  bannerImage?: string;
}) {
  return (
    <footer className="site-footer luxury-footer">
      <div className="container luxury-footer-wrap">
        <section
          className="footer-booking-banner"
          aria-labelledby="footer-booking-title"
        >
          {bannerImage && (
            <div className="footer-banner-photo">
              <HotelImage
                src={bannerImage}
                hotelId="flower-inn"
                alt="Flower Inn interior"
                sizes="100vw"
              />
            </div>
          )}
          <div className="footer-banner-overlay" />
          <div className="footer-banner-copy">
            <div className="footer-flower-divider" aria-hidden="true">
              <span />
              <Flower2 size={36} strokeWidth={1} />
              <span />
            </div>
            <h2 id="footer-booking-title">Your Perfect Stay Begins Here</h2>
            <p>
              Explore comfortable stays at Flower Inn and Petal Inn, and find
              the accommodation that suits your journey.
            </p>
            <div className="footer-booking-actions">
              <Link href="/rooms" className="footer-cta-outline">
                Explore Rooms <ArrowRight size={22} />
              </Link>
              <Link href="/search" className="footer-cta-gold">
                Book Your Stay <ArrowRight size={22} />
              </Link>
            </div>
          </div>
        </section>
        <div className="luxury-footer-columns">
          <section
            className="footer-brand-column"
            aria-labelledby="footer-brand-title"
          >
            <Link
              href="/"
              className="footer-brand-logo-link"
              aria-label="Flower Inn and Petal Inn home"
            >
              <BrandLogo footer />
            </Link>
            <h2 id="footer-brand-title">
              Flower Inn &amp;
              <br />
              Petal Inn
            </h2>
            <div className="footer-heading-rule" />
            <p>
              Discover welcoming accommodation and convenient stays with Flower
              Inn and Petal Inn. Explore our properties, rooms and booking
              options in one place.
            </p>
            <div
              className="footer-social-links"
              aria-label="Social media and location"
            >
              {[
                {
                  name: "Instagram",
                  Icon: Instagram,
                  url: process.env.NEXT_PUBLIC_HOTEL_INSTAGRAM_URL,
                },
                {
                  name: "Facebook",
                  Icon: Facebook,
                  url: process.env.NEXT_PUBLIC_HOTEL_FACEBOOK_URL,
                },
                {
                  name: "WhatsApp",
                  Icon: MessageCircle,
                  url: process.env.NEXT_PUBLIC_HOTEL_WHATSAPP_URL,
                },
                {
                  name: "Google Maps",
                  Icon: MapPin,
                  url:
                    contacts.find((h) => h.maps)?.maps ||
                    "https://www.google.com/maps?cid=16799175046952497779",
                },
              ].map(({ name, Icon, url }) => {
                const configured = !!url && /^https:\/\//.test(url);
                return (
                  <a
                    key={name}
                    href={configured ? url! : "/contact"}
                    target={configured ? "_blank" : undefined}
                    rel={configured ? "noopener noreferrer" : undefined}
                    title={
                      configured
                        ? name
                        : name + " ? contact us for our official profile"
                    }
                    aria-label={
                      configured
                        ? name
                        : name + " ? enquire about our official profile"
                    }
                  >
                    <Icon size={23} />
                  </a>
                );
              })}
            </div>
          </section>
          <nav aria-labelledby="footer-quick-title">
            <h2 id="footer-quick-title">Quick Links</h2>
            <div className="footer-heading-rule" />
            <ul className="footer-link-list">
              {quickLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href}>
                    {label}
                    <ChevronRight size={17} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="footer-properties-title">
            <h2 id="footer-properties-title">Our Properties</h2>
            <div className="footer-heading-rule" />
            {properties.map((h) => (
              <div className="footer-property-group" key={h.slug}>
                <h3>{h.name}</h3>
                <ul className="footer-link-list">
                  {[
                    [`/hotels/${h.slug}`, "Explore Property"],
                    [`/hotels/${h.slug}#rooms`, "View Rooms"],
                    [`/search?hotel=${h.slug}`, "Check Availability"],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href}>
                        {label}
                        <ArrowRight size={19} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Contact &amp; Support</h2>
            <div className="footer-heading-rule" />
            {contacts.map((h) => (
              <div className="footer-contact-property" key={h.slug}>
                <h3>{h.name}</h3>
                <ul className="footer-contact-list">
                  {h.address && (
                    <li>
                      <MapPin size={19} />
                      <span>{h.address}</span>
                    </li>
                  )}
                  {h.phone && (
                    <li>
                      <Phone size={19} />
                      <a href={`tel:${h.phone.replace(/[^+0-9]/g, "")}`}>
                        {h.phone}
                      </a>
                    </li>
                  )}
                  {h.email && (
                    <li>
                      <Mail size={19} />
                      <a href={`mailto:${h.email}`}>{h.email}</a>
                    </li>
                  )}
                  {h.maps && (
                    <li>
                      <Navigation size={19} />
                      <a
                        href={h.maps}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Maps Directions
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
            {!contacts.length && (
              <Link className="footer-contact-enquiry" href="/contact">
                <Mail size={19} /> Property contacts &amp; enquiries
              </Link>
            )}
            <ul className="footer-contact-list footer-support-list">
              {[
                ["/faq", "FAQ"],
                ["/booking-policy", "Booking Policy"],
                ["/cancellation-policy", "Cancellation Policy"],
              ].map(([href, label]) => (
                <li key={href}>
                  <FileText size={19} />
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <Sprout
          className="footer-botanical footer-botanical-left"
          size={150}
          strokeWidth={0.6}
          aria-hidden="true"
        />
        <Sprout
          className="footer-botanical footer-botanical-right"
          size={150}
          strokeWidth={0.6}
          aria-hidden="true"
        />
      </div>
      <div className="luxury-footer-bottom">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Flower Inn &amp; Petal Inn. All Rights
            Reserved.
          </p>
          <nav aria-label="Footer legal links">
            {policies.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
