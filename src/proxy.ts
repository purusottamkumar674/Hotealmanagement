import { NextRequest, NextResponse } from "next/server";

// Early redirect/refresh is supplementary. Layouts, APIs and RLS independently verify access.
export async function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const denied = () =>
    NextResponse.redirect(new URL("/admin-login", request.url));
  if (!url || !key) return denied();
  let token = request.cookies.get("fp-access")?.value;
  let renewed: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  } | null = null;
  const auth = async (access: string) =>
    fetch(`${url}/auth/v1/user`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: { apikey: key, Authorization: `Bearer ${access}` },
    });
  try {
    let user = token ? await auth(token) : null;
    if (!user?.ok) {
      const refresh = request.cookies.get("fp-refresh")?.value;
      if (!refresh) return denied();
      const response = await fetch(
        `${url}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
          headers: { apikey: key, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        },
      );
      if (!response.ok) return denied();
      renewed = await response.json();
      token = renewed!.access_token;
      user = await auth(token);
      if (!user.ok) return denied();
    }
    const staff = await fetch(
      `${url}/rest/v1/staff_assignments?select=id&active=eq.true&limit=1`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
        headers: { apikey: key, Authorization: `Bearer ${token}` },
      },
    );
    if (!staff.ok || !(await staff.json()).length) return denied();
    if (renewed) {
      request.cookies.set("fp-access", renewed.access_token);
      request.cookies.set("fp-refresh", renewed.refresh_token);
    }
    const result = NextResponse.next({ request: { headers: request.headers } });
    result.headers.set("Cache-Control", "private, no-store");
    if (renewed) {
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };
      result.cookies.set("fp-access", renewed.access_token, {
        ...options,
        maxAge: renewed.expires_in,
      });
      result.cookies.set("fp-refresh", renewed.refresh_token, {
        ...options,
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return result;
  } catch {
    return denied();
  }
}
export const config = { matcher: ["/admin/:path*"] };
