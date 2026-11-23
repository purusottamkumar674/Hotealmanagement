import { NextResponse } from 'next/server';
import { HOTELS, ROOMS } from '@/lib/catalog';
export function GET(){return NextResponse.json({demo:true,source:'illustrative static seed catalog',hotels:HOTELS,rooms:ROOMS},{headers:{'Cache-Control':'public, max-age=120','X-Demo-Data':'true'}})}
