import { AdminLogin } from "@/components/admin/AdminLogin";
import { configured, session } from "@/lib/server/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};
export default async function AdminLoginPage() {
  const s = await session();
  if (s?.assignments.length) redirect("/admin");
  return (
    <main className="container content-shell">
      <div className="demo-page-head">
        <span className="eyebrow">PROPERTY MANAGEMENT</span>
        <h1 className="serif">Staff sign in</h1>
      </div>
      {configured() ? (
        <AdminLogin />
      ) : (
        <div className="empty-state">
          <h3>Connect your database</h3>
          <p>
            Supabase environment settings and migrations are required before
            staff can sign in. Follow the repository setup instructions to
            connect this installation.
          </p>
        </div>
      )}
    </main>
  );
}
