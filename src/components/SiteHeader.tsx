'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Flower2, Menu, X, Phone, Instagram } from 'lucide-react';
const NAV=[{href:'/',label:'Home'},{href:'/hotels',label:'Our hotels'},{href:'/rooms',label:'Rooms & suites'},{href:'/about',label:'Our story'},{href:'/offers',label:'Offers'},{href:'/contact',label:'Contact'}];
export function Brand({light=false}:{light?:boolean}){
  return <Link className={`brand ${light?'brand-light':''}`} href="/" aria-label="Flower Inn and Petal Inn home">
    <span className="brand-mark"><Flower2 size={26} strokeWidth={1.4}/></span>
    <span className="brand-type"><strong>FLOWER <i>&</i> PETAL</strong><small>THE INN COLLECTION</small></span>
  </Link>;
}
export function SiteHeader(){
  const pathname=usePathname();const [open,setOpen]=useState(false);
  return <>
    <div className="utility-bar"><div className="container utility-inner"><span>Two unique stays. One beautiful experience.</span><div><span>Reservations & enquiries</span><span className="utility-sep"/> <Link href="/contact"><Phone size={12}/> Contact us</Link><Link href="/gallery" aria-label="Gallery"><Instagram size={14}/></Link></div></div></div>
    <header className="site-header"><div className="container nav-inner"><Brand/>
      <nav className="desktop-nav" aria-label="Main navigation">{NAV.map(n=><Link key={n.href} href={n.href} className={pathname===n.href?'active':''}>{n.label}</Link>)}</nav>
      <div className="nav-actions"><Link className="button button-dark nav-book" href="/search">Book your stay <ArrowUpRight size={16}/></Link><button className="mobile-menu-btn" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div>
    </div></header>
    {open&&<div className="mobile-drawer"><nav aria-label="Mobile navigation">{NAV.map(n=><Link href={n.href} onClick={()=>setOpen(false)} key={n.href}>{n.label}<ArrowUpRight size={16}/></Link>)}<Link href="/booking/manage" onClick={()=>setOpen(false)}>Manage booking<ArrowUpRight size={16}/></Link><Link href="/admin" onClick={()=>setOpen(false)}>Admin preview<ArrowUpRight size={16}/></Link></nav></div>}
  </>;
}
