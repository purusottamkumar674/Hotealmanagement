"use client";
import type { Hotel, Room } from "@/lib/catalog";
import { HOTELS, money } from "@/lib/catalog";
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Maximize2,
  Users,
} from "lucide-react";
import {HotelImage} from './HotelImage';
import Link from "next/link";
export function ImageCover({
  src,
  alt,
  className = "",
  eager = false,
  hotelId, fallback, allowSamples,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  hotelId?:string;fallback?:string;allowSamples?:boolean;
}) {
  return (
    <div className={`image-cover ${className}`}>
        <HotelImage
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 780px) 100vw, 65vw"
          priority={eager}
          hotelId={hotelId} fallback={fallback} allowSamples={allowSamples}
        />
    </div>
  );
}
export function HotelCard({
  hotel,
  index = 0,
}: {
  hotel: Hotel;
  index?: number;
}) {
  return (
    <Link className="hotel-card" href={`/hotels/${hotel.id}`}>
      <div className="hotel-card-photo">
        <ImageCover
          src={hotel.image}
          alt={`${hotel.name} property photography`}
          hotelId={hotel.id} allowSamples={hotel.samplesEnabled}
        />
        <span className="photo-top-badge">{hotel.preview?'COLLECTION PREVIEW':`PROPERTY 0${index+1}`}</span>
        <span className="hotel-card-arrow">
          <ArrowUpRight size={21} />
        </span>
      </div>
      <div className="hotel-card-content">
        <div>
          <p className="eyebrow">{hotel.accent}</p>
          <h3 className="serif">{hotel.name}</h3>
          <p>{hotel.subtitle}</p>
        </div>
        <span className="view-link">
          Explore property <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
export function RoomCard({
  room,
  action = "details",
  onSelect,
  stayInfo,
}: {
  room: Room;
  action?: "details" | "select";
  onSelect?: (room: Room) => void;
  stayInfo?: { price: number; available: number; nights: number; qty: number };
}) {
  const hotel = (room.live
    ? undefined
    : HOTELS.find((h) => h.id === room.hotelId)) || {
    id: room.hotelId,
    name: room.hotelName || room.hotelId,
  };
  return (
    <article className="room-card">
      <div className="room-photo">
        <ImageCover src={room.image} alt={`${room.name} accommodation photo`} hotelId={room.hotelId} fallback="/images/img1.png" allowSamples={room.samplesEnabled}/>
        <div className="room-hotel-badge">{hotel.name}</div>
      </div>
      <div className="room-card-body">
        <div className="room-title-row">
          <div>
            <span className="eyebrow">{room.subtitle}</span>
            <h3 className="serif">{room.name}</h3>
          </div>
          <div className="room-price">
            {room.preview?<><small>Category preview</small><strong className="preview-rate-label">Rates to be confirmed</strong><span>Not bookable</span></>:<>
            <small>{stayInfo ? "Total stay from" : "Starting from"}</small>
            <strong>{money(stayInfo?.price ?? room.baseRate)}</strong>
            <span>
              {stayInfo
                ? `${stayInfo.nights} night${stayInfo.nights > 1 ? "s" : ""}`
                : room.live
                  ? "per night"
                  : "per night · sample"}
            </span>
            </>}
          </div>
        </div>
        <p>{room.description}</p>
        {!room.preview?<div className="room-facts">
          <span>
            <Users size={15} /> Up to {room.guests}
          </span>
          <span>
            <BedDouble size={15} /> {room.bed}
          </span>
          <span>
            <Maximize2 size={15} /> {room.size}
          </span>
        </div>:<p className="category-preview-note">Illustrative category. Layout, capacity, facilities and availability require property confirmation.</p>}
        <div className="room-card-bottom">
          <span className="room-available">
            {room.preview?'Preview • availability unconfirmed':stayInfo
              ? `${stayInfo.available} left for your dates`
              : room.live
                ? "Search dates for latest rates"
                : "Illustrative room & pricing"}
          </span>
          {action === "select" && onSelect ? (
            <button
              onClick={() => onSelect(room)}
              className="button button-dark small"
            >
              Choose room <ArrowRight size={15} />
            </button>
          ) : (
            <Link
              className="button button-outline small"
              href={`/hotels/${hotel.id}/rooms/${room.slug}`}
            >
              View details <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
  href,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <div className="eyebrow with-line">{eyebrow}</div>
        <h2 className="serif">{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && href && (
        <Link href={href} className="text-link">
          {action} <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
