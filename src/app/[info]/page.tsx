import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ImageCover } from '@/components/Cards';
import { INFO_META } from '@/lib/info-pages';
import { InfoContent } from '@/components/InfoContent';
type Props={params:Promise<{info:string}>};
export function generateStaticParams(){return Object.keys(INFO_META).map(info=>({info}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {info}=await params;const p=INFO_META[info];return {title:p?p.title:'Not found',description:p?.description};}
export default async function InfoPage({params}:Props){const {info}=await params;const p=INFO_META[info];if(!p)notFound();return <main><section className="page-hero"><ImageCover src={p.hero} alt="Illustrative hospitality photography"/><div className="container page-hero-inner"><span className="eyebrow">{p.eyebrow}</span><h1 className="serif">{p.title}</h1><p>{p.description}</p></div></section><div className="container"><div className="breadcrumb"><Link href="/">Home</Link><ChevronRight/>{p.title}</div><InfoContent slug={info}/></div></main>}
