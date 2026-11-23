'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, CheckCircle2, ArrowUpRight, Calendar, Printer, Info } from 'lucide-react';
import { getDemoState, observeState, type DemoBooking } from '@/lib/demo-store';
import { HOTELS, ROOMS, money } from '@/lib/catalog';
import { formatDate } from '@/lib/dates';
export default function BookingConfirmation(){const params=useParams<{reference:string}>();const reference=decodeURIComponent(params.reference||'');const [booking,setBooking]=useState<DemoBooking|null>(null);const [ready,setReady]=useState(false);
 useEffect(()=>{const refresh=()=>{setBooking(getDemoState().bookings.find(b=>b.reference===reference)||null);setReady(true)};refresh();return observeState(refresh)},[reference]);
 if(!ready)return <div className="container" style={{padding:85}}>Loading preview confirmation…</div>;
 if(!booking)return <main className="container"><div className="empty-state" style={{margin:'90px auto',maxWidth:620}}><Info size={31}/><h3>Booking not found in this browser</h3><p>Demo bookings are stored locally in the browser that created them; they are not accessible on other devices.</p><Link className="button button-dark" href="/search">Search rooms</Link></div></main>;
 const hotel=HOTELS.find(h=>h.id===booking.hotelId),room=ROOMS.find(r=>r.id===booking.roomId);
 return <main className="container"><div className="confirmation-card"><div className="confirmation-icon"><Check size={32}/></div><span className="eyebrow">DEMO BOOKING SAVED</span><h1 className="serif">Your preview is ready.</h1><p>Your test reservation has been saved to this browser and is visible in the admin preview. <strong>No room has been reserved with a real hotel.</strong></p><div className="reference-box">{booking.reference}</div><div className="confirmation-details"><div className="summary-line"><span>Property</span><strong>{hotel?.name}</strong></div><div className="summary-line"><span>Room</span><strong>{room?.name} × {booking.rooms}</strong></div><div className="summary-line"><span>Check-in</span><strong>{formatDate(booking.checkIn)}</strong></div><div className="summary-line"><span>Check-out</span><strong>{formatDate(booking.checkOut)}</strong></div><div className="summary-line"><span>Guests</span><strong>{booking.guests}</strong></div><div className="summary-line"><span>Status</span><strong>{booking.status} (demo)</strong></div><div className="summary-line total"><span>Illustrative subtotal</span><strong>{money(booking.total)}</strong></div></div><div className="confirmation-actions"><Link href="/account/bookings" className="button button-dark">My demo bookings <ArrowUpRight size={15}/></Link><button className="button button-outline" onClick={()=>window.print()}><Printer size={15}/> Print</button></div><p className="summary-mini" style={{marginTop:25}}>No payment was taken, and no email or SMS was sent.</p></div></main>;
}
