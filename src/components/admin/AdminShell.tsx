"use client";
import { Brand } from "@/components/SiteHeader";
import { demoMode } from "@/lib/platform";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BedDouble,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  FileText,
  Grid3X3,
  Home,
  Hotel,
  Image,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Plug,
  RotateCcw,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const sections: { heading: string; links: [string, string, LucideIcon][] }[] = [
  { heading: "OVERVIEW", links: [["/admin", "Dashboard", LayoutDashboard]] },
  {
    heading: "PROPERTY MANAGEMENT",
    links: [
      ["/admin/hotels", "Hotels", Hotel],
      ["/admin/accommodations", "Accommodation", BedDouble],
      ["/admin/inventory", "Room inventory", Grid3X3],
      ["/admin/calendar", "Availability calendar", CalendarDays],
      ["/admin/pricing", "Daily pricing", IndianRupee],
    ],
  },
  {
    heading: "OPERATIONS",
    links: [
      ["/admin/bookings", "Bookings", ClipboardList],
      ["/admin/guests", "Guests", Users],
      ["/admin/payments", "Payments", CreditCard],
      ["/admin/refunds", "Refunds", RotateCcw],
    ],
  },
  {
    heading: "GROWTH & CONTENT",
    links: [
      ["/admin/reviews", "Reviews", Star],
      ["/admin/seo", "Google Maps SEO", Search],
      ["/admin/seo-observations", "SEO observations", Search],
      ["/admin/reports", "Reports", ChartNoAxesCombined],
      ["/admin/cms", "Website CMS", FileText],
      ["/admin/offers", "Offers", Tag],
      ["/admin/gallery", "Photography & logos", Image],
      ["/admin/amenities", "Amenities", Hotel],
      ["/admin/nearby", "Nearby places", Search],
      ["/admin/hero-slides", "Homepage slides", Image],
      ["/admin/faqs", "FAQs", FileText],
      ["/admin/content", "Pages & policies", FileText],
      ["/admin/pricing-rules", "Pricing rules", IndianRupee],
    ],
  },
  {
    heading: "SYSTEM",
    links: [
      ["/admin/staff", "Staff & roles", UserCog],
      ["/admin/notifications", "Notifications", Bell],
      ["/admin/integrations", "Integrations", Plug],
      ["/admin/audit-logs", "Activity log", ScrollText],
      ["/admin/settings", "Settings", Settings],
    ],
  },
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const label =
    sections.flatMap((s) => s.links).find((x) => x[0] === path)?.[1] ||
    "Admin preview";
  return (
    <div className="admin-app">
      <div
        className={`admin-backdrop ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand">
          <Brand light />
          <p className="admin-mode">
            PROPERTY MANAGEMENT SYSTEM
            <br />
            {demoMode
              ? "Interactive frontend preview"
              : "Secure staff workspace"}
          </p>
        </div>
        <nav className="admin-nav" aria-label="Administration">
          {sections.map((section) => (
            <div key={section.heading}>
              <div className="admin-nav-title">{section.heading}</div>
              {section.links.map(([href, label, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={path === href ? "active" : ""}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-bottom">
          <Link href="/" onClick={() => setOpen(false)}>
            <Home size={16} /> View public site <ArrowUpRight size={13} />
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle admin menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-topbar-title">
              <strong>{label}</strong>
              <span>Flower Inn & Petal Inn / Workspace</span>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-demo-badge">
              PREVIEW · NOT SECURE FOR PRODUCTION
            </span>
            <span className="admin-avatar">
              <ShieldCheck size={18} />
            </span>
          </div>
        </header>
        <div className="admin-container">{children}</div>
      </div>
    </div>
  );
}
