import { AdminShell } from "@/components/admin/AdminShell";
import { demoMode } from "@/lib/platform";
import { session } from "@/lib/server/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Property administration",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!demoMode) {
    const s = await session();
    if (!s?.assignments.length) redirect("/admin-login");
  }
  return <AdminShell>{children}</AdminShell>;
}
