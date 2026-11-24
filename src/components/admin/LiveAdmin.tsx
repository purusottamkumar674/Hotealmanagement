"use client";
import {MediaManager} from "./MediaManager";
import { adminFields, type Field } from "@/lib/admin-fields";
import { api, minorMoney } from "@/lib/api-client";
import { isoToday } from "@/lib/dates";
import {
  canWrite,
  contentSchemas,
  resourceArea,
  type Assignment,
  type Resource,
} from "@/lib/platform";
import type { Row } from "@/lib/server/catalog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ImageCover } from "../Cards";
import { ReviewCollection } from "./ReviewCollection";
import { exportCSV } from "./AdminCommon";

type AdminRow = Record<string, unknown> & { id: string; hotel_id?: string };
function AuditChanges({ details }: { details: unknown }) {
  const d = (details || {}) as Record<string, unknown>;
  const old = (d.old || {}) as Record<string, unknown>,
    next = (d.new || {}) as Record<string, unknown>;
  const fields = [
    ...new Set([...Object.keys(old), ...Object.keys(next)]),
  ].filter(
    (k) =>
      k !== "updated_at" && JSON.stringify(old[k]) !== JSON.stringify(next[k]),
  );
  const show = (k: string, value: unknown) =>
    value == null
      ? "—"
      : k.endsWith("_minor")
        ? minorMoney(Number(value))
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
  return (
    <details>
      <summary>View changes</summary>
      <dl>
        {fields.map((k) => (
          <div key={k}>
            <dt>{k.replaceAll("_", " ")}</dt>
            <dd>
              {show(k, old[k])} → {show(k, next[k])}
            </dd>
          </div>
        ))}
        {!fields.length &&
          Object.entries(d).map(([k, v]) => (
            <div key={k}>
              <dt>{k.replaceAll("_", " ")}</dt>
              <dd>{show(k, v)}</dd>
            </div>
          ))}
      </dl>
    </details>
  );
}
function StaffEditor({ hotel, group }: { hotel: string; group: boolean }) {
  const [rows, setRows] = useState<AdminRow[]>([]),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    api<AdminRow[]>("admin/staff")
      .then((r) => {
        if (live) setRows(r);
      })
      .catch((e) => {
        if (live) setError(message(e));
      });
    return () => {
      live = false;
    };
  }, [version]);
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const role = String(f.get("role"));
    try {
      await api("admin/staff", {
        method: "POST",
        body: JSON.stringify({
          auth_user_id: f.get("user"),
          hotel_id: ["super_admin", "group_admin"].includes(role)
            ? null
            : hotel,
          role,
          active: f.get("active") === "on",
        }),
      });
      setVersion((n) => n + 1);
      setNotice(
        "Assignment saved and audited. The user’s next request uses the new permissions.",
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      <p className="admin-note">
        Create or invite the staff member in Supabase Auth, then enter their
        user ID here. Group administrators can assign property access or
        deactivate an existing assignment. Property roles apply to the selected
        hotel.
      </p>
      {group && (
        <form className="admin-card" onSubmit={save}>
          <div className="admin-form-grid">
            <label className="admin-label">
              Supabase Auth user ID
              <input name="user" required placeholder="User UUID" />
            </label>
            <label className="admin-label">
              Role
              <select name="role">
                <option value="property_manager">Property manager</option>
                <option value="front_desk">Hotel staff / front desk</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance / pricing</option>
                <option value="super_admin">
                  Super administrator (all hotels)
                </option>
                <option value="group_admin">
                  Group administrator (all hotels)
                </option>
              </select>
            </label>
            <label className="check-line">
              <input name="active" type="checkbox" defaultChecked />
              Active assignment
            </label>
          </div>
          <button disabled={busy} className="button button-dark">
            Save assignment
          </button>
        </form>
      )}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Property scope</th>
                <th>Role</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{String(r.auth_user_id)}</td>
                  <td>{r.hotel_id || "All hotels"}</td>
                  <td>{String(r.role)}</td>
                  <td>{String(r.active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
const message = (e: unknown) =>
  e instanceof Error ? e.message : "Unable to complete request.";
const titles: Record<string, string> = {
  dashboard: "Property overview",
  hotels: "Properties",
  "seo-observations": "Verified SEO observations",
  accommodations: "Accommodation",
  nearby: "Nearby places",
  amenities: "Amenities",
  faqs: "Frequently asked questions",
  content: "Pages & policies",
  "hero-slides": "Homepage slides",
  gallery: "Photography & logos",
  "pricing-rules": "Approved pricing rules",
  pricing: "Daily pricing",
  bookings: "Reservations",
  guests: "Guest directory",
  inventory: "Inventory blocks",
  calendar: "Availability",
  reports: "Reservation report",
  seo: "Local SEO worklist",
  reviews: "Reputation worklist",
  "audit-logs": "Activity history",
  staff: "Staff assignments",
  settings: "Property settings",
};
export function LiveAdmin({ section }: { section: string }) {
  const router = useRouter();
  const actual =
    (
      { rooms: "accommodations", cms: "content", settings: "hotels" } as Record<
        string,
        string
      >
    )[section] || section;
  const [hotels, setHotels] = useState<AdminRow[]>([]),
    [rooms, setRooms] = useState<AdminRow[]>([]),
    [media, setMedia] = useState<AdminRow[]>([]),
    [hotel, setHotel] = useState(""),
    [assignments, setAssignments] = useState<Assignment[]>([]),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((n) => n + 1), []);
  useEffect(() => {
    let active = true;
    Promise.all([
      api<AdminRow[]>("admin/hotels"),
      api<AdminRow[]>("admin/accommodations"),
      api<AdminRow[]>("admin/gallery"),
      api<{ assignments: Assignment[] }>("admin/session"),
    ])
      .then(([h, r, m, s]) => {
        if (!active) return;
        setHotels(h);
        setRooms(r);
        setMedia(m);
        setAssignments(s.assignments);
        setHotel((current) =>
          h.some((x) => x.id === current) ? current : h[0]?.id || "",
        );
        setError("");
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [version]);
  useEffect(() => {
    const timer = setInterval(
      () => {
        void api("auth/refresh", { method: "POST" }).catch(() => {
          router.replace("/admin-login");
          router.refresh();
        });
      },
      45 * 60 * 1000,
    );
    return () => clearInterval(timer);
  }, [router]);
  const resource = actual in contentSchemas ? (actual as Resource) : null;
  const group = assignments.some(
    (a) =>
      a.active &&
      a.hotel_id === null &&
      ["super_admin", "group_admin"].includes(a.role),
  );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>{titles[actual] || actual}</h1>
          <p>
            Database-backed management · Changes apply to the selected property.
          </p>
        </div>
        <div className="admin-header-actions">
          <label className="admin-label">
            Property
            <select
              aria-label="Select property"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
            >
              <option value="" disabled>
                Select a property
              </option>
              {hotels.map((h) => (
                <option value={h.id} key={h.id}>
                  {String(h.name)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-outline small"
            onClick={async () => {
              await api("auth/logout", { method: "POST" });
              router.replace("/admin-login");
              router.refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {["seo", "reviews"].includes(actual) && (
        <ReviewCollection
          name={String(hotels.find((h) => h.id === hotel)?.name || "Property")}
          url={
            hotels.find((h) => h.id === hotel)?.review_url
              ? String(hotels.find((h) => h.id === hotel)?.review_url)
              : undefined
          }
          keywords={String(
            hotels.find((h) => h.id === hotel)?.local_keywords || "",
          )}
        />
      )}{" "}
      {resource === 'gallery' ? <MediaManager key={hotel} hotel={hotel} images={media.filter(m=>m.hotel_id===hotel)} rooms={rooms.filter(r=>r.hotel_id===hotel)} writable={canWrite(assignments,hotel,'content')} manageLogo={canWrite(assignments,hotel,'settings')} onChange={refresh}/> : resource ? (
        <ResourceEditor
          key={`${resource}:${hotel}`}
          resource={resource}
          hotel={hotel}
          hotels={hotels}
          rooms={rooms.filter((r) => r.hotel_id === hotel)}
          media={media.filter((m) => m.hotel_id === hotel)}
          writable={canWrite(assignments, hotel, resourceArea(resource))}
          allowCreate={resource !== "hotels" || group}
          onChange={refresh}
        />
      ) : hotel ? (
        actual === "pricing" ? (
          <PricingEditor
            key={hotel}
            hotel={hotel}
            rooms={rooms.filter((r) => r.hotel_id === hotel)}
            writable={canWrite(assignments, hotel, "pricing")}
          />
        ) : actual === "staff" ? (
          <StaffEditor hotel={hotel} group={group} />
        ) : (
          <Operations
            key={`${actual}:${hotel}`}
            section={actual}
            hotel={hotel}
            rooms={rooms.filter((r) => r.hotel_id === hotel)}
            writable={canWrite(assignments, hotel, "operations")}
          />
        )
      ) : (
        <div className="empty-state">
          <h3>Add your properties to get started</h3>
          <p>
            A group administrator can create Flower Inn and Petal Inn from
            Properties, then add the confirmed inventory and approved content.
          </p>
          <Link className="button button-dark" href="/admin/hotels">
            Manage properties
          </Link>
        </div>
      )}
    </>
  );
}
function initialFields(
  resource: Resource,
  row?: AdminRow,
): Record<string, unknown> {
  return Object.fromEntries(
    adminFields[resource].map((f) => [
      f.key,
      row?.[f.key] ??
        f.initial ??
        (f.type === "checkbox"
          ? false
          : f.nullable
            ? null
            : (f.options?.[0] ?? "")),
    ]),
  );
}
function InputField({
  field: f,
  value,
  onChange,
  rooms,
  media,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  rooms: AdminRow[];
  media: AdminRow[];
}) {
  if (f.type === "checkbox")
    return (
      <label className="check-line">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {f.label}
      </label>
    );
  const select = f.type === "select" || f.type === "room" || f.type === "media";
  const options =
    f.options?.map((v) => ({ id: v, name: v.replaceAll("_", " ") })) ||
    (f.type === "room" ? rooms : media).map((r) => ({
      id: r.id,
      name: String(r.name || r.alt_text || r.id),
    }));
  return (
    <label className="admin-label">
      {f.label}
      {select ? (
        <select
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(
              e.target.value === "" && f.nullable
                ? null
                : f.key === "bhk_count"
                  ? Number(e.target.value)
                  : e.target.value,
            )
          }
        >
          {f.nullable && <option value="">None</option>}
          {!f.nullable && (
            <option value="" disabled>
              Select…
            </option>
          )}
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      ) : f.type === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={f.key === "body" ? 12 : 4}
        />
      ) : (
        <input
          type={f.type === "money" ? "number" : f.type || "text"}
          step={f.type === "money" ? "0.01" : f.step || "1"}
          value={
            f.type === "money" ? Number(value || 0) / 100 : String(value ?? "")
          }
          onChange={(e) =>
            onChange(
              f.type === "money"
                ? Math.round(Number(e.target.value) * 100)
                : f.type === "number"
                  ? e.target.value === "" && f.nullable
                    ? null
                    : Number(e.target.value)
                  : e.target.value === "" && f.nullable
                    ? null
                    : e.target.value,
            )
          }
        />
      )}
    </label>
  );
}
function ResourceEditor({
  resource,
  hotel,
  hotels,
  rooms,
  media,
  writable,
  allowCreate,
  onChange,
}: {
  resource: Resource;
  hotel: string;
  hotels: AdminRow[];
  rooms: AdminRow[];
  media: AdminRow[];
  writable: boolean;
  allowCreate: boolean;
  onChange: () => void;
}) {
  const [rows, setRows] = useState<AdminRow[]>([]),
    [editing, setEditing] = useState<string | null>(null),
    [form, setForm] = useState(() => initialFields(resource)),
    [file, setFile] = useState<File | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [version, setVersion] = useState(0),
    [deleting, setDeleting] = useState("");
  useEffect(() => {
    if (resource === "hotels") return;
    if (!hotel) return;
    let active = true;
    api<AdminRow[]>(`admin/${resource}?hotel_id=${hotel}`)
      .then((r) => {
        if (active) setRows(r);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [resource, hotel, hotels, version]);
  const write = writable || (resource === "hotels" && writable);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data: Record<string, unknown> = {
        ...form,
        ...(resource === "hotels" ? {} : { hotel_id: hotel }),
      };
      if (resource === "pricing-rules" && typeof data.weekdays === "string")
        data.weekdays = data.weekdays.split(",").map(Number);
      const parsed = contentSchemas[resource].parse(data);
      if (resource === "gallery" && file) {
        const payload = new FormData();
        payload.set("file", file);
        payload.set("metadata", JSON.stringify(parsed));
        if (editing) payload.set("id", editing);
        await api("admin/uploads", { method: "POST", body: payload });
      } else {
        if (resource === "gallery" && !editing)
          throw new Error(
            "Choose a licensed property photo or official logo to upload.",
          );
        await api(`admin/${resource}${editing ? `/${editing}` : ""}`, {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify(parsed),
        });
      }
      setNotice(
        "Saved to the database. Published website content updates on new requests.",
      );
      setEditing(null);
      setForm(initialFields(resource));
      setFile(null);
      setVersion((n) => n + 1);
      onChange();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    setBusy(true);
    setError("");
    try {
      await api(`admin/${resource}/${id}`, { method: "DELETE" });
      setDeleting("");
      setVersion((n) => n + 1);
      onChange();
      setNotice("Record removed.");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="admin-note">
        {resource === "gallery"
          ? "Upload only authentic property photos and official client-supplied logos with permission to publish. Files become publicly accessible; JPEG, PNG and WebP up to 8 MB."
          : resource === "content"
            ? "Publish only management-approved information. Policy text is rendered safely as plain paragraphs."
            : resource === "pricing-rules"
              ? "Date overrides take precedence over approved season/event rules, then weekend rules, then the base rate. Higher priority wins within a rule type; ties use newest creation time and ID. No discounts stack."
              : resource === "hotels"
                ? "Enable booking only after inventory, rates, legal policies, payment and tax treatment are approved. Unpublish instead of deleting."
                : "Publish only confirmed property information. Keep entries inactive while awaiting approval."}
      </p>
      {!write && (
        <p className="notice info">
          Your role can view these records. A property manager or authorized
          role is required to make changes.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      {write && (editing || allowCreate) && (
        <form className="admin-card" onSubmit={save}>
          <h2>{editing ? "Edit record" : "Add record"}</h2>
          <div className="admin-form-grid">
            {adminFields[resource].map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    [f.key]: v,
                    ...(f.key === "kind" && v === "weekend"
                      ? { weekdays: "0,6" }
                      : {}),
                  }))
                }
                rooms={rooms}
                media={
                  f.key === "logo_id"
                    ? media.filter((m) => m.category === "logo")
                    : media
                }
              />
            ))}
          </div>
          {resource === "gallery" && (
            <label className="admin-label">
              {editing ? "Replacement image (optional)" : "Image file"}
              <input
                key={`${editing || "new"}:${version}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          )}
          <div className="admin-form-actions">
            <button
              className="button button-dark"
              disabled={busy || (!hotel && resource !== "hotels")}
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
            {editing && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setEditing(null);
                  setForm(initialFields(resource));
                  setFile(null);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}
      <div className="admin-panel-grid" style={{ marginTop: 24 }}>
        {(resource === "hotels"
          ? hotels.filter((h) => h.id === hotel)
          : rows
        ).map((r) => (
          <article className="admin-card" key={r.id}>
            {resource === "gallery" && (
              <div className="admin-property-photo">
                <ImageCover
                  src={String(r.url || "")}
                  alt={String(r.alt_text || "Property image")}
                />
              </div>
            )}
            <h3>
              {String(
                r.name ||
                  r.question ||
                  r.title ||
                  r.heading ||
                  r.alt_text ||
                  r.keyword ||
                  r.source ||
                  r.id,
              )}
            </h3>
            <p className="muted">
              {String(r.category || r.slug || r.kind || "")} ·{" "}
              {r.active === false ||
              r.published === false ||
              r.status === "draft"
                ? "Draft / inactive"
                : "Saved"}
            </p>
            {Boolean(r.body) && (
              <p className="muted">{String(r.body).slice(0, 240)}</p>
            )}
            {resource === "seo-observations" && (
              <>
                <p>
                  {String(r.observed_on)} · {String(r.search_location)} ·{" "}
                  {String(r.metric_type)} ·{" "}
                  {r.observed_position == null
                    ? "Position not observed"
                    : `Position ${r.observed_position}`}
                </p>
                <p className="muted">{String(r.source_note)}</p>
                {Boolean(r.evidence_url) && (
                  <a
                    className="text-link"
                    href={String(r.evidence_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View evidence
                  </a>
                )}
              </>
            )}
            {resource === "reviews" && (
              <>
                <p>
                  {String(r.workflow_status)} ·{" "}
                  {r.source_verified
                    ? "Verified source"
                    : "Awaiting source verification"}
                  {r.star_rating != null ? ` · ${r.star_rating}/5` : ""}
                </p>
                <p className="plain-content">{String(r.review_content)}</p>
              </>
            )}
            {write && (
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="button button-outline small"
                  onClick={() => {
                    setEditing(r.id);
                    setForm(initialFields(resource, r));
                    setFile(null);
                    setNotice("");
                    setError("");
                  }}
                >
                  Edit
                </button>
                {!["hotels", "accommodations"].includes(resource) &&
                  (deleting === r.id ? (
                    <>
                      <span>Remove this record?</span>
                      <button
                        className="button button-outline small"
                        disabled={busy}
                        onClick={() => void remove(r.id)}
                      >
                        Remove
                      </button>
                      <button
                        className="button button-outline small"
                        onClick={() => setDeleting("")}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      className="button button-outline small"
                      onClick={() => setDeleting(r.id)}
                    >
                      Delete
                    </button>
                  ))}
              </div>
            )}
          </article>
        ))}
      </div>
      {!(resource === "hotels" ? hotels : rows).length && (
        <p className="admin-empty">No records yet for this property.</p>
      )}
    </>
  );
}
function PricingEditor({
  hotel,
  rooms,
  writable,
}: {
  hotel: string;
  rooms: AdminRow[];
  writable: boolean;
}) {
  const [room, setRoom] = useState(rooms[0]?.id || ""),
    [from, setFrom] = useState(isoToday(1)),
    [to, setTo] = useState(isoToday(14)),
    [rate, setRate] = useState(""),
    [reason, setReason] = useState(""),
    [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4, 5, 6]),
    [calendar, setCalendar] = useState<{ date: string; rate_minor: number }[]>(
      [],
    ),
    [history, setHistory] = useState<AdminRow[]>([]),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!room) return;
    let active = true;
    Promise.all([
      api<{ date: string; rate_minor: number }[]>(
        `admin/pricing?room_type_id=${room}&from=${from}&to=${to}`,
      ),
      api<AdminRow[]>(`admin/pricing/history?hotel_id=${hotel}`),
    ])
      .then(([rates, h]) => {
        if (active) {
          setCalendar(rates);
          setHistory(h);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [room, from, to, hotel, version]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const parsed = Number(rate);
      if (!/^\d+(\.\d{1,2})?$/.test(rate) || !Number.isFinite(parsed))
        throw new Error("Enter an INR amount with up to two decimal places.");
      const result = await api<{ updated: number }>(
        "admin/pricing/bulk-update",
        {
          method: "POST",
          body: JSON.stringify({
            hotel_id: hotel,
            room_type_id: room,
            from,
            to,
            rate_minor: Math.round(parsed * 100),
            weekdays,
            reason,
          }),
        },
      );
      setVersion((v) => v + 1);
      setNotice(
        `${result.updated} nightly rate(s) saved and audited. New customer searches use these rates immediately.`,
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="admin-note">
        Date ranges include both first and last dates. Existing confirmed
        reservations keep their original price. For seasonal and weekend rates,
        use <Link href="/admin/pricing-rules">Pricing rules</Link>.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      <form className="admin-card" onSubmit={save}>
        <div className="admin-form-grid">
          <label className="admin-label">
            Accommodation
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              {rooms.map((r) => (
                <option value={r.id} key={r.id}>
                  {String(r.name)} {r.bhk_count ? `· ${r.bhk_count} BHK` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            First date
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="admin-label">
            Last date (inclusive)
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label className="admin-label">
            New nightly price (INR)
            <input
              required
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </label>
          <label className="admin-label">
            Reason
            <input
              required
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>
        <fieldset className="weekday-options">
          <legend>Apply to weekdays</legend>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={weekdays.includes(i)}
                onChange={(e) =>
                  setWeekdays((ds) =>
                    e.target.checked ? [...ds, i] : ds.filter((d) => d !== i),
                  )
                }
              />
              {day}
            </label>
          ))}
        </fieldset>
        <button
          disabled={busy || !room || !writable}
          className="button button-dark"
        >
          {busy ? "Saving…" : "Save nightly rates"}
        </button>
      </form>
      <div className="admin-card" style={{ marginTop: 20 }}>
        <h2>Existing nightly rates</h2>
        <div className="admin-rate-preview">
          {calendar.map((d) => (
            <button
              className="rate-day"
              type="button"
              key={d.date}
              onClick={() => {
                setFrom(d.date);
                setTo(d.date);
                setRate(String(d.rate_minor / 100));
              }}
            >
              <span>{d.date}</span>
              <strong>{minorMoney(d.rate_minor)}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="admin-card" style={{ marginTop: 20 }}>
        <h2>Price history</h2>
        <p>
          <Link className="text-link" href="/admin/audit-logs">
            View rule and base rate changes in activity history
          </Link>
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Accommodation</th>
                <th>Date</th>
                <th>Old rate</th>
                <th>New rate</th>
                <th>Changed by</th>
                <th>Time / reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>
                    {String(
                      rooms.find((r) => r.id === h.room_type_id)?.name ||
                        h.room_type_id,
                    )}
                  </td>
                  <td>{String(h.stay_date)}</td>
                  <td>{minorMoney(Number(h.old_rate_minor))}</td>
                  <td>{minorMoney(Number(h.new_rate_minor))}</td>
                  <td>{String(h.changed_by)}</td>
                  <td>
                    {String(h.created_at)}
                    <br />
                    {String(h.reason)}
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
function Operations({
  section,
  hotel,
  rooms,
  writable,
}: {
  section: string;
  hotel: string;
  rooms: AdminRow[];
  writable: boolean;
}) {
  const [rows, setRows] = useState<AdminRow[]>([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [version, setVersion] = useState(0),
    [date, setDate] = useState(isoToday(1)),
    [availability, setAvailability] = useState<Row[]>([]);
  const endpoint =
    section === "dashboard"
      ? "bookings"
      : section === "calendar"
        ? "inventory"
        : section;
  const supported = [
    "bookings",
    "guests",
    "reports",
    "inventory",
    "audit-logs",
    "staff",
    "payments",
  ].includes(endpoint);
  useEffect(() => {
    let active = true;
    if (!supported) return;
    api<AdminRow[]>(`admin/${endpoint}?hotel_id=${hotel}`)
      .then((r) => {
        if (active) setRows(r);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [endpoint, hotel, version, supported]);
  const changeStatus = async (id: string, status: string) => {
    setError("");
    try {
      await api("admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      setVersion((n) => n + 1);
      setNotice(
        "Reservation status updated. Financial records were preserved.",
      );
    } catch (e) {
      setError(message(e));
    }
  };
  const block = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api("admin/inventory", {
        method: "POST",
        body: JSON.stringify({
          hotel_id: hotel,
          room_type_id: f.get("room"),
          stay_date: f.get("date"),
          blocked_units: Number(f.get("units")),
          reason: f.get("reason"),
        }),
      });
      setVersion((n) => n + 1);
      setNotice("Inventory block saved.");
    } catch (e) {
      setError(message(e));
    }
  };
  const loadAvailability = async () => {
    try {
      const checkout = new Date(Date.parse(date + "T00:00:00Z") + 86400000)
        .toISOString()
        .slice(0, 10);
      setAvailability(
        await api<Row[]>("availability/search", {
          method: "POST",
          body: JSON.stringify({
            hotel,
            checkin: date,
            checkout,
            rooms: 1,
            guests: 1,
          }),
        }),
      );
      setError("");
    } catch (e) {
      setError(message(e));
    }
  };
  if (!supported)
    return (
      <div className="empty-state">
        <h3>Integration configuration required</h3>
        <p>
          {section === "refunds"
            ? "Refunds require an approved provider and cancellation workflow. No online payment provider is connected."
            : section === "offers"
              ? "Promotions require approved stacking rules. Current quotes apply no discounts."
              : "This external integration is awaiting credentials and approved configuration."}
        </p>
      </div>
    );
  const columns =
    section === "staff"
      ? ["auth_user_id", "role", "active"]
      : section === "audit-logs"
        ? [
            "action",
            "entity_type",
            "entity_id",
            "actor_id",
            "created_at",
            "details",
          ]
        : section === "guests"
          ? ["guest_name", "guest_email", "guest_phone"]
          : endpoint === "inventory"
            ? ["room_type_id", "stay_date", "blocked_units", "reason"]
            : section === "payments"
              ? ["booking_id", "provider", "amount_minor", "status"]
              : [
                  "reference",
                  "guest_name",
                  "check_in",
                  "check_out",
                  "total_minor",
                  "status",
                  "cancellation_requested_at",
                ];
  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      {section === "staff" && (
        <p className="admin-note">
          Assignments are provisioned through Supabase by an authorized group
          administrator. The table shows assignments visible to your role. Never
          share accounts across properties.
        </p>
      )}
      {section === "dashboard" && (
        <div className="admin-kpis">
          <div className="admin-card">
            <p>Reservations (latest 500)</p>
            <strong>{rows.length}</strong>
          </div>
          <div className="admin-card">
            <p>Confirmed</p>
            <strong>
              {rows.filter((r) => r.status === "confirmed").length}
            </strong>
          </div>
          <div className="admin-card">
            <p>Uncancelled reservation value</p>
            <strong>
              {minorMoney(
                rows
                  .filter(
                    (r) =>
                      !["cancelled", "expired", "no_show"].includes(
                        String(r.status),
                      ),
                  )
                  .reduce((s, r) => s + Number(r.total_minor), 0),
              )}
            </strong>
          </div>
          <div className="admin-card">
            <p>Accommodation types</p>
            <strong>{rooms.length}</strong>
          </div>
        </div>
      )}
      {["inventory", "calendar"].includes(section) && (
        <>
          <form className="admin-card" onSubmit={block}>
            <h2>Inventory block</h2>
            <div className="admin-form-grid">
              <label className="admin-label">
                Accommodation
                <select name="room">
                  {rooms.map((r) => (
                    <option value={r.id} key={r.id}>
                      {String(r.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-label">
                Date
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={isoToday(1)}
                />
              </label>
              <label className="admin-label">
                Units blocked
                <input
                  required
                  name="units"
                  type="number"
                  min="0"
                  max="1000"
                  defaultValue={0}
                />
              </label>
              <label className="admin-label">
                Reason
                <input name="reason" required maxLength={1000} />
              </label>
            </div>
            <button
              className="button button-dark"
              disabled={!writable || !rooms.length}
            >
              Save block
            </button>
          </form>
          <div className="admin-card">
            <h2>Availability by date</h2>
            <label className="admin-label">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <button
              className="button button-outline"
              onClick={() => void loadAvailability()}
            >
              Check availability
            </button>
            {availability.map((r, i) => (
              <p key={i}>
                {String((r.room as Record<string, unknown>)?.name)} ·{" "}
                {String((r.quote as Record<string, unknown>)?.available)}{" "}
                available
              </p>
            ))}
          </div>
        </>
      )}
      <div className="admin-card">
        <h2>
          {section === "reports"
            ? "Latest reservation report (up to 500 records)"
            : "Records"}
        </h2>
        <button
          className="button button-outline small"
          onClick={() =>
            exportCSV(
              `${section}.csv`,
              columns,
              rows.map((r) => columns.map((c) => String(r[c] ?? ""))),
            )
          }
        >
          Export CSV
        </button>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c.replaceAll("_", " ")}</th>
                ))}
                {endpoint === "bookings" && writable && <th>Update status</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c}>
                      {c === "details" ? (
                        <AuditChanges details={r.details} />
                      ) : c.endsWith("_minor") ? (
                        minorMoney(Number(r[c]))
                      ) : (
                        String(r[c] ?? "—")
                      )}
                    </td>
                  ))}
                  {endpoint === "bookings" && writable && (
                    <td>
                      <select
                        aria-label={`Update ${r.reference}`}
                        value=""
                        onChange={(e) =>
                          void changeStatus(r.id, e.target.value)
                        }
                      >
                        <option value="">Choose action</option>
                        {(r.status === "confirmed"
                          ? ["checked_in", "cancelled", "no_show"]
                          : r.status === "checked_in"
                            ? ["checked_out"]
                            : r.status === "pending"
                              ? ["cancelled", "expired"]
                              : []
                        ).map((s) => (
                          <option value={s} key={s}>
                            {s.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p>No records available for this property and your role.</p>
        )}
      </div>
    </>
  );
}
