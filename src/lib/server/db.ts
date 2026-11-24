import { canWrite, type Assignment } from "@/lib/platform";
import { cookies, headers } from "next/headers";
import { createHash } from "node:crypto";
import "server-only";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "REQUEST_FAILED",
  ) {
    super(message);
  }
}
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
export function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new ApiError(
      503,
      "Database configuration is required.",
      "SETUP_REQUIRED",
    );
  return { url: url.replace(/\/$/, ""), key };
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function supabase<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
  service = false,
): Promise<T> {
  const { url, key } = config();
  const credential = service
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : token || key;
  if (!credential)
    throw new ApiError(
      503,
      "Server database credentials are required.",
      "SETUP_REQUIRED",
    );
  const response = await fetch(url + path, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: service ? credential : key,
      Authorization: `Bearer ${credential}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Never return database details or authentication tokens to clients.
    const message = String(body.message || "");
    if (message.includes("Management approval required"))
      throw new ApiError(
        403,
        "A property manager must approve content before it can be published. Save edits as an unapproved draft for review.",
        "APPROVAL_REQUIRED",
      );
    if (message.includes("Price changed"))
      throw new ApiError(
        409,
        "The price changed. Refresh the quote and review it before booking.",
        "PRICE_CHANGED",
      );
    if (/sold out|Inventory cannot|Block exceeds/.test(message))
      throw new ApiError(
        409,
        "The requested inventory is no longer available.",
        "UNAVAILABLE",
      );
    if (/Idempotency conflict/.test(message))
      throw new ApiError(
        409,
        "This booking request was already used with different details.",
        "IDEMPOTENCY_CONFLICT",
      );
    if (/Approved booking/.test(message))
      throw new ApiError(
        409,
        "Booking is awaiting approved property settings and policies.",
        "POLICY_REQUIRED",
      );
    if (/Invalid booking status transition/.test(message))
      throw new ApiError(409, "This status change is not allowed.");
    throw new ApiError(
      response.status === 401
        ? 401
        : response.status === 403 || body.code === "42501"
          ? 403
          : 400,
      "The database could not complete this request. Check permissions and saved settings.",
    );
  }
  if (response.status === 204 || response.headers.get("content-length") === "0")
    return undefined as T;
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}
export const rest = <T>(table: string, query = "", token?: string) =>
  supabase<T[]>(`/rest/v1/${table}?${query}`, {}, token);
export const rpc = <T>(
  name: string,
  body: unknown,
  token?: string,
  service = false,
) =>
  supabase<T>(
    `/rest/v1/rpc/${name}`,
    { method: "POST", body: JSON.stringify(body) },
    token,
    service,
  );
export type Session = {
  user: { id: string; email?: string };
  token: string;
  assignments: Assignment[];
};
export async function session(): Promise<Session | null> {
  if (!configured()) return null;
  const token = (await cookies()).get("fp-access")?.value;
  if (!token) return null;
  try {
    const user = await supabase<{ id: string; email?: string }>(
      "/auth/v1/user",
      {},
      token,
    );
    const assignments = await rest<Assignment>(
      "staff_assignments",
      "select=hotel_id,role,active&active=eq.true",
      token,
    );
    return { user, token, assignments };
  } catch {
    return null;
  }
}
export async function requireStaff() {
  const s = await session();
  if (!s) throw new ApiError(401, "Sign in to continue.", "UNAUTHENTICATED");
  if (!s.assignments.length)
    throw new ApiError(
      403,
      "This account has no active staff assignment.",
      "FORBIDDEN",
    );
  return s;
}
export function permit(
  s: Session,
  hotel: string,
  area: Parameters<typeof canWrite>[2],
) {
  if (!canWrite(s.assignments, hotel, area))
    throw new ApiError(
      403,
      "Your role cannot change this property.",
      "FORBIDDEN",
    );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url)
    .origin;
  if (origin && origin !== expected)
    throw new ApiError(
      403,
      "Cross-origin requests are not allowed.",
      "FORBIDDEN",
    );
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new ApiError(
      403,
      "Cross-site requests are not allowed.",
      "FORBIDDEN",
    );
}
export async function limit(area: string, max = 60) {
  const h = await headers();
  // Vercel overwrites x-vercel-forwarded-for. Configure a trusted proxy before using another host.
  const ip =
    h.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "shared-origin";
  const allowed = await rpc<boolean>(
    "consume_api_limit",
    { p_key: hash(`${area}|${ip}`), p_limit: max, p_seconds: 60 },
    undefined,
    true,
  );
  if (!allowed)
    throw new ApiError(
      429,
      "Too many requests. Please try again shortly.",
      "RATE_LIMITED",
    );
}
export async function jsonBody(request: Request) {
  if (Number(request.headers.get("content-length")) > 65536)
    throw new ApiError(413, "Request is too large.");
  const raw = await request.text();
  if (raw.length > 65536) throw new ApiError(413, "Request is too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Send valid JSON.", "VALIDATION_ERROR");
  }
}
