import DemoCheckout from "@/components/DemoCheckout";
import { LiveCheckout } from "@/components/LiveBooking";
import { demoMode } from "@/lib/platform";
import type { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default function CheckoutPage() {
  return demoMode ? (
    <DemoCheckout />
  ) : (
    <Suspense fallback={<p className="container">Preparing checkout…</p>}>
      <LiveCheckout />
    </Suspense>
  );
}
