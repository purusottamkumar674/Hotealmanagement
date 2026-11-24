"use client";
import { HOTELS, ROOMS, money } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { getDemoState, observeState, type DemoBooking } from "@/lib/demo-store";
import { ArrowUpRight, CalendarDays, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function MyBookings() {
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  useEffect(() => {
    const refresh = () => {
      const state = getDemoState();
      const email = sessionStorage.getItem("fp-last-guest-email");
      setBookings(
        email
          ? state.bookings.filter(
              (b) =>
                !b.isSample && b.email.toLowerCase() === email.toLowerCase(),
            )
          : [],
      );
    };
    refresh();
    return observeState(refresh);
  }, []);
  return (
    <main className="container" style={{ minHeight: "65vh" }}>
      <div className="demo-page-head">
        <span className="eyebrow with-line">CUSTOMER PREVIEW</span>
        <h1 className="serif">My demo bookings</h1>
        <p>
          Only reservations associated with the most recent guest email in this
          browser session appear below. This is not authenticated access.
        </p>
      </div>
      <div className="notice info">
        <Info size={18} /> Do not use this demo with real personal information.
        Secure customer accounts require a connected Supabase backend.
      </div>
      <div style={{ margin: "33px 0 100px", display: "grid", gap: 15 }}>
        {bookings.length ? (
          bookings.map((b) => (
            <div
              className="admin-card"
              key={b.reference}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="eyebrow">{b.reference}</span>
                <h2 className="serif" style={{ fontSize: 24, margin: "7px 0" }}>
                  {HOTELS.find((h) => h.id === b.hotelId)?.name} ·{" "}
                  {ROOMS.find((r) => r.id === b.roomId)?.name}
                </h2>
                <p className="muted">
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)} ·{" "}
                  {money(b.total)} · {b.status}
                </p>
              </div>
              <Link
                className="button button-outline"
                href={`/booking/confirmation/${b.reference}`}
              >
                View <ArrowUpRight size={15} />
              </Link>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <CalendarDays size={31} />
            <h3>No demo bookings yet</h3>
            <p>
              Browse available rooms and create a test booking to see it here.
            </p>
            <Link className="button button-dark" href="/search">
              Explore rooms
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
