"use client";
import { ContactLocation } from "./ContactLocation";
import { HotelCard, ImageCover, SectionTitle } from "@/components/Cards";
import { HOTELS, PHOTOS } from "@/lib/catalog";
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Flower2,
  Heart,
  Info,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Utensils,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
const FAQs = [
  [
    "Can I book either hotel from the same website?",
    "Yes. The planned website includes both Flower Inn and Petal Inn in one availability search and booking journey. This demonstration uses sample data, not live inventory.",
  ],
  [
    "Can room prices change by date?",
    "Yes. Daily rate overrides are included in the demo pricing dashboard. Live price changes will need a secure database-backed booking engine.",
  ],
  [
    "Can I book without an account?",
    "The proposed experience supports guest checkout. The current preview stores test bookings only in your browser.",
  ],
  [
    "Can I pay online?",
    "Online payment is part of the proposed full platform but is not connected in this frontend demonstration. Gateway selection and merchant credentials require confirmation.",
  ],
  [
    "What time is check-in and check-out?",
    "Official check-in and check-out times must be confirmed by the hotel owners before going live. Any sample display times are placeholders.",
  ],
  [
    "How do cancellations and refunds work?",
    "The final cancellation, modification and refund policies need client approval. This demonstration does not process real reservations or refunds.",
  ],
  [
    "What happens if one property is fully booked?",
    "The search experience can suggest the sister hotel when a requested property has no matching rooms.",
  ],
  [
    "Where are Flower Inn and Petal Inn located?",
    "Verified addresses and map coordinates have not been provided yet. Please replace location placeholders before publishing.",
  ],
];
const services = [
  {
    name: "Thoughtful comfort",
    desc: "Comfort-oriented spaces shaped around rest and ease.",
    icon: BedDouble,
  },
  {
    name: "Simple reservations",
    desc: "Search both properties and choose the stay that suits you.",
    icon: CalendarCheck,
  },
  {
    name: "Guest assistance",
    desc: "A welcoming approach designed around guest needs.",
    icon: Heart,
  },
  {
    name: "Connected stays",
    desc: "Browse two hotels through one seamless digital experience.",
    icon: Sparkles,
  },
  {
    name: "Dining inspiration",
    desc: "Restaurant and breakfast visuals are illustrative until confirmed.",
    icon: Utensils,
  },
  {
    name: "Practical essentials",
    desc: "Property amenities such as Wi-Fi and parking require verification.",
    icon: Wifi,
  },
];
function ContactContent() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <div className="contact-grid">
        <div>
          <div className="eyebrow with-line">LET&apos;S CONNECT</div>
          <h2 className="serif">
            We&apos;d love to <em>hear from you.</em>
          </h2>
          <p>
            Reach out for booking questions, property enquiries or general
            assistance. Find Hotel Flowers Inn on the map below and get
            directions for your visit.
          </p>
          <div className="contact-item">
            <Mail size={19} />
            <div>
              <strong>Email enquiries</strong>
              <span>Official email to be confirmed</span>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={19} />
            <div>
              <strong>Call the hotel</strong>
              <span>Official phone number to be confirmed</span>
            </div>
          </div>
          <div className="contact-item">
            <MapPin size={19} />
            <div>
              <strong>Our properties</strong>
              <span>
                Flower Inn · Petal Inn
                <br />
                Hotel Flowers Inn: North S.K. Puri, Boring Road, Patna
              </span>
            </div>
          </div>
        </div>
        <div className="form-card">
          <h2>Send a message</h2>
          <div className="notice info" style={{ marginBottom: 20 }}>
            <Info size={16} /> Demo form only: no message will be sent until
            backend/email is connected.
          </div>
          {sent ? (
            <div className="empty-state">
              <CheckCircle2 size={35} />
              <h3>Demo form checked</h3>
              <p>This shows the intended success state. No message was sent.</p>
              <button
                className="button button-dark"
                onClick={() => setSent(false)}
              >
                New message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="form-grid"
            >
              <label className="form-label">
                Full name
                <input
                  className="form-control"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="form-label">
                Email
                <input
                  className="form-control"
                  type="email"
                  placeholder="Your email"
                  required
                />
              </label>
              <label className="form-label">
                What can we help with?
                <select className="form-control">
                  <option>General enquiry</option>
                  <option>Flower Inn</option>
                  <option>Petal Inn</option>
                  <option>Existing booking (demo)</option>
                </select>
              </label>
              <label className="form-label">
                Phone (optional)
                <input
                  className="form-control"
                  type="tel"
                  placeholder="Contact number"
                />
              </label>
              <label className="form-label" style={{ gridColumn: "1/-1" }}>
                Your message
                <textarea
                  className="form-control"
                  placeholder="How can we help?"
                  required
                  minLength={10}
                />
              </label>
              <button
                className="button button-dark"
                type="submit"
                style={{ gridColumn: "1/-1" }}
              >
                Preview form response <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
      <ContactLocation />
    </>
  );
}
export function InfoContent({ slug }: { slug: string }) {
  if (slug === "about")
    return (
      <>
        <div className="section-story" style={{ paddingTop: 50 }}>
          <div className="story-visual">
            <div className="story-primary">
              <ImageCover src={PHOTOS.flowerLobby} alt="Reception and lobby" />
            </div>
            <div className="story-secondary">
              <ImageCover src={PHOTOS.petalLobby} alt="Reception and lobby" />
            </div>
            <div className="story-seal">
              <Flower2 size={20} />
              <span>
                THE INN
                <br />
                COLLECTION
              </span>
            </div>
          </div>
          <div className="story-copy">
            <span className="eyebrow with-line">WHAT INSPIRES US</span>
            <h2 className="serif">
              One collection.
              <br />
              <em>Two experiences.</em>
            </h2>
            <p>
              Flower Inn and Petal Inn are presented here as two sister
              properties connected through a unified digital experience. The
              design brings each property&apos;s identity to life while making
              browsing and booking feel beautifully simple.
            </p>
            <p>
              This is concept brand copy for a frontend demonstration. The
              hotels&apos; official story and service claims require client
              approval before public release.
            </p>
            <Link className="text-link" href="/hotels">
              Discover our hotels <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div style={{ paddingBottom: 98 }}>
          <SectionTitle
            eyebrow="THE COLLECTION"
            title={
              <>
                Choose your <em>moment.</em>
              </>
            }
          />
          <div className="hotels-grid">
            {HOTELS.map((h, i) => (
              <HotelCard hotel={h} index={i} key={h.id} />
            ))}
          </div>
        </div>
      </>
    );
  if (slug === "gallery")
    return (
      <>
        <div className="intro-wide">
          <div>
            <span className="eyebrow with-line">A VISUAL JOURNEY</span>
            <h2 className="serif">
              Spaces worth <em>remembering.</em>
            </h2>
          </div>
          <p>
            Browse the real property photographs supplied for the collection.
          </p>
        </div>
        <div className="gallery-page-grid">
          {[
            PHOTOS.flower,
            PHOTOS.room1,
            PHOTOS.petal,
            PHOTOS.room3,
            PHOTOS.restaurant,
            PHOTOS.flowerPool,
            PHOTOS.spa,
            PHOTOS.room4,
          ].map((src, i) => (
            <div key={i}>
              <ImageCover
                src={src}
                alt={`Property photo ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </>
    );
  if (slug === "amenities")
    return (
      <>
        <div className="intro-wide">
          <div>
            <span className="eyebrow with-line">BEYOND THE ROOM</span>
            <h2 className="serif">
              Made for <em>your ease.</em>
            </h2>
          </div>
          <p>
            From comfortable rooms to a simpler digital journey, these are the
            experience themes for the collection. Specific hotel amenities must
            be confirmed with the operator.
          </p>
        </div>
        <div className="info-grid">
          {services.map((s) => (
            <div key={s.name} className="info-tile">
              <s.icon size={32} />
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </>
    );
  if (slug === "offers")
    return (
      <>
        <div className="intro-wide">
          <div>
            <span className="eyebrow with-line">SPECIAL MOMENTS</span>
            <h2 className="serif">
              More reasons to <em>stay.</em>
            </h2>
          </div>
          <p>
            Marketing offer layouts are ready for future hotel-approved
            promotions. No discount or promotional rate is currently advertised
            as real.
          </p>
        </div>
        <div className="hotels-grid" style={{ margin: "34px 0 95px" }}>
          {HOTELS.map((h) => (
            <article className="hotel-card" key={h.id}>
              <div className="hotel-card-photo">
                <ImageCover
                  src={h.image}
                  alt={`${h.name} illustrative image`}
                />
                <span className="photo-top-badge">COMING SOON</span>
              </div>
              <div className="hotel-card-content">
                <div>
                  <p className="eyebrow">{h.name.toUpperCase()}</p>
                  <h3 className="serif">Seasonal experiences</h3>
                  <p>Approved hotel offers will appear here.</p>
                </div>
                <Link className="view-link" href={`/hotels/${h.id}`}>
                  Explore <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  if (slug === "contact") return <ContactContent />;
  if (slug === "faq")
    return (
      <>
        <div className="intro-wide">
          <div>
            <span className="eyebrow with-line">HELPFUL ANSWERS</span>
            <h2 className="serif">
              Everything you <em>need to know.</em>
            </h2>
          </div>
          <p>
            These answers explain the proposed booking platform and its current
            prototype limitations.
          </p>
        </div>
        <div className="faq-list">
          {FAQs.map(([q, a], i) => (
            <details className="faq-item" key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </>
    );
  if (
    [
      "policies",
      "privacy-policy",
      "terms-and-conditions",
      "cancellation-policy",
    ].includes(slug)
  )
    return (
      <article className="info-article">
        <div className="notice danger">
          <Info size={18} /> Policy drafts are placeholders, not approved legal
          terms. Obtain business and legal approval before publishing a live
          booking service.
        </div>
        {slug === "policies" ? (
          <>
            <h2>Property and guest policies</h2>
            <p>
              Flower Inn and Petal Inn will need their own verified check-in and
              checkout times, ID requirements, occupancy rules, extra guest
              fees, pet policies and cancellation policies. These details have
              not been provided in the SOW.
            </p>
            <h3>Booking demonstration</h3>
            <p>
              This frontend demonstration does not confirm a real stay or accept
              a payment. Data created in the booking preview is kept only in the
              browser where it was entered.
            </p>
            <p>
              Please obtain the hotel operator&apos;s approved policy documents
              and replace this page before public launch.
            </p>
          </>
        ) : slug === "privacy-policy" ? (
          <>
            <h2>Privacy policy pending approval</h2>
            <p>
              The site currently offers browser-local demo bookings and contact
              form previews. It does not send those details to the hotel or
              process online payments. The final privacy policy must describe
              the actual production provider, data processing purposes,
              retention, lawful basis, contact details and user rights.
            </p>
            <h3>Production requirements</h3>
            <p>
              Before launch, configure secure authentication, data protection
              practices, consent controls, and any legally required privacy
              disclosures. Do not treat this placeholder as a complete legal
              policy.
            </p>
          </>
        ) : slug === "terms-and-conditions" ? (
          <>
            <h2>Website and booking terms pending approval</h2>
            <p>
              Bookings created in this demonstration are test records only and
              do not constitute a reservation with Flower Inn or Petal Inn.
              Displayed prices, room details and property information are
              illustrative.
            </p>
            <h3>Before going live</h3>
            <p>
              The hotel operator must approve terms covering rates, payment
              obligations, cancellations, refunds, guest conduct, check-in
              requirements and dispute resolution.
            </p>
          </>
        ) : (
          <>
            <h2>Cancellation policy pending approval</h2>
            <p>
              The original SOW does not specify a final refund or cancellation
              schedule. Accordingly, this frontend demonstration does not make
              contractual cancellation or refund promises.
            </p>
            <h3>When bookings go live</h3>
            <p>
              Implement and publish the client-approved cancellation windows,
              any applicable charges, refund methods and processing rules for
              each property.
            </p>
          </>
        )}
        <Link
          href="/contact"
          className="button button-dark"
          style={{ marginTop: 20 }}
        >
          Ask a question <ArrowRight size={16} />
        </Link>
      </article>
    );
  return null;
}
