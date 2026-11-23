import Link from 'next/link';
import { ArrowUpRight, Flower2, Mail, MapPin, MoveUpRight } from 'lucide-react';
import { Brand } from './SiteHeader';
export function SiteFooter(){return <footer className="site-footer">
  <div className="container footer-top"><div className="footer-intro"><div className="eyebrow on-dark"><Flower2 size={15}/> STAY A LITTLE LONGER</div><h2 className="serif">A good stay stays<br/><em>with you.</em></h2><p>Find a little more of what matters at Flower Inn & Petal Inn.</p></div><Link className="circle-cta" href="/search" aria-label="Find your stay"><MoveUpRight size={32}/></Link></div>
  <div className="container footer-grid"><div><Brand light/><p>Two thoughtful stays, one seamless experience. Discover the perfect place to unwind.</p><span className="footer-demo">Prototype preview · Property details & images are illustrative.</span></div>
    <div><h4>Discover</h4><Link href="/hotels">Our hotels</Link><Link href="/rooms">Rooms & suites</Link><Link href="/offers">Special offers</Link><Link href="/gallery">Gallery</Link></div>
    <div><h4>Helpful links</h4><Link href="/booking/manage">Manage booking</Link><Link href="/faq">Frequently asked questions</Link><Link href="/cancellation-policy">Cancellation policy</Link><Link href="/privacy-policy">Privacy policy</Link></div>
    <div><h4>Stay connected</h4><span><MapPin size={14}/> Locations to be confirmed</span><Link href="/contact"><Mail size={14}/> Contact our team</Link><Link href="/admin">Explore admin preview <ArrowUpRight size={14}/></Link></div>
  </div>
  <div className="container footer-bottom"><span>© {new Date().getFullYear()} Flower Inn & Petal Inn. Concept website preview.</span><span><Link href="/terms-and-conditions">Terms</Link><span>·</span><Link href="/privacy-policy">Privacy</Link><span>·</span><Link href="/admin">Admin preview</Link></span></div>
</footer>}
