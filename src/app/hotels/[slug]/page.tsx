import { FlowerListingInfo } from "@/components/FlowerListingInfo";
import { ImageCover, RoomCard, SectionTitle } from "@/components/Cards";
import {
  Amenities,
  NearbyPlaces,
  PropertyMap,
} from "@/components/PropertyContent";
import {Gallery} from "@/components/Gallery";
import {PreviewNotice,LocationsSection} from "@/components/ExploreSections";
import { SearchForm } from "@/components/SearchForm";
import { HOTELS } from "@/lib/catalog";
import { demoMode } from "@/lib/platform";
import { hotelSchema, jsonLd } from "@/lib/seo";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import {
  ArrowUpRight,
  BedDouble,
  ChevronRight,
  Coffee,
  Sparkles,
  Wifi,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return HOTELS.map((h) => ({ slug: h.id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await catalog();
  const h = data.hotels.find((h) => h.id === slug);
  return {
    alternates: { canonical: `/hotels/${slug}` },
    title:
      data.hotelRows.find((x) => x.id === h?.databaseId)?.seo_title ||
      h?.name ||
      "Hotel not found",
    description:
      data.hotelRows.find((x) => x.id === h?.databaseId)?.seo_description ||
      h?.description,
  };
}
export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await catalog();
  const h = data.hotels.find((x) => x.id === slug);
  if (!h) notFound();
  const sister = data.hotels.find((x) => x.id !== h.id);
  const real = data.hotelRows.find((x) => x.id === h.databaseId);
  return (
    <main>
      {real && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              hotelSchema(
                real,
                data.amenities.filter((a) => a.hotel_id === real.id),
              ),
            ),
          }}
        />
      )}
      <section className="page-hero">
        <ImageCover
          src={h.image} hotelId={h.id}
          alt={`${h.name} representative hotel image`}
        />
        <div className="container page-hero-inner">
          <p className="eyebrow">A PART OF THE INN COLLECTION</p>
          <h1 className="serif">{h.name}</h1>
          <p>{h.tagline}</p>
        </div>
      </section>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight />
          <Link href="/hotels">Our hotels</Link>
          <ChevronRight />
          {h.name}
        </div>
        {h.id === "flower-inn" && <FlowerListingInfo />}<PreviewNotice visible={!!h.preview}/><div className="intro-wide">
          <div>
            <span className="eyebrow with-line">
              WELCOME TO {h.name.toUpperCase()}
            </span>
            <h2 className="serif">{h.subtitle}</h2>
          </div>
          <p>{h.description}</p>
        </div>
        <div className="hotel-detail-image">
          <ImageCover
            src={h.gallery[1] || h.image} hotelId={h.id}
            alt={`${h.name} representative interior`}
          />
        </div>
        <div className="hotel-detail-info">
          <div>
            <span className="eyebrow with-line">A PLACE TO FEEL AT HOME</span>
            <h2
              className="serif"
              style={{ fontSize: "42px", margin: "14px 0" }}
            >
              Details make a <em>difference.</em>
            </h2>
            <p className="detail-lead">
              Each space is designed to feel warm and welcoming. Discover our
              room categories and choose the dates that suit you best. Explore
              confirmed facilities below.
            </p>
            {!demoMode && (
              <Amenities
                items={data.amenities.filter(
                  (a) => a.hotel_id === h.databaseId && !a.room_type_id,
                )}
              />
            )}
            <div className="amenities-wrap">
              {(demoMode ? h.amenities : []).map((x, i) => (
                <div className="amenity-tile" key={x}>
                  {
                    [
                      <Wifi size={19} key="a" />,
                      <BedDouble size={19} key="b" />,
                      <Coffee size={19} key="c" />,
                      <Sparkles size={19} key="d" />,
                    ][i % 4]
                  }
                  {x}
                </div>
              ))}
            </div>
            {real && <PropertyMap hotel={real} />}
          </div>
          <aside className="detail-book-panel">
            <span className="eyebrow">YOUR NEXT GETAWAY</span>
            <h3 className="serif">Reserve a room</h3>
            <p>
              Choose your dates to see the available rooms and nightly rates for{" "}
              {h.name}.
            </p>
            <SearchForm compact initial={{ hotel: h.id }} />
          </aside>
        </div>
        <section className="section"><Gallery photos={data.photos.filter(p=>p.hotelId===h.id)} compact/></section><div className="detail-rooms" id="rooms">
          <SectionTitle
            eyebrow="THE ROOMS"
            title={
              <>
                Stay your <em>way.</em>
              </>
            }
            description="Every room is a chapter of your stay. Explore our accommodation categories and find your preferred stay."
            action="All rooms"
            href="/rooms"
          />
          <div className="rooms-grid">
            {data.rooms
              .filter((r) => r.hotelId === h.id)
              .map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
          </div>
        </div>
        {!real&&<LocationsSection data={data} hotel={h.id}/>}<section className="property-policy-links"><h2 className="serif">Plan your stay with clarity.</h2><p>Review the property?s approved policies before reserving. Preview categories are not confirmed accommodation inventory.</p><div className="property-actions">{['booking-policy','cancellation-policy','terms-and-conditions'].map(slug=><Link className="button button-outline" key={slug} href={`/${slug}`}>{slug.replaceAll('-',' ')}</Link>)}</div></section>{real && (
          <NearbyPlaces
            items={data.nearby.filter((p) => p.hotel_id === real.id)}
          />
        )}{" "}
        {sister && (
          <div className="hotel-cross-link">
            <div>
              <div className="cross-photo">
                <ImageCover
                  src={sister.image}
                  alt={`${sister.name} representative image`}
                />
              </div>
              <div>
                <h4>Also discover {sister.name}</h4>
                <p>Another beautiful experience from our collection.</p>
              </div>
            </div>
            <Link
              className="button button-dark small"
              href={`/hotels/${sister.id}`}
            >
              Explore hotel <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
