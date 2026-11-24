import { ImageCover } from "@/components/Cards";
import { InfoContent } from "@/components/InfoContent";
import { VisualInfo } from "@/components/VisualInfo";
import { INFO_META } from "@/lib/info-pages";
import { demoMode } from "@/lib/platform";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ info: string }> };
export function generateStaticParams() {
  return Object.keys(INFO_META).map((info) => ({ info }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { info } = await params;
  const p = INFO_META[info];
  return {
    alternates: { canonical: `/${info}` },
    title: p ? p.title : "Not found",
    description: p?.description,
  };
}
export default async function InfoPage({ params }: Props) {
  const { info } = await params;
  const p = INFO_META[info];
  if (!p) notFound();
  const data = await catalog();
  return (
    <main>
      <section className="page-hero">
        <ImageCover
          src={
            demoMode
              ? p.hero
              : data.photos[info==='about'?1:0]?.src || ""
          }
          alt="Illustrative hospitality photography"
        />
        <div className="container page-hero-inner">
          <span className="eyebrow">{p.eyebrow}</span>
          <h1 className="serif">{p.title}</h1>
          <p>{p.description}</p>
        </div>
      </section>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight />
          {p.title}
        </div>
        {demoMode ? (
          <InfoContent slug={info} />
        ) : (
          <VisualInfo slug={info} data={data} />
        )}
      </div>
    </main>
  );
}
