import { HotelCard, ImageCover } from "@/components/Cards";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Our Hotels",
  alternates: { canonical: "/hotels" },
  description:
    "Explore Flower Inn and Petal Inn, two distinctive stays in one thoughtful collection.",
};
export default async function HotelsPage() {
  const { hotels: HOTELS } = await catalog();
  return (
    <main className="content-shell">
      <section className="page-hero">
        <ImageCover
          src={HOTELS[0]?.image || ""}
          alt={
            HOTELS[0]
              ? `${HOTELS[0].name} property photography`
              : "Flower Inn and Petal Inn"
          }
        />
        <div className="container page-hero-inner">
          <p className="eyebrow">THE COLLECTION</p>
          <h1 className="serif">Our hotels</h1>
          <p>
            Two distinct expressions of comfort, connected by a beautiful way to
            stay.
          </p>
        </div>
      </section>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight />
          Our hotels
        </div>
        <div className="intro-wide">
          <div>
            <p className="eyebrow with-line">TWO PLACES TO BELONG</p>
            <h2 className="serif">
              Find your <em>kind of stay.</em>
            </h2>
          </div>
          <p>
            Whether you&apos;re drawn to understated calm or contemporary
            elegance, explore the collection and its published property
            information below.
          </p>
        </div>
        <div className="hotels-grid" style={{ margin: "34px 0 95px" }}>
          {HOTELS.map((hotel, i) => (
            <HotelCard key={hotel.id} hotel={hotel} index={i} />
          ))}
        </div>
        {!HOTELS.length && (
          <p className="notice info">
            Verified property information will appear here once published.
          </p>
        )}
      </div>
    </main>
  );
}
