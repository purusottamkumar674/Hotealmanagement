'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChevronRight, Info, SearchX } from 'lucide-react';
import { HOTELS, ROOMS, type Room, PHOTOS } from '@/lib/catalog';
import { availableRooms, getDemoState, observeState, type DemoState } from '@/lib/demo-store';
import { buildQuote } from '@/lib/pricing';
import { dateValidStay, formatDate, nightsBetween, isoToday } from '@/lib/dates';
import { ImageCover, RoomCard } from '@/components/Cards';
import { SearchForm } from '@/components/SearchForm';
function SearchClient(){const p=useSearchParams();const router=useRouter();
 const hotel=p.get('hotel')||'all',checkin=p.get('checkin')||isoToday(1),checkout=p.get('checkout')||isoToday(3),guests=Math.max(1,Math.min(20,Number(p.get('guests')||2))),qty=Math.max(1,Math.min(5,Number(p.get('rooms')||1)));
 const [state,setState]=useState<DemoState|null>(null);
 useEffect(()=>{const refresh=()=>setState(getDemoState());refresh();return observeState(refresh)},[]);
 const valid=dateValidStay(checkin,checkout)&&Number.isInteger(guests)&&Number.isInteger(qty);
 const results=useMemo(()=>!state||!valid?[]:ROOMS.filter(r=>(hotel==='all'||r.hotelId===hotel)&&guests<=r.guests*qty).map(r=>({room:r,available:availableRooms(r,checkin,checkout,state),quote:buildQuote(r,checkin,checkout,qty,state.overrides)})).filter(r=>r.available>=qty),[state,hotel,checkin,checkout,guests,qty,valid]);
 const select=(r:Room)=>router.push('/checkout?'+new URLSearchParams({roomId:r.id,checkin,checkout,guests:String(guests),rooms:String(qty)}));
 const sister=hotel==='flower-inn'?'petal-inn':hotel==='petal-inn'?'flower-inn':'';
 return <main className="content-shell"><div className="container"><div className="demo-page-head"><span className="eyebrow with-line">FIND YOUR STAY</span><h1 className="serif">Explore availability</h1><p>Search room types and compare nightly rates. This interactive booking flow uses sample local browser data and is not connected to a real hotel inventory.</p></div><div className="notice info"><Info size={18}/> Demo mode: searches, availability, nightly rates and reservations are illustrative. Do not use for real guest bookings.</div><div className="search-layout"><aside className="search-sidebar"><h3 className="serif">Refine your stay</h3><SearchForm compact key={[hotel,checkin,checkout,guests,qty].join('|')} initial={{hotel,checkin,checkout,guests,rooms:qty}}/></aside><div><div className="search-results-head"><div><h2>{!valid?'Choose valid dates':`${results.length} available room ${results.length===1?'type':'types'}`}</h2><p>{valid?`${formatDate(checkin)} — ${formatDate(checkout)} · ${nightsBetween(checkin,checkout)} night(s) · ${qty} room(s) · ${guests} guest(s)`:'Please select valid dates in the search form.'}</p></div></div>{results.length>0?<div className="search-results">{results.map(({room,available,quote})=><RoomCard key={room.id} room={room} action="select" onSelect={select} stayInfo={{price:quote.total,available,nights:quote.nights,qty}}/>)}</div>:<div className="empty-state"><SearchX size={35}/><h3>No matching rooms found</h3><p>Try a different hotel, date range or guest count. {sister?'You can also check our sister hotel for your dates.':''}</p>{sister&&<Link className="button button-dark" href={'/search?'+new URLSearchParams({hotel:sister,checkin,checkout,guests:String(guests),rooms:String(qty)})}>Explore {HOTELS.find(h=>h.id===sister)?.name} <ArrowRight size={15}/></Link>}</div>}</div></div></div></main>;
}
export default function SearchPage(){return <Suspense fallback={<div className="container" style={{padding:80}}>Preparing availability search…</div>}><SearchClient/></Suspense>}
