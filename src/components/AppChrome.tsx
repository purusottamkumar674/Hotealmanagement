"use client";
import type { Hotel } from "@/lib/catalog";
import { usePathname } from "next/navigation";
import { BrandContext } from "./BrandContext";
import { type FooterContact, SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
export function AppChrome({
  children,
  hotels = [],
  footerContacts = [],
  footerBanner = "",
}: {
  children: React.ReactNode;
  hotels?: Hotel[];
  footerContacts?: FooterContact[];
  footerBanner?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <BrandContext.Provider value={hotels}>
      {!isAdmin && <SiteHeader />}
      {children}
      {!isAdmin && (
        <SiteFooter contacts={footerContacts} bannerImage={footerBanner} />
      )}
    </BrandContext.Provider>
  );
}
