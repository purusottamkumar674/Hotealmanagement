"use client";
import { api, minorMoney, type LiveQuote } from "@/lib/api-client";
import type { Room } from "@/lib/catalog";
import { dateValidStay, formatDate, isoToday } from "@/lib/dates";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoomCard } from "./Cards";
import { SearchForm } from "./SearchForm";
import { useBrands } from "./BrandContext";
const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "Please try again.";
export function LiveSearch() {
  const p = useSearchParams(),
    router = useRouter();
  const hotel = p.get("hotel") || "all",
    checkin = p.get("checkin") || isoToday(1),
    checkout = p.get("checkout") || isoToday(3),
    guests = Number(p.get("guests") || 2),
    rooms = Number(p.get("rooms") || 1);
  const [results, setResults] = useState<{ room: Room; quote: LiveQuote }[]>(
      [],
    ),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [refresh, setRefresh] = useState(0);
  const valid =
    dateValidStay(checkin, checkout) &&
    Number.isInteger(rooms) &&
    rooms >= 1 &&
    rooms <= 5 &&
    Number.isInteger(guests) &&
    guests >= 1 &&
    guests <= 150;
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      if (!valid) {
        setLoading(false);
        setError("Choose valid future dates, room and guest counts.");
        return;
      }
      setLoading(true);
      setError("");
      api<{ room: Room; quote: LiveQuote }[]>("availability/search", {
        method: "POST",
        body: JSON.stringify({ hotel, checkin, checkout, rooms, guests }),
        signal: controller.signal,
      })
        .then(setResults)
        .catch((e) => {
          if (!controller.signal.aborted) setError(errorText(e));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    });
    return () => controller.abort();
  }, [hotel, checkin, checkout, rooms, guests, valid, refresh]);
  useEffect(() => {
    const run = () => {
      if (!document.hidden) setRefresh((n) => n + 1);
    };
    const timer = setInterval(run, 30000);
    window.addEventListener("focus", run);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", run);
    };
  }, []);
  const select = (room: Room) =>
    router.push(
      "/checkout?" +
        new URLSearchParams({
          roomId: room.id,
          checkin,
          checkout,
          rooms: String(rooms),
          guests: String(guests),
        }),
    );
  return (
    <main className="container content-shell">
      <div className="demo-page-head">
        <span className="eyebrow">FIND YOUR STAY</span>
        <h1 className="serif">Explore availability</h1>
        <p>Compare accommodation and current nightly rates for your dates.</p>
      </div>
      <div className="search-layout">
        <aside className="search-sidebar">
          <SearchForm
            key={`${hotel}|${checkin}|${checkout}|${rooms}|${guests}`}
            compact
            initial={{ hotel, checkin, checkout, rooms, guests }}
          />
        </aside>
        <section aria-busy={loading}>
          <div className="search-results-head">
            <h2>
              {loading
                ? "Checking availability…"
                : `${error ? 0 : results.length} accommodation options`}
            </h2>
            <button
              className="button button-outline small"
              disabled={loading}
              onClick={() => setRefresh((n) => n + 1)}
            >
              Refresh rates
            </button>
          </div>
          {error ? (
            <p role="alert" className="form-error">
              {error}
            </p>
          ) : loading ? (
            <div
              className="loading-skeleton"
              aria-label="Loading accommodation"
            />
          ) : results.length ? (
            <div className="search-results">
              {results.map(({ room, quote }) => (
                <div key={room.id}>
                  <RoomCard
                    room={room}
                    action="select"
                    onSelect={select}
                    stayInfo={{
                      price: quote.total_minor / 100,
                      available: quote.available,
                      nights: quote.nights,
                      qty: rooms,
                    }}
                  />
                  {!quote.bookable && (
                    <p className="notice info">
                      Online booking for this property is awaiting approved
                      settings and policies.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No accommodation for these dates</h3>
              <p>Try another date range, property or guest count.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
export function LiveCheckout() {
  const p = useSearchParams(),
    router = useRouter();
  const roomId = p.get("roomId") || "",
    checkin = p.get("checkin") || "",
    checkout = p.get("checkout") || "",
    rooms = Number(p.get("rooms") || 1),
    guests = Number(p.get("guests") || 2);
  const [quote, setQuote] = useState<LiveQuote | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [refresh, setRefresh] = useState(0);
  const key = useRef("");
  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  useEffect(() => {
    const c = new AbortController();
    void Promise.resolve().then(() => {
      if (c.signal.aborted) return;
      setQuote(null);
      setError("");
      return api<LiveQuote>("bookings/quote", {
        method: "POST",
        body: JSON.stringify({ roomId, checkin, checkout, rooms, guests }),
        signal: c.signal,
      })
        .then(setQuote)
        .catch((e) => {
          if (!c.signal.aborted) setError(errorText(e));
        });
    });
    return () => c.abort();
  }, [roomId, checkin, checkout, rooms, guests, refresh]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quote || busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const result = await api<{ reference: string }>("bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId,
          checkin,
          checkout,
          rooms,
          guests,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          acceptedPolicies: form.get("policies") === "on",
          expectedTotalMinor: quote.total_minor,
          idempotencyKey: key.current,
        }),
      });
      router.push(`/booking/confirmation/${result.reference}`);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container content-shell">
      <div className="demo-page-head">
        <span className="eyebrow">YOUR RESERVATION</span>
        <h1 className="serif">Complete your stay</h1>
        <p>
          Review your nightly rates and the property policies before confirming.
        </p>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        className="button button-outline small"
        onClick={() => {
          setRefresh((n) => n + 1);
        }}
      >
        Refresh quote
      </button>
      {quote ? (
        <div className="checkout-layout">
          <form onSubmit={submit}>
            <div className="form-card">
              <h2>Guest details</h2>
              <div className="form-grid">
                <label className="form-label">
                  Full name
                  <input
                    name="name"
                    value={guest.name}
                    onChange={(e) =>
                      setGuest((g) => ({ ...g, name: e.target.value }))
                    }
                    autoComplete="name"
                    className="form-control"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label className="form-label">
                  Email
                  <input
                    name="email"
                    value={guest.email}
                    onChange={(e) =>
                      setGuest((g) => ({ ...g, email: e.target.value }))
                    }
                    autoComplete="email"
                    type="email"
                    className="form-control"
                    required
                    maxLength={254}
                  />
                </label>
                <label className="form-label">
                  Phone
                  <input
                    name="phone"
                    value={guest.phone}
                    onChange={(e) =>
                      setGuest((g) => ({ ...g, phone: e.target.value }))
                    }
                    autoComplete="tel"
                    type="tel"
                    className="form-control"
                    required
                    maxLength={30}
                  />
                </label>
              </div>
            </div>
            <div className="form-card">
              <h2>Pay at the property</h2>
              <p>
                Online payment is unavailable. When enabled by the property,
                this reservation is confirmed with payment due at the property
                under its approved policy.
              </p>
              <div className="property-actions">
                {[
                  "booking-policy",
                  "terms-and-conditions",
                  "cancellation-policy",
                  "privacy-policy",
                ].map((slug) => (
                  <Link key={slug} href={`/${slug}`} target="_blank">
                    {slug.replaceAll("-", " ")}
                  </Link>
                ))}
              </div>
              <label className="check-line">
                <input name="policies" type="checkbox" required />
                <span>
                  I have read and accept the booking, cancellation, privacy and
                  terms policies for this property.
                </span>
              </label>
              {!quote.bookable && (
                <p className="notice info">
                  Booking is awaiting approved property settings or policies.
                </p>
              )}
              {quote.available < rooms && (
                <p className="form-error">
                  This accommodation is no longer available for your dates.
                </p>
              )}
              <button
                disabled={busy || !quote.bookable || quote.available < rooms}
                className="button button-dark"
                type="submit"
              >
                {busy ? "Confirming…" : "Confirm reservation"}
              </button>
            </div>
          </form>
          <aside className="summary-card">
            <h2 className="serif">{quote.room_name}</h2>
            <p>{quote.hotel_name}</p>
            <p>
              {formatDate(checkin)} — {formatDate(checkout)} · {rooms} unit(s) ·{" "}
              {guests} guest(s)
            </p>
            {quote.nightly.map((n) => (
              <div className="summary-line" key={n.date}>
                <span>
                  {formatDate(n.date)} × {rooms}
                </span>
                <strong>
                  {minorMoney(n.rate_minor * rooms, quote.currency)}
                </strong>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>
                {minorMoney(quote.subtotal_minor, quote.currency)}
              </strong>
            </div>
            <div className="summary-line">
              <span>Tax</span>
              <strong>
                {quote.tax_configured
                  ? minorMoney(quote.tax_minor, quote.currency)
                  : "Awaiting approval"}
              </strong>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <strong>{minorMoney(quote.total_minor, quote.currency)}</strong>
            </div>
            <p>Rates and inventory are checked again when you confirm.</p>
          </aside>
        </div>
      ) : (
        !error && (
          <div className="loading-skeleton" aria-label="Preparing quote" />
        )
      )}
    </main>
  );
}
type Reservation = {
  id: string;
  reference: string;
  hotel_id: string;
  hotels: { name: string };
  currency: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  status: string;
  payment_status: string;
  total_minor: number;
  cancellation_requested_at: string | null;
  accessCode: string;
  booking_items: {
    room_type_id: string;
    room_types: { name: string };
    quantity: number;
    nightly_rates_minor: { date: string; rate_minor: number }[];
  }[];
};
export function LiveManage({
  confirmation = false,
}: {
  confirmation?: boolean;
}) {
  const params = useParams<{ reference?: string }>();
  const hotels = useBrands();
  const [reference, setReference] = useState(params.reference || ""),
    [access, setAccess] = useState(""),
    [booking, setBooking] = useState<Reservation | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const lookup = async (ref = reference, code = access) => {
    setBusy(true);
    setError("");
    try {
      setBooking(
        await api<Reservation>(`bookings/${encodeURIComponent(ref.trim())}`, {
          headers: code ? { "x-booking-access": code.trim() } : undefined,
        }),
      );
    } catch (e) {
      setError(errorText(e));
      setBooking(null);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (confirmation && params.reference) {
      let live = true;
      api<Reservation>(`bookings/${encodeURIComponent(params.reference)}`)
        .then((b) => {
          if (live) setBooking(b);
        })
        .catch((e) => {
          if (live) setError(errorText(e));
        });
      return () => {
        live = false;
      };
    }
  }, [confirmation, params.reference]);
  const cancel = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      await api(`bookings/${booking.reference}`, {
        method: "PATCH",
        headers: { "x-booking-access": booking.accessCode },
        body: JSON.stringify({ requestCancellation: true }),
      });
      setMessage(
        "Cancellation request received. The property will review it under its policy. This does not confirm a cancellation or refund.",
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="container content-shell">
      <div className="demo-page-head">
        <h1 className="serif">
          {confirmation ? "Your reservation" : "Manage your booking"}
        </h1>
        <p>
          Use the device that placed the reservation, or your reference and
          private access code.
        </p>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!booking && (
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup();
          }}
        >
          <div className="form-grid">
            <label className="form-label">
              Booking reference
              <input
                required
                className="form-control"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </label>
            <label className="form-label">
              Private access code (if using another device)
              <input
                type="password"
                autoComplete="off"
                className="form-control"
                value={access}
                onChange={(e) => setAccess(e.target.value)}
              />
            </label>
          </div>
          <button disabled={busy} className="button button-dark">
            {busy ? "Loading…" : "Find reservation"}
          </button>
        </form>
      )}
      {booking && (
        <article className="confirmation-card">
          {hotels.find((h) => h.databaseId === booking.hotel_id)?.logo && (
            <Image
              src={hotels.find((h) => h.databaseId === booking.hotel_id)!.logo!}
              alt={`${booking.hotels.name} official logo`}
              width={160}
              height={80}
              style={{ objectFit: "contain" }}
            />
          )}
          <p className="eyebrow">{booking.hotels.name}</p>
          <h2 className="serif">
            {booking.status === "confirmed"
              ? "Your stay is confirmed"
              : `Reservation: ${booking.status.replaceAll("_", " ")}`}
          </h2>
          <div className="reference-box">{booking.reference}</div>
          {booking.booking_items.map((item, i) => (
            <p key={i}>
              {item.room_types.name} × {item.quantity}
            </p>
          ))}
          <p>
            {booking.guest_name} · {formatDate(booking.check_in)} —{" "}
            {formatDate(booking.check_out)}
          </p>
          <p>
            {booking.guest_count} guest(s) ·{" "}
            {minorMoney(booking.total_minor, booking.currency)} · Payment{" "}
            {booking.payment_status}
          </p>
          <p>
            Keep this private access code to retrieve your booking on another
            device:
          </p>
          <code className="private-code">{booking.accessCode}</code>
          <div className="property-actions">
            <button
              className="button button-outline"
              onClick={() => window.print()}
            >
              Print reservation
            </button>
            <button
              disabled={
                busy ||
                !!booking.cancellation_requested_at ||
                !["confirmed", "pending"].includes(booking.status)
              }
              className="button button-outline"
              onClick={cancel}
            >
              Request cancellation
            </button>
          </div>
          {message && <p role="status">{message}</p>}
          <p>
            No online payment was taken. Confirmation emails are not configured.
          </p>
        </article>
      )}
    </main>
  );
}
