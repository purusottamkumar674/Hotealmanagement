import { HOTELS, ROOMS } from "@/lib/catalog";
import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json(
    {
      demo: true,
      source: "illustrative static seed catalog",
      hotels: HOTELS,
      rooms: ROOMS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=120",
        "X-Demo-Data": "true",
      },
    },
  );
}
