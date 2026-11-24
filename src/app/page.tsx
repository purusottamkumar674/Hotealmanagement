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
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <strong>Find your kind of stay</strong>
          </div>
          <span>Two properties. One simple search.</span>
        </div>
        <SearchForm />
      </div>
      <div className="container">
        <PreviewNotice
          visible={data.visualPreview || data.photos.some((p) => p.preview)}
        />
      </div>
      <section className="section section-story container">
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
          <span className="eyebrow with-line">THE INN COLLECTION</span>
          <h2 className="serif">
            Good places.
            <br />
            <em>Beautiful possibilities.</em>
          </h2>
          <p>
            Flower Inn and Petal Inn bring two property experiences into one
            place to explore. Find inspiration, compare published accommodation
            and make space for your next journey.
          </p>
          <p>
            From a room for a short visit to the idea of a longer apartment
            stay, start with the space that suits your plans. Availability,
            facilities and rates are confirmed by each property.
          </p>
          <Link className="text-link" href="/about">
            Meet the collection
          </Link>
          <div className="story-metrics">
            <div>
              <strong>02</strong>
              <span>Property collections</span>
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
            eyebrow="CHOOSE YOUR COLLECTION"
            title={
              <>
                Two properties.
                <br />
                <em>Your own way to stay.</em>
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
      <section className="section container" id="accommodations">
        <SectionTitle
          eyebrow="ROOM TO BE YOURSELF"
          title={
            <>
              A room. An apartment.
              <br />
              <em>A little breathing space.</em>
            </>
          }
          description="Browse the accommodation collection. Categories labeled Preview are illustrative and cannot be reserved until management confirms the inventory."
          action="All accommodation"
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
            <span className="eyebrow on-dark">A MORE CONSIDERED JOURNEY</span>
            <h2 className="serif">
              The little things.
              <br />
              <em>The whole experience.</em>
            </h2>
          </div>
          <div className="why-grid">
            {[
              [
                BedDouble,
                "Space for your plans",
                "Compare room and apartment categories in one place.",
              ],
              [
                CalendarCheck,
                "Clarity before you book",
                "Review current dates, published rates and approved policies.",
              ],
              [
                Leaf,
                "Two distinct collections",
                "Explore each property on its own terms.",
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
            eyebrow="THROUGH OUR LENS"
            title={
              <>
                Picture the <em>possibilities.</em>
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
            <span className="eyebrow">SOMETHING TO LOOK FORWARD TO</span>
            <h2 className="serif">
              Make room for
              <br />
              <em>your next escape.</em>
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
      <section className="contact-collection">
        <div className="container">
          <span className="eyebrow">LET&apos;S PLAN YOUR NEXT CHAPTER</span>
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
