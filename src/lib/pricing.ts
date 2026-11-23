import { dateIsWeekend, eachNight, nightsBetween } from './dates';
import type { Room } from './catalog';
export type RateOverrides = Record<string,number>;
export const priceKey = (roomId:string,date:string) => `${roomId}|${date}`;
export function nightlyRate(room: Pick<Room,'id'|'baseRate'>, date:string, overrides:RateOverrides = {}):number {
  const override=overrides[priceKey(room.id,date)];
  if (Number.isFinite(override) && override >= 100) return Math.round(override);
  return dateIsWeekend(date) ? Math.round(room.baseRate * 1.12) : room.baseRate;
}
export type BookingQuote={ nights:number; nightly: {date:string;rate:number}[]; subtotal:number; discount:number; taxes:number; total:number; quantity:number; };
export function buildQuote(room:Pick<Room,'id'|'baseRate'>,start:string,end:string,quantity=1,overrides:RateOverrides={}):BookingQuote {
  const nights=nightsBetween(start,end);
  if(nights<=0 || nights>30 || !Number.isInteger(quantity) || quantity<1 || quantity>10) throw new Error('Choose valid dates and room quantity.');
  const nightly=eachNight(start,end).map(date=>({date,rate:nightlyRate(room,date,overrides)}));
  const subtotal=nightly.reduce((sum,night)=>sum+night.rate*quantity,0);
  return {nights,nightly,subtotal,discount:0,taxes:0,total:subtotal,quantity};
}
