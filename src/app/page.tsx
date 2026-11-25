import { FlowerAccent } from "@/components/FlowerAccent";
import { FloralCollection } from "@/components/FloralCollection";
import {
  HotelCard,
  RoomCard,
  SectionTitle,
  ImageCover,
} from "@/components/Cards";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SearchForm } from "@/components/SearchForm";
import { Gallery } from "@/components/Gallery";
import {
  PreviewNotice,
  FacilitiesSection,
  NeighbourhoodSection,
  LocationsSection,
  FaqSection,
  GuestStories,
} from "@/components/ExploreSections";
import { visualCatalog } from "@/lib/server/visual-catalog";
import { BedDouble, CalendarCheck, Flower2, Leaf } from "lucide-react";
import Link from "next/link";
export default async function HomePage() {
  const data = await visualCatalog();
  return (
    <main>
      <HeroCarousel slides={data.slides} />
      <div className="container hero-search-overlap">
        <div className="search-overlap-head">
          <div>
            <span className="eyebrow">PLAN YOUR HOTEL STAY</span>
            <strong>Explore our kind of stay</strong>
          </div>
          <span>Two hotels. One simple search.</span>
        </div>
        <SearchForm />
      </div>
      <div className="container">
        <PreviewNotice
          visible={data.visualPreview || data.photos.some((p) => p.preview)}
        />
      </div>
      <section className="section section-story container flower-decorated">
        <FlowerAccent side="right" />
        <div className="story-visual">
          <div className="story-primary">
            <ImageCover
              src={
                data.photos.filter((p) => p.hotelId === "flower-inn")[1]?.src ||
                ""
              }
              hotelId="flower-inn"
              alt="Flower Inn interior"
            />
          </div>
          <div className="story-secondary">
            <ImageCover src="/images/img7.png" alt="Hibiscus flower detail" />
          </div>
          <div className="story-seal">
            <Flower2 size={26} />
            <span>
              TWO PROPERTIES
              <br />
              ONE COLLECTION
            </span>
          </div>
        </div>
        <div className="story-copy">
          <span className="eyebrow with-line">FLOWER INN & PETAL INN</span>
          <h2 className="serif">
            Welcome to our hotels.
            <br />
            <em>Explore our next stay.</em>
          </h2>
          <p>
            Flower Inn and Petal Inn bring two property experiences into one
            place to explore. Find inspiration, compare published accommodation
            and make space for your next journey.
          </p>
          <p>
            Whether you are planning a short visit or a longer hotel
            stay, choose a room that suits your plans. Availability,
            facilities and rates are confirmed by each property.
          </p>
          <Link className="text-link" href="/about">
            About our hotels
          </Link>
          <div className="story-metrics">
            <div>
              <strong>02</strong>
              <span>Hotels</span>
            </div>
            <div>
              <strong>01</strong>
              <span>Place to plan your stay</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-hotels">
        <div className="container">
          <SectionTitle
            eyebrow="CHOOSE YOUR HOTEL"
            title={
              <>
                Two hotels.
                <br />
                <em>Find the right room.</em>
              </>
            }
            description="Explore Flower Inn and Petal Inn individually. Each property keeps its own accommodation, contacts and facilities."
            action="Explore the hotels"
            href="/hotels"
          />
          <div className="hotels-grid">
            {data.hotels.map((h, i) => (
              <HotelCard hotel={h} index={i} key={h.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="section container flower-decorated" id="accommodations">
        <FlowerAccent side="left" />
        <SectionTitle
          eyebrow="OUR HOTEL ROOMS"
          title={
            <>
              A room for every stay.
              <br />
              <em>Choose your comfort.</em>
            </>
          }
          description="Browse the accommodation collection. Categories labeled Preview are illustrative and cannot be reserved until management confirms the inventory."
          action="View all rooms"
          href="/rooms"
        />
        <div className="rooms-grid">
          {data.rooms.slice(0, 5).map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      </section>
      <section className="why-collection">
        <div className="container">
          <div>
            <span className="eyebrow on-dark">PLAN YOUR STAY</span>
            <h2 className="serif">
              Your room.
              <br />
              <em>Your hotel stay.</em>
            </h2>
          </div>
          <div className="why-grid">
            {[
              [
                BedDouble,
                "Space for your plans",
                "Compare room categories in one place.",
              ],
              [
                CalendarCheck,
                "Clarity before you book",
                "Review current dates, published rates and approved policies.",
              ],
              [
                Leaf,
                "Two hotels to explore",
                "View rooms and contact details for Flower Inn and Petal Inn.",
              ],
            ].map(([Icon, title, description]) => {
              const I = Icon as typeof BedDouble;
              return (
                <article key={String(title)}>
                  <I size={25} />
                  <h3>{String(title)}</h3>
                  <p>{String(description)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <FacilitiesSection data={data} />
      <section className="section gallery-home-section">
        <div className="container">
          <SectionTitle
            eyebrow="HOTEL PHOTO GALLERY"
            title={
              <>
                Explore our <em>hotel spaces.</em>
              </>
            }
            description="Take a closer look at the collection. Open any photograph to explore the gallery."
            action="View the full gallery"
            href="/gallery"
          />
          <Gallery photos={data.photos.slice(0, 6)} compact />
        </div>
      </section>
      <NeighbourhoodSection data={data} />
      <LocationsSection data={data} />
      <section className="offers-banner">
        <div className="offers-photo">
          <ImageCover
            src="/images/img2.png"
            alt="Flower Inn guest room and seating area"
          />
        </div>
        <div className="offers-overlay" />
        <div className="container offers-banner-inner">
          <div>
            <span className="eyebrow">PLAN YOUR NEXT VISIT</span>
            <h2 className="serif">
              Make room for
              <br />
              <em>your next hotel stay.</em>
            </h2>
            <p>
              Approved property offers will appear when available. Explore your
              dates for the current published rates.
            </p>
          </div>
          <Link className="button button-cream" href="/offers">
            Explore stay options
          </Link>
        </div>
      </section>
      <FloralCollection />
      <GuestStories />
      <FaqSection data={data} />
      <section className="contact-collection flower-decorated">
        <FlowerAccent side="right" />
        <div className="container">
          <span className="eyebrow">PLAN YOUR HOTEL STAY</span>
          <h2 className="serif">
            A good stay begins
            <br />
            with a <em>conversation.</em>
          </h2>
          <p>
            Find property contacts, explore the collection and make your plans
            with confidence.
          </p>
          <div className="property-actions">
            <Link className="button button-dark" href="/contact">
              Contact the properties
            </Link>
            <Link className="button button-outline" href="/search">
              Explore availability
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
