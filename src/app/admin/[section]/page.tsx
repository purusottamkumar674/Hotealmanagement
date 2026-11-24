import { AdminSection } from "@/components/admin/AdminSections";
import { LiveAdmin } from "@/components/admin/LiveAdmin";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";
import { demoMode } from "@/lib/platform";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return ADMIN_SECTIONS.map((section) => ({ section }));
}

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  if (!ADMIN_SECTIONS.includes(section)) notFound();
  return demoMode ? (
    <AdminSection section={section} />
  ) : (
    <LiveAdmin section={section} />
  );
}
