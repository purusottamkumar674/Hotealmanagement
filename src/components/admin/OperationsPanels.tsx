"use client";
import { HOTELS, ROOMS, money } from "@/lib/catalog";
import { formatDate, isoToday } from "@/lib/dates";
import {
  availableRooms,
  mutateState,
  setRates,
  type BookingStatus,
} from "@/lib/demo-store";
import { nightlyRate, priceKey } from "@/lib/pricing";
import { useDemo } from "@/lib/useDemo";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  Info,
  LockKeyhole,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AdminHeader,
  DemoNote,
  EmptyAdmin,
  Pill,
  exportCSV,
} from "./AdminCommon";
const statuses: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
  "No Show",
];
export function BookingsPanel() {
  const state = useDemo();
  const [hotel, setHotel] = useState("all"),
    [status, setStatus] = useState("all"),
    [query, setQuery] = useState(""),
    [message, setMessage] = useState("");
  const bookings = (state?.bookings || []).filter(
    (b) =>
      (hotel === "all" || b.hotelId === hotel) &&
      (status === "all" || b.status === status) &&
      `${b.reference} ${b.guestName} ${b.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const update = (ref: string, next: BookingStatus) => {
    const b = state?.bookings.find((x) => x.reference === ref);
    if (!b) return;
    const r = ROOMS.find((x) => x.id === b.roomId);
    if (
      r &&
      (b.status === "Cancelled" || b.status === "No Show") &&
      (next === "Confirmed" || next === "Checked In") &&
      availableRooms(r, b.checkIn, b.checkOut, state!) < b.rooms
    ) {
      setMessage(
        "Cannot reactivate this booking: rooms are no longer available.",
      );
      return;
    }
    mutateState(
      (s) => {
        const item = s.bookings.find((x) => x.reference === ref);
        if (item) item.status = next;
      },
      "Booking status updated",
      `${ref} → ${next}`,
    );
    setMessage(`${ref} updated to ${next} in local demo.`);
  };
  return (
    <>
      <AdminHeader
        title="Reservations"
        subtitle="View, filter and update browser-local sample and test bookings."
        actions={
          <>
            <button
              onClick={() =>
                exportCSV(
                  "demo-bookings.csv",
                  [
                    "Reference",
                    "Hotel",
                    "Room",
                    "Guest",
                    "Email",
                    "Check-in",
                    "Check-out",
                    "Rooms",
                    "Total",
                    "Status",
                  ],
                  bookings.map((b) => [
                    b.reference,
                    b.hotelId,
                    b.roomId,
                    b.guestName,
                    b.email,
                    b.checkIn,
                    b.checkOut,
                    b.rooms,
                    b.total,
                    b.status,
                  ]),
                )
              }
              className="button button-outline small"
            >
              <Download size={14} /> Export CSV
            </button>
            <Link className="button button-dark small" href="/search">
              New test booking <Plus size={14} />
            </Link>
          </>
        }
      />
      <DemoNote>
        Bookings are stored in this browser, not in Supabase. Admin changes are
        not protected by authentication. Do not enter real guest data.
      </DemoNote>
      {message && (
        <div className="notice info" style={{ marginBottom: 15 }}>
          <Info size={14} />
          {message}
        </div>
      )}
      <div className="admin-card">
        <div className="admin-filter-row">
          <input
            placeholder="Search reference or guest…"
            aria-label="Search bookings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
          <select
            aria-label="Filter bookings by hotel"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
          >
            <option value="all">All hotels</option>
            {HOTELS.map((h) => (
              <option value={h.id} key={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Hotel / room</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Change status (demo)</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.reference}>
                  <td>
                    <strong>{b.reference}</strong>
                    <div
                      style={{ color: "#94a99a", fontSize: 9, marginTop: 4 }}
                    >
                      {b.isSample ? "Seeded sample" : "Browser test"}
                    </div>
                  </td>
                  <td>
                    <strong>{b.guestName}</strong>
                    <div
                      style={{ fontSize: 9, color: "#94a99a", marginTop: 4 }}
                    >
                      {b.email}
                    </div>
                  </td>
                  <td>
                    {HOTELS.find((h) => h.id === b.hotelId)?.name}
                    <div
                      style={{ fontSize: 10, color: "#94a99a", marginTop: 4 }}
                    >
                      {ROOMS.find((r) => r.id === b.roomId)?.name} × {b.rooms}
                    </div>
                  </td>
                  <td>
                    {formatDate(b.checkIn)}
                    <div
                      style={{ fontSize: 10, color: "#94a99a", marginTop: 4 }}
                    >
                      to {formatDate(b.checkOut)}
                    </div>
                  </td>
                  <td>
                    <strong>{money(b.total)}</strong>
                  </td>
                  <td>
                    <Pill status={b.status} />
                  </td>
                  <td>
                    <select
                      aria-label={`Update ${b.reference} status`}
                      style={{
                        padding: 7,
                        border: "1px solid #dfe5dc",
                        borderRadius: 5,
                        fontSize: 10,
                        background: "white",
                      }}
                      value={b.status}
                      onChange={(e) =>
                        update(b.reference, e.target.value as BookingStatus)
                      }
                    >
                      {statuses.map((s) => (
                        <option value={s} key={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookings.length && (
            <EmptyAdmin text="No matching bookings in the demo dataset." />
          )}
        </div>
      </div>
    </>
  );
}
export function GuestsPanel() {
  const state = useDemo();
  const unique = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      bookings: number;
      hotels: Set<string>;
    }
  >();
  state?.bookings.forEach((b) => {
    const key = b.email.toLowerCase();
    const g = unique.get(key) || {
      name: b.guestName,
      email: b.email,
      phone: b.phone,
      bookings: 0,
      hotels: new Set<string>(),
    };
    g.bookings++;
    g.hotels.add(b.hotelId);
    unique.set(key, g);
  });
  return (
    <>
      <AdminHeader
        title="Guest directory"
        subtitle="Guests derived from the locally stored demo bookings."
      />
      <DemoNote>
        Names labeled Sample Guest are fictional seed data. Production guest
        profiles must be access-controlled.
      </DemoNote>
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Bookings</th>
                <th>Properties visited</th>
              </tr>
            </thead>
            <tbody>
              {[...unique.values()].map((g) => (
                <tr key={g.email}>
                  <td>
                    <strong>{g.name}</strong>
                  </td>
                  <td>{g.email}</td>
                  <td>{g.phone}</td>
                  <td>{g.bookings}</td>
                  <td>
                    {[...g.hotels]
                      .map((id) => HOTELS.find((h) => h.id === id)?.name)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export function PaymentsPanel() {
  const state = useDemo();
  const [message, setMessage] = useState("");
  const mark = (reference: string) => {
    mutateState(
      (s) => {
        const b = s.bookings.find((x) => x.reference === reference);
        if (b) b.paymentStatus = "Paid (sample)";
      },
      "Demo payment recorded",
      reference,
    );
    setMessage(
      `${reference} marked paid in the browser preview. No payment was processed.`,
    );
  };
  return (
    <>
      <AdminHeader
        title="Payments"
        subtitle="Track demonstration payment states; real gateway is not connected."
      />
      <DemoNote>
        Razorpay (proposed) requires merchant approval, credentials, webhook
        verification and secure booking backend. This page does not take
        payment.
      </DemoNote>
      {message && (
        <div className="notice info" style={{ marginBottom: 15 }}>
          <Info size={14} />
          {message}
        </div>
      )}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Hotel</th>
                <th>Illustrative total</th>
                <th>Payment mode/status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {state?.bookings.map((b) => (
                <tr key={b.reference}>
                  <td>
                    <strong>{b.reference}</strong>
                  </td>
                  <td>{HOTELS.find((h) => h.id === b.hotelId)?.name}</td>
                  <td>{money(b.total)}</td>
                  <td>
                    <Pill status={b.paymentStatus} />
                  </td>
                  <td>
                    {b.paymentStatus !== "Paid (sample)" ? (
                      <button
                        className="admin-toggle"
                        onClick={() => mark(b.reference)}
                      >
                        Mark paid (demo)
                      </button>
                    ) : (
                      <span className="muted">Recorded locally</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export function RefundsPanel() {
  return (
    <>
      <AdminHeader
        title="Refunds"
        subtitle="Refund workflow configuration and audit space."
      />
      <DemoNote>
        No real payment provider or refund API is connected. Refund operations
        must be server-side, authorized and idempotent.
      </DemoNote>
      <div className="empty-state" style={{ margin: "20px 0 50px" }}>
        <LockKeyhole size={32} />
        <h3>Refunds require live payment integration</h3>
        <p>
          Configure a verified gateway, client-approved cancellation rules and
          secure server authorization before processing real refunds.
        </p>
        <Link className="button button-outline" href="/admin/integrations">
          Integration setup <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
export function PricingPanel() {
  const state = useDemo();
  const [hotel, setHotel] = useState<string>("flower-inn"),
    [roomId, setRoomId] = useState("fl-classic"),
    [from, setFrom] = useState(isoToday(1)),
    [to, setTo] = useState(isoToday(8)),
    [price, setPrice] = useState(""),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const filtered = ROOMS.filter((r) => r.hotelId === hotel);
  const room = (ROOMS.find((r) => r.id === roomId) || filtered[0])!;
  const days = Array.from({ length: 14 }, (_, i) => isoToday(i + 1));
  const changeHotel = (id: string) => {
    setHotel(id);
    setRoomId(ROOMS.find((r) => r.hotelId === id)?.id || "");
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const count = setRates(room.id, from, to, Number(price));
      setNotice(
        `${count} nightly rate(s) updated. Search results in this browser will reflect the override.`,
      );
      setPrice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save rates.");
    }
  };
  return (
    <>
      <AdminHeader
        title="Daily room pricing"
        subtitle="Edit date-based prices independently for each hotel and room type."
      />
      <DemoNote>
        Weekend sample pricing automatically adds 12% to base rate, unless
        overridden. Dates, rates and rules are for demo only; production tax,
        promotions and season rules require approval.
      </DemoNote>
      <div className="admin-card">
        <div className="admin-card-title">
          <div>
            <h2>Set a date-range override</h2>
            <p>Enter INR per room per night (before unconfigured taxes).</p>
          </div>
          <Pill status="Browser preview" />
        </div>
        <form onSubmit={save}>
          <div className="admin-form-grid">
            <label className="admin-label">
              Hotel
              <select
                value={hotel}
                onChange={(e) => changeHotel(e.target.value)}
              >
                {HOTELS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              Room type
              <select
                value={room?.id}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {filtered.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              New price (INR)
              <input
                type="number"
                min="100"
                max="500000"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`Base ${money(room?.baseRate || 0)}`}
              />
            </label>
            <label className="admin-label">
              From date
              <input
                type="date"
                min={isoToday()}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="admin-label">
              To date (exclusive)
              <input
                type="date"
                min={from}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="button button-dark small" type="submit">
              Save nightly rates <CheckCircle2 size={15} />
            </button>
            <span className="muted">
              Applies to each night from start to before end date.
            </span>
          </div>
          {notice && (
            <p className="form-success" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
      <div className="admin-card" style={{ marginTop: 18 }}>
        <div className="admin-card-title">
          <div>
            <h2>Next 14 nights · {room?.name}</h2>
            <p>Live client-side preview of rate calculation</p>
          </div>
        </div>
        <div className="admin-rate-preview">
          {days.map((date) => {
            const overridden =
              state?.overrides[priceKey(room.id, date)] !== undefined;
            return (
              <div
                key={date}
                className={`rate-day ${overridden ? "active" : ""}`}
              >
                <span>
                  {formatDate(date, {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
                </span>
                <strong>
                  {money(nightlyRate(room, date, state?.overrides || {}))}
                </strong>
                <span>{overridden ? "Override" : "Base/weekend"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
export function InventoryPanel() {
  const state = useDemo();
  const [hotel, setHotel] = useState("flower-inn"),
    [roomId, setRoomId] = useState("fl-classic"),
    [date, setDate] = useState(isoToday(1)),
    [blocks, setBlocks] = useState("1"),
    [message, setMessage] = useState("");
  const filtered = ROOMS.filter((r) => r.hotelId === hotel);
  const room = (ROOMS.find((r) => r.id === roomId) || filtered[0])!;
  const changeHotel = (id: string) => {
    setHotel(id);
    setRoomId(ROOMS.find((r) => r.hotelId === id)?.id || "");
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(blocks),
      key = priceKey(room.id, date);
    if (!Number.isInteger(count) || count < 0 || count > room.inventory) {
      setMessage("Invalid blocked count.");
      return;
    }
    const alreadyOccupied =
      state?.bookings
        .filter(
          (b) =>
            b.roomId === room.id &&
            ["Confirmed", "Checked In", "Pending"].includes(b.status) &&
            b.checkIn <= date &&
            b.checkOut > date,
        )
        .reduce((s, b) => s + b.rooms, 0) || 0;
    if (count + alreadyOccupied > room.inventory) {
      setMessage(
        `Cannot block ${count} rooms; ${alreadyOccupied} are already used in the demo.`,
      );
      return;
    }
    mutateState(
      (s) => {
        s.blocks[key] = count;
      },
      "Inventory block updated",
      `${room.id} · ${date} · ${count} blocked`,
    );
    setMessage(
      `${count} unit(s) blocked for ${room.name} on ${formatDate(date)} (demo).`,
    );
  };
  return (
    <>
      <AdminHeader
        title="Room inventory"
        subtitle="View example room counts and block maintenance inventory per date."
      />
      <DemoNote>
        Real room inventory must use database transactions and hotel-scoped
        authorization. This prototype only updates local browser availability.
      </DemoNote>
      <div className="admin-panel-grid">
        <div className="admin-card">
          <h2 style={{ fontSize: 14, margin: "0 0 18px" }}>
            Block sample room inventory
          </h2>
          <form
            className="admin-form-grid"
            style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}
            onSubmit={save}
          >
            <label className="admin-label">
              Hotel
              <select
                value={hotel}
                onChange={(e) => changeHotel(e.target.value)}
              >
                {HOTELS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              Room type
              <select
                value={room.id}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {filtered.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              Date
              <input
                type="date"
                min={isoToday()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="admin-label">
              Blocked units
              <input
                type="number"
                min="0"
                max={room.inventory}
                value={blocks}
                onChange={(e) => setBlocks(e.target.value)}
              />
            </label>
            <button type="submit" className="button button-dark small">
              Save block <CheckCircle2 size={14} />
            </button>
          </form>
          {message && (
            <p className="muted" role="status">
              {message}
            </p>
          )}
        </div>
        <div className="admin-card">
          <h2 style={{ fontSize: 14, margin: "0 0 18px" }}>
            Sample room summary
          </h2>
          <div className="summary-line">
            <span>Room type</span>
            <strong>{room.name}</strong>
          </div>
          <div className="summary-line">
            <span>Total units</span>
            <strong>{room.inventory}</strong>
          </div>
          <div className="summary-line">
            <span>Blocked units on date</span>
            <strong>{state?.blocks[priceKey(room.id, date)] || 0}</strong>
          </div>
          <div className="summary-line total">
            <span>Available on date</span>
            <strong>
              {state
                ? availableRooms(room, date, isoTodayOffset(date, 1), state)
                : "—"}
            </strong>
          </div>
          <p className="muted">
            Set blocked units to 0 to remove a maintenance block.
          </p>
        </div>
      </div>
    </>
  );
}
function isoTodayOffset(day: string, step: number) {
  return new Date(Date.parse(day + "T00:00:00Z") + step * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function CalendarPanel() {
  const state = useDemo();
  const [hotel, setHotel] = useState("all");
  const rooms = ROOMS.filter((r) => hotel === "all" || r.hotelId === hotel),
    days = Array.from({ length: 14 }, (_, i) => isoToday(i));
  return (
    <>
      <AdminHeader
        title="Availability calendar"
        subtitle="A 14-day browser-local view of bookable room units."
      />
      <DemoNote>
        Preview data includes seeded sample reservations. Real inventory
        requires atomic server-side synchronization.
      </DemoNote>
      <div className="admin-filter-row">
        <select value={hotel} onChange={(e) => setHotel(e.target.value)}>
          <option value="all">All hotels</option>
          {HOTELS.map((h) => (
            <option value={h.id} key={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ minWidth: 1220 }}>
            <thead>
              <tr>
                <th>Room type</th>
                {days.map((day) => (
                  <th key={day}>
                    {formatDate(day, {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <strong>{room.name}</strong>
                    <div style={{ fontSize: 9, color: "#9aab9e" }}>
                      {HOTELS.find((h) => h.id === room.hotelId)?.name} ·{" "}
                      {room.inventory} total
                    </div>
                  </td>
                  {days.map((date) => {
                    const available = state
                      ? availableRooms(
                          room,
                          date,
                          isoTodayOffset(date, 1),
                          state,
                        )
                      : room.inventory;
                    return (
                      <td
                        key={date}
                        title={`${available} of ${room.inventory} available`}
                      >
                        <span
                          className={`status ${available === 0 ? "cancelled" : available < 3 ? "pending" : "confirmed"}`}
                        >
                          {available}/{room.inventory}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
