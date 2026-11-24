import { ImageCover, RoomCard, SectionTitle } from "@/components/Cards";
import {Gallery} from "@/components/Gallery";
import {HotelImage} from "@/components/HotelImage";
import { SearchForm } from "@/components/SearchForm";
import { money } from "@/lib/catalog";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import {
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ slug: string; roomSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, roomSlug } = await params;
  const { rooms: ROOMS } = await catalog();
  const r = ROOMS.find((x) => x.hotelId === slug && x.slug === roomSlug);
  return {
    alternates: { canonical: `/hotels/${slug}/rooms/${roomSlug}` },
    title: r ? r.name : "Room not found",robots:r?.preview?{index:false,follow:false}:undefined,
    description: r?.description,
  };
}
export default async function RoomDetails({ params }: Props) {
  const { slug, roomSlug } = await params;
  const { rooms: ROOMS, hotels } = await catalog();
  const room = ROOMS.find((r) => r.hotelId === slug && r.slug === roomSlug);
  const hotel = hotels.find((h) => h.id === slug);
  if (!room || !hotel) notFound();
  const related = ROOMS.filter(
    (r) => r.hotelId === hotel.id && r.id !== room.id,
  );
  return (
    <main className="container content-shell">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight />
        <Link href="/hotels">Hotels</Link>
        <ChevronRight />
        <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
        <ChevronRight />
        {room.name}
      </div>
      <div className="room-detail-top">
        <div className="room-detail-visual">
          <ImageCover hotelId={hotel.id} src={room.image} alt={`Illustrative ${room.name}`} />
          <div className="mini-images">
            {room.gallery.slice(1, 3).map((img) => (
              <div key={img}>
                <ImageCover src={img} alt="Illustrative room interior" />
              </div>
            ))}
          </div>
        </div>
        <div className="room-detail-info">
          <span className="eyebrow with-line">{hotel.name.toUpperCase()}</span>
          <h1 className="serif">{room.name}</h1>
          <p>{room.description}</p>
          {!room.preview&&<div className="room-detail-facts">
            <div>
              <Users size={19} /> Up to {room.guests} guests
            </div>
            <div>
              <BedDouble size={19} />
              {room.bed}
            </div>
            <div>
              <Maximize2 size={19} />
              {room.size}
            </div>
          </div>
          }<p style={{ fontWeight: 700, color: "#395348" }}>{room.preview?'Category preview':'Amenities'}</p>
          <div className="room-facts">
            {room.amenities.map((a) => (
              <span key={a}>
                <CheckCircle2 size={14} />
                {a}
              </span>
            ))}
          </div>
          <div className="detail-book-panel" style={{ marginTop: 26 }}>
            <span className="eyebrow">{room.preview?'ILLUSTRATIVE ACCOMMODATION':'CURRENT BASE RATE'}</span>
            <h3 className="serif">
              {room.preview?'Rates and inventory to be confirmed':money(room.baseRate)}{" "}
              <span style={{ fontSize: 12, color: "#839082" }}> / night</span>
            </h3>
            <p>
              Search your dates for a server-calculated quote and current
              availability.
            </p>
            {room.preview?<p className="notice info">This category is a visual preview. It cannot be booked until the hotel confirms and publishes the actual inventory, rates and policies.</p>:<SearchForm compact initial={{ hotel: hotel.id }} />}
          </div>
        </div>
      </div>
      <section className="section"><Gallery photos={room.gallery.map((src,i)=>({id:`room-photo-${i}`,src,alt:`${room.name} ${room.preview?'illustrative':'property'} photograph`,hotelId:hotel.id,hotelName:hotel.name,category:'rooms',preview:!!room.preview}))} compact/></section><div style={{ paddingBottom: 100 }}>
        <SectionTitle
          eyebrow="YOU MIGHT ALSO LOVE"
          title={
            <>
              More rooms to <em>discover.</em>
            </>
          }
        />
        <div className="rooms-grid">
          {related.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      </div>
    </main>
  );
}
