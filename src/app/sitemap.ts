import type { MetadataRoute } from 'next';
import { HOTELS,ROOMS } from '@/lib/catalog';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return ['/','/hotels','/rooms','/about','/offers','/gallery','/amenities','/contact','/faq',...HOTELS.map(h=>`/hotels/${h.id}`),...ROOMS.map(r=>`/hotels/${r.hotelId}/rooms/${r.slug}`)].map(route=>({url:base+route,lastModified:new Date()}))}
