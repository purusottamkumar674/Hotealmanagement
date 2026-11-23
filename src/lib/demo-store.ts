import { HOTELS, ROOMS, type HotelId, type Room } from './catalog';
import { dateValidStay, eachNight, isoToday } from './dates';
import { buildQuote, nightlyRate, priceKey, type RateOverrides } from './pricing';

export type BookingStatus='Pending'|'Confirmed'|'Checked In'|'Checked Out'|'Cancelled'|'No Show';
export type DemoBooking={
  reference:string; hotelId:HotelId; roomId:string; guestName:string; email:string; phone:string;
  checkIn:string; checkOut:string; rooms:number; guests:number; total:number; nightlyRates:number[];
  status:BookingStatus; paymentStatus:'Pay at hotel'|'Paid (sample)'|'Refund pending'; source:'Website'|'Walk-in'|'Phone'|'Sample';
  createdAt:string; notes?:string; isSample?:boolean;
};
export type Activity={id:string;action:string;detail:string;at:string};
export type SeoTask={id:string;hotelId:HotelId;name:string;status:'To do'|'In progress'|'Done'};
export type ReviewTask={id:string;hotelId:HotelId;platform:string;guest:string;rating:number;text:string;status:'Awaiting reply'|'Draft prepared'|'Replied';reply:string;isSample:boolean};
export type DemoState={
  bookings:DemoBooking[]; overrides:RateOverrides; audit:Activity[]; seoTasks:SeoTask[]; reviewTasks:ReviewTask[];
  cms:Record<string,string>; blocks: Record<string,number>; hotelNotes:Record<string,string>; reviewLinks:Record<string,string>;
};
const STORAGE='fp-hotel-demo-v3';
function id() { return Math.random().toString(36).slice(2,10); }
const makeSeed=(): DemoState => {
  const offset=[-5,-3,-1,1,2,4,5,8,10,13];
  const bookings:DemoBooking[]=offset.map((n,i)=>{
    const room=ROOMS[i%ROOMS.length];
    const checkIn=isoToday(n),checkOut=isoToday(n+2);
    const quote=buildQuote(room,checkIn,checkOut,1,{});
    return {reference:'SAMPLE-'+String(i+101),hotelId:room.hotelId,roomId:room.id,guestName:`Sample Guest ${String(i+1).padStart(2,'0')}`,email:`sample${i+1}@example.test`,phone:'Not supplied',checkIn,checkOut,rooms:1,guests:Math.min(room.guests,2),total:quote.total,nightlyRates:quote.nightly.map(v=>v.rate),status:n < -2?'Checked Out':n<0?'Checked In':'Confirmed',paymentStatus:'Pay at hotel',source:'Sample',createdAt:new Date(Date.now()-(i+1)*86400000).toISOString(),isSample:true};
  });
  return {
    bookings,overrides:{},audit:[],
    seoTasks:[
      {id:'s1',hotelId:'flower-inn',name:'Verify official Google Business Profile access',status:'To do'},
      {id:'s2',hotelId:'flower-inn',name:'Confirm name, address and phone across directories',status:'In progress'},
      {id:'s3',hotelId:'petal-inn',name:'Approve target location-specific keywords',status:'To do'},
      {id:'s4',hotelId:'petal-inn',name:'Upload verified hotel photos',status:'To do'},
    ],
    reviewTasks:[
      {id:'r1',hotelId:'flower-inn',platform:'Google (sample)',guest:'Demo Reviewer A',rating:5,text:'Example review placeholder. Replace with genuine platform data.',status:'Awaiting reply',reply:'',isSample:true},
      {id:'r2',hotelId:'petal-inn',platform:'Google (sample)',guest:'Demo Reviewer B',rating:3,text:'Example feedback placeholder for workflow testing.',status:'Awaiting reply',reply:'',isSample:true},
    ],
    cms:{'home.heading':'Where every stay blooms.','home.subheading':'Two distinctive hotels. One seamless way to stay. Discover your kind of comfort at Flower Inn and Petal Inn.'},blocks:{},hotelNotes:{},reviewLinks:{},
  };
};
export function getDemoState():DemoState {
  if(typeof window==='undefined') return makeSeed();
  try {const raw=localStorage.getItem(STORAGE);if(raw){const state=JSON.parse(raw) as DemoState;if(state?.bookings && state?.overrides) return state;}}
  catch{/* seed */}
  const initial=makeSeed();
  try {localStorage.setItem(STORAGE,JSON.stringify(initial));}catch{/* storage disabled */}
  return initial;
}
export function saveDemoState(state:DemoState):void{
  if(typeof window==='undefined') return;
  localStorage.setItem(STORAGE,JSON.stringify(state));
  window.dispatchEvent(new Event('fp-demo-change'));
}
export function mutateState(mutator:(state:DemoState)=>void,action?:string,detail?:string):DemoState{
  const state=structuredClone(getDemoState());mutator(state);
  if(action) state.audit.unshift({id:id(),action,detail:detail||'',at:new Date().toISOString()});
  state.audit=state.audit.slice(0,100);
  saveDemoState(state);return state;
}
export function observeState(callback:()=>void):()=>void{
  if(typeof window==='undefined') return ()=>{};
  window.addEventListener('storage',callback);window.addEventListener('fp-demo-change',callback);
  return ()=>{window.removeEventListener('storage',callback);window.removeEventListener('fp-demo-change',callback);};
}
export function availableRooms(room:Room,start:string,end:string,state:DemoState):number{
  const dates=eachNight(start,end);if(!dates.length) return 0;
  return Math.max(0,Math.min(...dates.map(date=>{
    const occupied=state.bookings.filter(b=>b.roomId===room.id && ['Confirmed','Checked In','Pending'].includes(b.status) && b.checkIn<=date && b.checkOut>date).reduce((sum,b)=>sum+b.rooms,0);
    return room.inventory - occupied - (state.blocks[priceKey(room.id,date)]||0);
  })));
}
export function submitDemoBooking(input:Omit<DemoBooking,'reference'|'createdAt'|'status'|'paymentStatus'|'source'|'total'|'nightlyRates'>):DemoBooking{
  const room=ROOMS.find(r=>r.id===input.roomId && r.hotelId===input.hotelId);
  if(!room || !dateValidStay(input.checkIn,input.checkOut)) throw new Error('Invalid hotel, room or dates.');
  if(!Number.isInteger(input.rooms) || input.rooms<1 || input.rooms>5 || !Number.isInteger(input.guests) || input.guests<1 || input.guests>room.guests*input.rooms) throw new Error('Please check the room and guest counts.');
  if(!input.guestName.trim() || input.guestName.trim().length<2 || !/^\S+@\S+\.\S+$/.test(input.email) || !/^\+?[\d\s-]{8,18}$/.test(input.phone)) throw new Error('Enter valid guest contact information.');
  const state=getDemoState();
  if(availableRooms(room,input.checkIn,input.checkOut,state)<input.rooms) throw new Error('Sorry, this room is no longer available for your selected dates.');
  const quote=buildQuote(room,input.checkIn,input.checkOut,input.rooms,state.overrides);
  const reference=`DEMO-${Date.now().toString(36).toUpperCase()}-${id().slice(0,4).toUpperCase()}`;
  const booking:DemoBooking={...input,reference,total:quote.total,nightlyRates:quote.nightly.map(n=>n.rate),createdAt:new Date().toISOString(),status:'Confirmed',paymentStatus:'Pay at hotel',source:'Website',isSample:false};
  mutateState(s=>{s.bookings.unshift(booking);},'Booking created',`${reference} · ${HOTELS.find(h=>h.id===room.hotelId)?.name}`);
  return booking;
}
export function setRates(roomId:string,from:string,to:string,rate:number):number{
  const dates=eachNight(from,to);
  if(!ROOMS.some(r=>r.id===roomId) || dates.length<1 || dates.length>180 || !Number.isInteger(rate) || rate<100 || rate>500000) throw new Error('Choose a valid room, date range (up to 180 nights) and price.');
  mutateState(s=>{dates.forEach(date=>{s.overrides[priceKey(roomId,date)]=rate;});},'Rate override saved',`${roomId} · ${dates.length} nights · ₹${rate}`);
  return dates.length;
}
export function resetDemo():void{if(typeof window!=='undefined'){localStorage.removeItem(STORAGE);window.dispatchEvent(new Event('fp-demo-change'));}}
export { buildQuote, nightlyRate };
