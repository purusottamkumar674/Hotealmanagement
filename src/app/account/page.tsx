import Link from "next/link";
import { demoMode } from "@/lib/platform";
import DemoAccount from "@/components/DemoAccount";
export default function Account() {
  return demoMode ? (
    <DemoAccount />
  ) : (
    <main className="container content-shell">
      <section className="section">
        <h1 className="serif">Your stay, your space.</h1>
        <p>
          Reservations use guest checkout. Keep your booking reference and
          private access code to manage your stay securely.
        </p>
        <div className="property-actions">
          <Link className="button button-dark" href="/booking/manage">
            Manage a reservation
          </Link>
          <Link className="button button-outline" href="/search">
            Find your next stay
          </Link>
          <Link className="text-link" href="/admin-login">
            Staff sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
