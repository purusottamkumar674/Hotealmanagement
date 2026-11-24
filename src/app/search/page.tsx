import DemoSearch from "@/components/DemoSearch";
import { LiveSearch } from "@/components/LiveBooking";
import { demoMode } from "@/lib/platform";
import type { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Find accommodation",
  robots: { index: false, follow: false },
};
export default function SearchPage() {
  return demoMode ? (
    <DemoSearch />
  ) : (
    <Suspense fallback={<p className="container">Preparing search…</p>}>
      <LiveSearch />
    </Suspense>
  );
}
