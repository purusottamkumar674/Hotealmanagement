import type { Catalog, HotelRow, Row } from "@/lib/server/catalog";
import {
  Accessibility,
  BedDouble,
  Car,
  Coffee,
  ConciergeBell,
  Droplets,
  MapPin,
  ShieldCheck,
  Tv,
  Utensils,
  WashingMachine,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { HotelCard, ImageCover, SectionTitle } from "./Cards";
const icons: Record<string, typeof Wifi> = {
  Wifi,
  Car,
  Wind,
  BedDouble,
  Coffee,
  ShieldCheck,
  Utensils,
  Droplets,
  ConciergeBell,
  Tv,
  Accessibility,
  WashingMachine,
  Zap,
};
export function PropertyMap({ hotel: h }: { hotel: HotelRow }) {
  const coords = h.latitude != null && h.longitude != null;
  const address = [h.address, h.city, h.state, h.postal_code, h.country]
    .filter(Boolean)
    .join(", ");
  const query = coords
    ? `${Number(h.latitude)},${Number(h.longitude)}`
    : h.google_place_id
      ? `place_id:${h.google_place_id}`
      : "";
  const map = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
    : h.google_place_id && process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY)}&q=${encodeURIComponent(query)}`
      : "";
  const open =
    h.google_maps_url ||
    (coords
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : "");
  return (
    <section className="location-section">
      <h3 className="serif">
        <MapPin size={22} /> Find {h.name}
      </h3>
      <p>
        {h.address
          ? address
          : "The verified address will be published shortly."}
      </p>
      {map ? (
        <iframe
          title={`${h.name} location`}
          src={map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="notice info">
          A verified map location is not available yet.
        </div>
      )}
      <div className="property-actions">
        {open && (
          <a
            className="button button-outline"
            target="_blank"
            rel="noopener noreferrer"
            href={open}
          >
            Open in Google Maps
          </a>
        )}
        {query && (
          <a
            className="button button-dark"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords ? query : address)}${h.google_place_id ? `&destination_place_id=${encodeURIComponent(h.google_place_id)}` : ""}`}
          >
            Get directions
          </a>
        )}
      </div>
      {h.contact_phone && (
        <p>
          Phone:{" "}
          <a href={`tel:${h.contact_phone.replace(/[^+0-9]/g, "")}`}>
            {h.contact_phone}
          </a>
        </p>
      )}
      {h.contact_email && (
        <p>
          Email: <a href={`mailto:${h.contact_email}`}>{h.contact_email}</a>
        </p>
      )}
    </section>
  );
}
export function Amenities({ items }: { items: Row[] }) {
  return items.length ? (
    <div className="amenities-wrap">
      {items.map((a) => {
        const Icon = icons[String(a.icon)] || BedDouble;
        return (
          <article className="amenity-tile" key={a.id}>
            <Icon size={22} />
            <strong>{String(a.name)}</strong>
            {Boolean(a.description) && <p>{String(a.description)}</p>}
          </article>
        );
      })}
    </div>
  ) : (
    <p className="notice info">Confirmed amenities will be published here.</p>
  );
}
export function NearbyPlaces({ items }: { items: Row[] }) {
  return (
    <section className="nearby-section">
      <SectionTitle
        eyebrow="EXPLORE THE AREA"
        title={
          <>
            Around the <em>neighbourhood.</em>
          </>
        }
      />
      {items.length ? (
        <div className="info-grid">
          {items.map((p) => (
            <article className="info-tile" key={p.id}>
              <span className="eyebrow">{String(p.category)}</span>
              <h3>{String(p.name)}</h3>
              {Boolean(p.description) && <p>{String(p.description)}</p>}
              <p>
                {p.distance_km != null ? `${p.distance_km} km` : ""}
                {p.travel_time_minutes != null
                  ? ` · ${p.travel_time_minutes} min`
                  : ""}
                {p.distance_km != null || p.travel_time_minutes != null
                  ? ` · ${p.travel_mode}`
                  : ""}
              </p>
              {Boolean(p.google_maps_url) && (
                <a
                  href={String(p.google_maps_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Directions
                </a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="notice info">
          Verified nearby places and travel information will be added shortly.
        </p>
      )}
    </section>
  );
}
export function ApprovedText({ rows }: { rows: Row[] }) {
  return (
    <>
      {rows
        .filter((r) => r.approved && r.active)
        .map((row) => (
          <article className="info-article" key={row.id}>
            <h2>{String(row.title)}</h2>
            {String(row.body)
              .split(/\n\s*\n/)
              .map((p, i) => (
                <p className="plain-content" key={i}>
                  {p}
                </p>
              ))}
          </article>
        ))}
    </>
  );
}
export function PublicInfo({ slug, data }: { slug: string; data: Catalog }) {
  if (slug === "about")
    return (
      <>
        <div className="intro-wide">
          <div>
            <span className="eyebrow with-line">FLOWER INN & PETAL INN</span>
            <h2 className="serif">
              A place for <em>your next stay.</em>
            </h2>
          </div>
          <p>
            Flower Inn and Petal Inn come together in one collection. Explore
            each property, its confirmed accommodation and the details that
            matter to your visit.
          </p>
        </div>
        <ApprovedText rows={data.content.filter((c) => c.slug === "about")} />
        <div className="hotels-grid">
          {data.hotels.map((h, i) => (
            <HotelCard hotel={h} index={i} key={h.id} />
          ))}
        </div>
        <section className="section">
          <SectionTitle
            eyebrow="YOUR STAY, CONSIDERED"
            title={
              <>
                Welcome to the <em>collection.</em>
              </>
            }
            description="Compare published accommodation, review confirmed facilities and policies, and choose the property that suits your plans."
          />
          {data.hotelRows.map((h) => (
            <section key={h.id}>
              <h3 className="serif">{h.name}</h3>
              <Amenities
                items={data.amenities.filter(
                  (a) => a.hotel_id === h.id && !a.room_type_id,
                )}
              />
              <PropertyMap hotel={h} />
            </section>
          ))}
          <div className="gallery-page-grid">
            {data.media
              .filter((m) => m.category !== "logo")
              .slice(0, 6)
              .map((m) => (
                <div key={m.id}>
                  <ImageCover src={m.url} alt={m.alt_text} />
                </div>
              ))}
          </div>
          <Link className="button button-dark" href="/search">
            Find your accommodation
          </Link>
          <Link className="button button-outline" href="/contact">
            Contact the properties
          </Link>
        </section>
      </>
    );
  if (slug === "faq")
    return (
      <div className="faq-list">
        {data.hotelRows.map((h) => (
          <section key={h.id}>
            <h2 className="serif">{h.name}</h2>
            {data.faqs
              .filter((f) => f.hotel_id === h.id)
              .map((f) => (
                <details className="faq-item" key={f.id}>
                  <summary>{String(f.question)}</summary>
                  <p className="plain-content">{String(f.answer)}</p>
                  <small>{String(f.category)}</small>
                </details>
              ))}
            {!data.faqs.some((f) => f.hotel_id === h.id) && (
              <p>Answers approved by this property will appear here.</p>
            )}
          </section>
        ))}
        {!data.hotelRows.length && (
          <p>Property FAQs are awaiting confirmation.</p>
        )}
      </div>
    );
  if (slug === "contact")
    return (
      <section className="section">
        {data.hotelRows.map((h) => (
          <div key={h.id}>
            <PropertyMap hotel={h} />
            <NearbyPlaces
              items={data.nearby.filter((p) => p.hotel_id === h.id)}
            />
          </div>
        ))}
        {!data.hotelRows.length && (
          <div className="empty-state">
            <h3>Contact details coming soon</h3>
            <p>
              Verified property addresses and reservation contacts will appear
              here.
            </p>
          </div>
        )}
      </section>
    );
  if (slug === "amenities")
    return (
      <section className="section">
        {data.hotelRows.map((h) => (
          <div key={h.id}>
            <h2 className="serif">{h.name}</h2>
            <Amenities
              items={data.amenities.filter(
                (a) => a.hotel_id === h.id && !a.room_type_id,
              )}
            />
          </div>
        ))}
        {!data.amenities.length && (
          <p className="notice info">
            Facilities will be shown once confirmed by the properties.
          </p>
        )}
      </section>
    );
  if (slug === "gallery")
    return (
      <section className="section">
        {data.hotelRows.map((h) => (
          <div key={h.id}>
            <h2 className="serif">{h.name}</h2>
            <div className="gallery-page-grid">
              {data.media
                .filter((m) => m.hotel_id === h.id && m.category !== "logo")
                .map((m) => (
                  <div key={m.id}>
                    <ImageCover src={m.url} alt={m.alt_text} />
                  </div>
                ))}
            </div>
          </div>
        ))}
        {!data.media.length && (
          <p className="notice info">
            Official property photography will appear here once supplied.
          </p>
        )}
      </section>
    );
  if (slug === "offers")
    return (
      <div className="empty-state">
        <h3>Something to look forward to</h3>
        <p>Approved property offers will be published here.</p>
        <Link className="button button-dark" href="/search">
          Explore current rates
        </Link>
      </div>
    );
  return (
    <section className="section">
      {data.hotelRows.length ? (
        data.hotelRows.map((h) => {
          const rows = data.content.filter(
            (c) =>
              c.hotel_id === h.id &&
              (slug === "policies" ? c.slug !== "about" : c.slug === slug),
          );
          return (
            <section key={h.id}>
              <h2 className="serif">{h.name}</h2>
              {rows.length ? (
                <ApprovedText rows={rows} />
              ) : (
                <p className="notice info">
                  This property&apos;s approved policy is not available yet.
                  Booking remains unavailable until all required policies are
                  published.
                </p>
              )}
            </section>
          );
        })
      ) : (
        <p className="notice info">
          Management-approved policy content will be published here.
        </p>
      )}
    </section>
  );
}
