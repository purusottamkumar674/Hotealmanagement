import { CalendarDays, Info, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
export default function Account() {
  return (
    <main className="container">
      <div className="demo-page-head">
        <span className="eyebrow with-line">CUSTOMER AREA</span>
        <h1 className="serif">Your stay, your space.</h1>
        <p>
          Explore the customer portal preview. Full account authentication is
          planned for Supabase integration.
        </p>
      </div>
      <div className="notice info">
        <Info size={17} /> This prototype does not support real account creation
        or secure sign-in.
      </div>
      <div className="info-grid">
        <Link className="info-tile" href="/account/bookings">
          <CalendarDays size={30} />
          <h3>My demo bookings</h3>
          <p>Review test bookings created in this browser.</p>
        </Link>
        <Link className="info-tile" href="/account/profile">
          <UserRound size={30} />
          <h3>Profile preview</h3>
          <p>See how customer account information would be managed.</p>
        </Link>
        <Link className="info-tile" href="/login">
          <LockKeyhole size={30} />
          <h3>Authentication</h3>
          <p>
            Supabase authentication will be connected before production launch.
          </p>
        </Link>
      </div>
    </main>
  );
}
