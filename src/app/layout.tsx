import { AppChrome } from "@/components/AppChrome";
import { demoMode } from "@/lib/platform";
export const dynamic = "force-dynamic";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import type { Metadata } from "next";
import "./globals.css";
const indexable = !demoMode && process.env.SITE_INDEXING_ENABLED === "true";
export const metadata: Metadata = {
  title: {
    default: "Flower Inn & Petal Inn | A beautiful way to stay",
    template: "%s | Flower & Petal",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  description:
    "Explore Flower Inn and Petal Inn. Discover accommodation, confirmed property information and nightly rates for your stay.",
  alternates: { canonical: "/" },
  icons: { icon: "/api/branding/favicon" },
  robots: { index: indexable, follow: indexable },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await catalog();
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppChrome
          hotels={data.hotels}
          footerContacts={data.hotelRows.map((h) => ({
            slug: h.slug,
            name: h.name,
            address: [h.address, h.city, h.state, h.postal_code]
              .filter(Boolean)
              .join(", "),
            phone: h.contact_phone,
            email: h.contact_email,
            maps: h.google_maps_url,
          }))}
          footerBanner={
            data.photos.find(
              (p) =>
                p.hotelId === "flower-inn" &&
                (p.category === "rooms" || p.category === "bedroom"),
            )?.src || ""
          }
        >
          <div id="main-content">{children}</div>
        </AppChrome>
      </body>
    </html>
  );
}
