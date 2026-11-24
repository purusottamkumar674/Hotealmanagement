import { demoMode } from "@/lib/platform";
import DemoProfile from "@/components/DemoProfile";
import Link from "next/link";
export default function Profile() {
  return demoMode ? (
    <DemoProfile />
  ) : (
    <main className="container content-shell">
      <section className="section">
        <h1 className="serif">Guest information</h1>
        <p>
          Your contact details are stored with your reservation. To review a
          reservation or request a correction, use your private booking access
          or contact the property.
        </p>
        <div className="property-actions">
          <Link className="button button-dark" href="/booking/manage">
            Manage reservation
          </Link>
          <Link className="button button-outline" href="/contact">
            Contact the property
          </Link>
        </div>
      </section>
    </main>
  );
}
