"use client";
import { dateValidStay, isoToday } from "@/lib/dates";
import { ArrowRight, CalendarDays, Hotel, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBrands } from "./BrandContext";
import { demoMode } from "@/lib/platform";
import { HOTELS } from "@/lib/catalog";
export type SearchValues = {
  hotel: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
};
export function SearchForm({
  initial,
  compact = false,
}: {
  initial?: Partial<SearchValues>;
  compact?: boolean;
}) {
  const router = useRouter();
  const publishedHotels = useBrands();
  const choices = demoMode ? HOTELS : publishedHotels;
  const [hotel, setHotel] = useState(initial?.hotel || "all");
  const [checkin, setCheckin] = useState(initial?.checkin || isoToday(1));
  const [checkout, setCheckout] = useState(initial?.checkout || isoToday(3));
  const [guests, setGuests] = useState(initial?.guests || 2);
  const [rooms, setRooms] = useState(initial?.rooms || 1);
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateValidStay(checkin, checkout)) {
      setError(
        "Please select future dates, with checkout after check-in (up to 30 nights).",
      );
      return;
    }
    setError("");
    const p = new URLSearchParams({
      hotel,
      checkin,
      checkout,
      guests: String(guests),
      rooms: String(rooms),
    });
    router.push("/search?" + p.toString());
  };
  return (
    <form
      className={`search-form ${compact ? "search-form-compact" : ""}`}
      onSubmit={submit}
    >
      <div className="search-fields">
        <label className="search-field">
          <span>
            <Hotel size={15} /> PROPERTY
          </span>
          <select
            aria-label="Choose hotel"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
          >
            <option value="all">All properties</option>
            {choices.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span>
            <CalendarDays size={15} /> CHECK IN
          </span>
          <input
            aria-label="Check in date"
            type="date"
            min={isoToday()}
            value={checkin}
            onChange={(e) => {
              setCheckin(e.target.value);
              if (e.target.value && e.target.value >= checkout) {
                const d = new Date(e.target.value + "T12:00:00Z");
                d.setUTCDate(d.getUTCDate() + 1);
                setCheckout(d.toISOString().slice(0, 10));
              }
            }}
          />
        </label>
        <label className="search-field">
          <span>
            <CalendarDays size={15} /> CHECK OUT
          </span>
          <input
            aria-label="Check out date"
            type="date"
            min={checkin}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
          />
        </label>
        <div className="search-field guest-select">
          <span>
            <Users size={15} /> GUESTS
          </span>
          {demoMode ? (
            <select
              value={`${guests}|${rooms}`}
              onChange={(e) => {
                const [g, r] = e.target.value.split("|");
                setGuests(Number(g));
                setRooms(Number(r));
              }}
              aria-label="Guests and rooms"
            >
              {Array.from({ length: 5 }, (_, r) => r + 1).flatMap((r) =>
                Array.from({ length: 6 }, (_, g) => g + 1)
                  .filter((g) => g <= r * 4)
                  .map((g) => (
                    <option key={`${g}|${r}`} value={`${g}|${r}`}>
                      {g} guest{g > 1 ? "s" : ""} · {r} room{r > 1 ? "s" : ""}
                    </option>
                  )),
              )}
            </select>
          ) : (
            <div className="guest-controls">
              <label>
                Guests
                <input
                  aria-label="Guest count"
                  type="number"
                  min={1}
                  max={150}
                  required
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </label>
              <label>
                Units
                <select
                  aria-label="Accommodation unit count"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="button button-accent search-submit">
        Check availability <ArrowRight size={17} />
      </button>
      {error && (
        <p role="alert" className="search-error">
          {error}
        </p>
      )}
    </form>
  );
}
