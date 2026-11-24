"use client";
import { ImageCover } from "@/components/Cards";
import { HOTELS, ROOMS, money, type HotelId } from "@/lib/catalog";
import { mutateState, resetDemo } from "@/lib/demo-store";
import { useDemo } from "@/lib/useDemo";
import {
  ArrowUpRight,
  Check,
  ClipboardCopy,
  Cloud,
  CreditCard,
  Database,
  Mail,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminHeader, DemoNote, Pill } from "./AdminCommon";
export function HotelsPanel() {
  const state = useDemo();
  const [editing, setEditing] = useState<HotelId | null>(null),
    [notes, setNotes] = useState(""),
    [message, setMessage] = useState("");
  const edit = (id: HotelId) => {
    setEditing(id);
    setNotes(state?.hotelNotes[id] || "");
    setMessage("");
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    mutateState(
      (s) => {
        s.hotelNotes[editing] = notes;
      },
      "Internal property note changed",
      editing,
    );
    setMessage(
      "Internal property note saved locally. Public hotel content is unchanged.",
    );
  };
  return (
    <>
      <AdminHeader
        title="Properties"
        subtitle="Manage the collection and review property readiness."
      />
      <DemoNote>
        Hotel names, addresses, service claims and media must be verified. The
        current properties are static sample catalog records, not editable
        production database entities.
      </DemoNote>
      <div className="admin-panel-grid">
        {HOTELS.map((h) => (
          <div className="admin-card" key={h.id}>
            <div className="admin-property-photo">
              <ImageCover src={h.image} alt={`${h.name} hotel placeholder`} />
            </div>
            <span className="eyebrow">{h.accent}</span>
            <div className="admin-property-footer">
              <div>
                <h2>{h.name}</h2>
                <p>Property details pending verification</p>
              </div>
              <Pill status="Preview" />
            </div>
            <div className="summary-line">
              <span>Room types</span>
              <strong>{ROOMS.filter((r) => r.hotelId === h.id).length}</strong>
            </div>
            <div className="summary-line">
              <span>Sample room units</span>
              <strong>
                {ROOMS.filter((r) => r.hotelId === h.id).reduce(
                  (s, r) => s + r.inventory,
                  0,
                )}
              </strong>
            </div>
            <div className="summary-line">
              <span>Location</span>
              <strong>Not confirmed</strong>
            </div>
            <div className="admin-form-actions">
              <Link
                className="button button-outline small"
                href={`/hotels/${h.id}`}
              >
                View public page <ArrowUpRight size={13} />
              </Link>
              <button
                className="button button-dark small"
                onClick={() => edit(h.id)}
              >
                Internal note
              </button>
            </div>
            {editing === h.id && (
              <form style={{ marginTop: 18 }} onSubmit={save}>
                <label className="admin-label">
                  Internal management notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Keep an internal note…"
                    maxLength={1000}
                  />
                </label>
                <div className="admin-form-actions">
                  <button className="button button-dark small" type="submit">
                    Save note
                  </button>
                  <button
                    className="button button-outline small"
                    type="button"
                    onClick={() => setEditing(null)}
                  >
                    Close
                  </button>
                </div>
                {message && (
                  <p role="status" className="muted">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
export function RoomsAdminPanel() {
  return (
    <>
      <AdminHeader
        title="Room types"
        subtitle="Illustrative room categories with independent inventory and base rates."
        actions={
          <Link className="button button-dark small" href="/admin/pricing">
            Edit nightly rates <ArrowUpRight size={13} />
          </Link>
        }
      />
      <DemoNote>
        Room types and stock quantities are seeded for preview. Real room
        creation and editing require authenticated database-backed CRUD.
      </DemoNote>
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Hotel</th>
                <th>Capacity</th>
                <th>Base rate</th>
                <th>Room units</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <p style={{ fontSize: 9, color: "#98ab9c" }}>
                      {r.bed} · {r.size}
                    </p>
                  </td>
                  <td>{HOTELS.find((h) => h.id === r.hotelId)?.name}</td>
                  <td>{r.guests} guests</td>
                  <td>{money(r.baseRate)}</td>
                  <td>{r.inventory}</td>
                  <td>
                    <Link
                      href={`/hotels/${r.hotelId}/rooms/${r.slug}`}
                      className="admin-toggle"
                    >
                      View room <ArrowUpRight size={13} />
                    </Link>
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
export function StaffPanel() {
  const roles = [
    ["Super admin", "Both properties · all workflows"],
    ["Group admin", "Both hotels with assigned permissions"],
    ["Property manager", "Only assigned hotel operations"],
    ["Front desk", "Assigned hotel reservations & check-in"],
    ["Finance staff", "Payments, refunds, reports"],
    ["Marketing / SEO", "Reviews, local SEO, website content"],
  ];
  return (
    <>
      <AdminHeader
        title="Staff & permissions"
        subtitle="Proposed role model for secure multi-property operations."
      />
      <DemoNote>
        Authentication is not active in the frontend preview. Do not add real
        staff accounts or credentials here. Implement Supabase Auth +
        property-scoped RLS before launch.
      </DemoNote>
      <div className="admin-card">
        <div className="admin-card-title">
          <div>
            <h2>Proposed production roles</h2>
            <p>
              Roles are documentation in this version, not active access
              controls.
            </p>
          </div>
          <Pill status="Backend required" />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Intended access</th>
                <th>Enforcement</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(([role, access]) => (
                <tr key={role}>
                  <td>
                    <strong>{role}</strong>
                  </td>
                  <td>{access}</td>
                  <td>
                    <Pill status="Not connected" />
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
export function IntegrationsPanel() {
  const integrations = [
    {
      name: "Supabase PostgreSQL + Auth",
      desc: "Real bookings, hotel roles, pricing and RLS.",
      icon: Database,
    },
    {
      name: "Razorpay (proposed)",
      desc: "Payment orders, verified webhooks and refunds.",
      icon: CreditCard,
    },
    {
      name: "Hotel channel manager",
      desc: "OTA rate/availability updates and reservations.",
      icon: Cloud,
    },
    {
      name: "Google Business Profile",
      desc: "Review sources, permitted profile metrics and updates.",
      icon: MapPin,
    },
    {
      name: "Google Analytics + Search Console",
      desc: "Traffic, search impressions and booking conversions.",
      icon: Search,
    },
    {
      name: "Email & WhatsApp provider",
      desc: "Confirmation, arrival and genuine review invitations.",
      icon: Mail,
    },
  ];
  return (
    <>
      <AdminHeader
        title="Integrations"
        subtitle="Third-party services needed for a production booking and reputation platform."
      />
      <DemoNote>
        No external account is connected and no credentials are included. The
        dashboard displays the intended integration interfaces only.
      </DemoNote>
      <div className="admin-card" style={{ display: "grid", gap: 12 }}>
        {integrations.map(({ name, desc, icon: Icon }) => (
          <div className="integration-row" key={name}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="kpi-icon">
                <Icon size={18} />
              </div>
              <div>
                <h3>{name}</h3>
                <p>{desc}</p>
              </div>
            </div>
            <Pill status="Not connected" />
          </div>
        ))}
      </div>
      <div className="admin-card" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 14 }}>Before enabling live operations</h2>
        <p className="muted">
          Confirm the hotel owner&apos;s accounts, channel manager API partner,
          payment merchant details, approved notification sender and production
          privacy/booking policies. Follow the README and docs in this ZIP.
        </p>
      </div>
    </>
  );
}
export function NotificationsPanel() {
  const [copied, setCopied] = useState("");
  const templates = [
    {
      title: "Demo reservation confirmation",
      body: "Hello {{guest}}, your requested stay at {{hotel}} from {{check_in}} to {{check_out}} has reference {{booking_reference}}. Please verify all details with the property.",
    },
    {
      title: "Pre-arrival reminder",
      body: "Hello {{guest}}, your visit to {{hotel}} is coming up on {{check_in}}. We look forward to welcoming you.",
    },
    {
      title: "Post-checkout honest review request",
      body: "Thank you for visiting {{hotel}}. If you would like to share an honest review of your experience, you may use {{review_url}}. All feedback is welcome.",
    },
  ];
  return (
    <>
      <AdminHeader
        title="Notification templates"
        subtitle="Reusable draft messages for future provider-connected workflows."
      />
      <DemoNote>
        These templates are not sent by the prototype. Email, SMS and WhatsApp
        delivery require approved providers, consent and verified send logs.
      </DemoNote>
      <div className="admin-panel-grid">
        {templates.map((t) => (
          <div className="admin-card" key={t.title}>
            <div className="admin-card-title">
              <div>
                <h2>{t.title}</h2>
                <p>Draft only</p>
              </div>
            </div>
            <p
              className="muted"
              style={{
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                minHeight: 110,
              }}
            >
              {t.body}
            </p>
            <button
              className="button button-outline small"
              onClick={() =>
                navigator.clipboard
                  ?.writeText(t.body)
                  .then(() => setCopied(t.title))
                  .catch(() => setCopied("Clipboard unavailable"))
              }
            >
              {copied === t.title ? (
                <Check size={14} />
              ) : (
                <ClipboardCopy size={14} />
              )}{" "}
              {copied === t.title ? "Copied" : "Copy template"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
export function AuditPanel() {
  const state = useDemo();
  return (
    <>
      <AdminHeader
        title="Activity log"
        subtitle="A browser-local record of selected demo edits."
      />
      <DemoNote>
        Local audit entries can be deleted by the browser owner and are not
        tamper-resistant. A real production system needs append-only server-side
        audit events.
      </DemoNote>
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {state?.audit.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.at).toLocaleString("en-IN")}</td>
                  <td>
                    <strong>{a.action}</strong>
                  </td>
                  <td>{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!state?.audit.length && (
            <div className="admin-empty">
              No demo changes recorded yet. Edit a rate, booking, or CMS
              headline to create an entry.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export function SettingsPanel() {
  const [message, setMessage] = useState("");
  const reset = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Reset all sample and test bookings, rates and local edits in this browser?",
      )
    ) {
      resetDemo();
      setMessage("Demo data reset to initial sample values.");
    }
  };
  return (
    <>
      <AdminHeader
        title="Workspace settings"
        subtitle="Settings for this frontend-only demonstration."
      />
      <DemoNote>
        Production settings will need secure configuration storage, validated
        changes, role authorization and secrets management.
      </DemoNote>
      <div className="admin-panel-grid">
        <div className="admin-card">
          <h2 style={{ fontSize: 15 }}>Preview environment</h2>
          <div className="summary-line">
            <span>Mode</span>
            <Pill status="Local demo" />
          </div>
          <div className="summary-line">
            <span>Hotels</span>
            <strong>Flower Inn · Petal Inn</strong>
          </div>
          <div className="summary-line">
            <span>Persistence</span>
            <strong>Browser localStorage</strong>
          </div>
          <div className="summary-line">
            <span>Authentication</span>
            <Pill status="Not connected" />
          </div>
          <div className="summary-line">
            <span>Payments</span>
            <Pill status="Not connected" />
          </div>
        </div>
        <div className="admin-card">
          <h2 style={{ fontSize: 15 }}>Reset demonstration</h2>
          <p className="muted">
            Remove browser-local test bookings, price overrides, inventory
            blocks, CMS edits, and activity history. Sample bookings are
            regenerated.
          </p>
          <button className="button button-outline small" onClick={reset}>
            <RotateCcw size={15} /> Reset demo data
          </button>
          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
