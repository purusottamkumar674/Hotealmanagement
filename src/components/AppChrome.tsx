'use client';
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
export function AppChrome({children}:{children:React.ReactNode}){
  const pathname=usePathname();const isAdmin=pathname.startsWith('/admin');
  return <>{!isAdmin&&<SiteHeader/>}{children}{!isAdmin&&<SiteFooter/>}</>;
}
