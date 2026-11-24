"use client";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronDown,
  Flower2,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms & Apartments" },
  { href: "/amenities", label: "Amenities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];
const HOTELS = [
  { href: "/hotels/flower-inn", label: "Flower Inn" },
  { href: "/hotels/petal-inn", label: "Petal Inn" },
  { href: "/hotels", label: "View All Hotels" },
];
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Flower Inn and Petal Inn home"
    >
      <BrandLogo
        fallback={
          <Flower2
            className="header-flower"
            size={42}
            strokeWidth={1}
            aria-hidden="true"
          />
        }
      />
      <span className="brand-type">
        <strong>
          Flower Inn &amp;
          <br />
          Petal Inn
        </strong>
      </span>
    </Link>
  );
}
function HotelsDisclosure({
  mobile = false,
  close,
}: {
  mobile?: boolean;
  close?: () => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null),
    path = usePathname();
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      ref={ref}
      className={`hotels-disclosure ${mobile ? "hotels-disclosure-mobile" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          e.stopPropagation();
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary className={path.startsWith("/hotels") ? "active" : ""}>
        Our Hotels <ChevronDown size={16} />
      </summary>
      <div className="hotels-dropdown">
        {HOTELS.map((h, i) => (
          <Link
            key={h.href}
            href={h.href}
            aria-current={path === h.href ? "page" : undefined}
            onClick={() => {
              if (ref.current) ref.current.open = false;
              close?.();
            }}
          >
            {i === 2 ? <BedDouble size={24} /> : <Building2 size={24} />}
            <span>{h.label}</span>
            <ArrowRight size={17} />
          </Link>
        ))}
      </div>
    </details>
  );
}
export function SiteHeader() {
  const path = usePathname(),
    home = path === "/",
    dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const close = () => {
    dialog.current?.close();
  };
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 32));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);
  useEffect(() => {
    dialog.current?.close();
  }, [path]);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    let previous = "";
    const unlock = () => {
      document.body.style.overflow = previous;
      trigger.current?.focus();
      trigger.current?.setAttribute("aria-expanded", "false");
    };
    d.addEventListener("close", unlock);
    const resize = () => {
      if (window.innerWidth >= 1200 && d.open) d.close();
    };
    window.addEventListener("resize", resize);
    const observer = new MutationObserver(() => {
      if (d.open) {
        previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
    });
    observer.observe(d, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      d.removeEventListener("close", unlock);
      window.removeEventListener("resize", resize);
      if (d.open) document.body.style.overflow = previous;
    };
  }, []);
  const navLinks = (mobile = false) =>
    NAV.map((n, i) => (
      <span className="header-nav-slot" key={n.href}>
        <Link
          href={n.href}
          aria-current={path === n.href ? "page" : undefined}
          className={path === n.href ? "active" : ""}
          onClick={mobile ? close : undefined}
        >
          {n.label}
        </Link>
        {i === 0 && (
          <HotelsDisclosure
            mobile={mobile}
            close={mobile ? close : undefined}
          />
        )}
      </span>
    ));
  return (
    <div className={`luxury-header-shell ${home ? "header-over-hero" : ""}`}>
      <header
        className={`site-header luxury-header ${home && !scrolled ? "header-transparent" : "header-solid"}`}
      >
        <div className="container luxury-nav-inner">
          <Brand light />
          <nav className="luxury-desktop-nav" aria-label="Main navigation">
            {navLinks()}
          </nav>
          <div className="luxury-nav-actions">
            <Link className="header-book-button" href="/search">
              <CalendarDays size={18} />
              <span>Book Your Stay</span>
            </Link>
            <button
              ref={trigger}
              type="button"
              className="luxury-menu-trigger"
              aria-label="Open navigation menu"
              aria-controls="hotel-mobile-menu"
              aria-expanded="false"
              onClick={() => {
                dialog.current?.showModal();
                trigger.current?.setAttribute("aria-expanded", "true");
              }}
            >
              <Menu size={25} />
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={dialog}
        id="hotel-mobile-menu"
        className="luxury-mobile-menu"
        aria-label="Mobile navigation"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="mobile-menu-heading">
          <Brand light />
          <button
            type="button"
            autoFocus
            aria-label="Close navigation menu"
            onClick={close}
          >
            <X size={27} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navLinks(true)}
          <Link href="/booking/manage" onClick={close}>
            Manage Booking
          </Link>
        </nav>
        <Link
          className="header-book-button mobile-menu-book"
          href="/search"
          onClick={close}
        >
          <CalendarDays size={19} /> Book Your Stay
        </Link>
      </dialog>
    </div>
  );
}
