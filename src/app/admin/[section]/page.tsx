import { notFound } from 'next/navigation';
import { AdminSection } from '@/components/admin/AdminSections';
import { ADMIN_SECTIONS } from '@/lib/admin-sections';

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return ADMIN_SECTIONS.map(section => ({ section }));
}

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  if (!ADMIN_SECTIONS.includes(section)) notFound();
  return <AdminSection section={section} />;
}
