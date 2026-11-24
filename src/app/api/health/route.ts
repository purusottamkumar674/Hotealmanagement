import { demoMode } from "@/lib/platform";
import { configured, rest } from "@/lib/server/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  let reachable = false;
  if (configured())
    try {
      await rest("hotels", "select=id&limit=1");
      reachable = true;
    } catch {}
  return NextResponse.json(
    {
      ok: demoMode || reachable,
      mode: demoMode ? "explicit-demo" : "database",
      databaseConfigured: configured(),
      databaseReachable: reachable,
      onlinePaymentAvailable: false,
      emailAvailable: false,
      googleApiConnected: false,
      note: "Database reachability does not verify approved inventory, policies or production readiness.",
    },
    {
      status: demoMode || reachable ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
