import {
  bookingSchema,
  contentSchemas,
  rateSchema,
  resourceArea,
  resourceTables,
  staySchema,
  uuid,
  validateImage,
  type Resource,
} from "@/lib/platform";
import {
  catalog,
  type MediaRow,
  type RoomRow,
  type Row,
} from "@/lib/server/catalog";
import {
  ApiError,
  config,
  hash,
  jsonBody,
  limit,
  permit,
  requireStaff,
  rest,
  rpc,
  sameOrigin,
  supabase,
} from "@/lib/server/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {revalidatePath} from 'next/cache';
import { createHmac, randomBytes } from "node:crypto";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const ok = (data: unknown, status = 200) =>
  NextResponse.json(
    { data },
    { status, headers: { "Cache-Control": "no-store" } },
  );
const eq = (value: string) => encodeURIComponent(value);
type Quote = {
  room_id: string;
  hotel_id: string;
  currency: string;
  nights: number;
  nightly: { date: string; rate_minor: number }[];
  subtotal_minor: number;
  tax_minor: number;
  discount_minor: number;
  total_minor: number;
  available: number;
  bookable: boolean;
};
async function quote(
  room: string,
  stay: { checkin: string; checkout: string; rooms: number; guests: number },
) {
  return rpc<Quote>(
    "quote_stay_server",
    {
      p_room: room,
      p_checkin: stay.checkin,
      p_checkout: stay.checkout,
      p_rooms: stay.rooms,
      p_guests: stay.guests,
    },
    undefined,
    true,
  );
}
async function handle(
  request: Request,
  context: Context,
): Promise<NextResponse> {
  const { path } = await context.params;
  const method = request.method;
  const url = new URL(request.url);
  const [root, resource, id, action] = path;
  if (method !== "GET") sameOrigin(request);
  if (root === "branding" && resource === "favicon" && method === "GET") {
    const data = await catalog();
    const logo = data.media.find(
      (m) =>
        m.id === data.hotelRows[0]?.logo_id &&
        m.category === "logo" &&
        m.active,
    );
    if (!logo) return new NextResponse(null, { status: 204 });
    if (
      !logo.url.startsWith(
        `${config().url}/storage/v1/object/public/hotel-media/`,
      )
    )
      throw new ApiError(400, "Invalid brand asset.");
    const response = await fetch(logo.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return new NextResponse(null, { status: 204 });
    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
  if (root === "auth") {
    const jar = await cookies();
    const setSession = (result: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }) => {
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };
      jar.set("fp-access", result.access_token, {
        ...options,
        maxAge: result.expires_in,
      });
      jar.set("fp-refresh", result.refresh_token, {
        ...options,
        maxAge: 60 * 60 * 24 * 7,
      });
    };
    if (resource === "logout" && method === "POST") {
      const token = jar.get("fp-access")?.value;
      if (token)
        await supabase("/auth/v1/logout", { method: "POST" }, token).catch(
          () => {},
        );
      jar.delete("fp-access");
      jar.delete("fp-refresh");
      return ok({ signedOut: true });
    }
    if (resource === "session" && method === "GET") {
      const s = await requireStaff();
      return ok({ user: s.user, assignments: s.assignments });
    }
    if (resource === "login" && method === "POST") {
      await limit("login", 10);
      const body = z
        .object({ email: z.email(), password: z.string().min(1).max(200) })
        .strict()
        .parse(await jsonBody(request));
      let result;
      try {
        result = await supabase<{
          access_token: string;
          refresh_token: string;
          expires_in: number;
        }>("/auth/v1/token?grant_type=password", {
          method: "POST",
          body: JSON.stringify(body),
        });
      } catch {
        throw new ApiError(
          401,
          "Sign-in failed. Check your email and password.",
        );
      }
      setSession(result);
      return ok({ signedIn: true });
    }
    if (resource === "refresh" && method === "POST") {
      const refresh = jar.get("fp-refresh")?.value;
      if (!refresh) throw new ApiError(401, "Sign in again.");
      const result = await supabase<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refresh }),
      });
      setSession(result);
      return ok({ refreshed: true });
    }
  }
  if (root === "hotels" && method === "GET") {
    if (!resource) return ok(await rest("hotels", "select=*&order=name"));
    const key = uuid.safeParse(resource).success ? "id" : "slug";
    const slug = z.enum(["flower-inn", "petal-inn"]).safeParse(resource);
    if (key === "slug" && !slug.success)
      throw new ApiError(404, "Hotel not found.");
    const rows = await rest<Row>(
      "hotels",
      `select=*&${key}=eq.${eq(resource)}`,
    );
    const hotel = rows[0];
    if (!hotel) throw new ApiError(404, "Hotel not found.");
    if (!id) return ok(hotel);
    if (["nearby", "amenities"].includes(id))
      return ok(
        await rest(
          id === "nearby" ? "nearby_places" : "amenities",
          `select=*&hotel_id=eq.${hotel.id}&order=sort_order`,
        ),
      );
  }
  if (root === "accommodations" && method === "GET") {
    const data = await catalog();
    if (data.error) throw new ApiError(503, data.error);
    return ok(data.rooms);
  }
  if (root === "availability" && resource === "search" && method === "POST") {
    await limit("search", 90);
    const stay = staySchema.parse(await jsonBody(request));
    const data = await catalog();
    if (data.error) throw new ApiError(503, data.error);
    const hotelIds = data.hotelRows
      .filter(
        (h) =>
          stay.hotel === "all" || h.id === stay.hotel || h.slug === stay.hotel,
      )
      .map((h) => h.id);
    const rooms = data.roomRows
      .filter(
        (r) =>
          hotelIds.includes(r.hotel_id) &&
          r.max_guests * stay.rooms >= stay.guests &&
          (!stay.roomId || r.id === stay.roomId),
      )
      .slice(0, 100);
    const results = await Promise.all(
      rooms.map(async (r) => ({
        room: data.rooms.find((x) => x.id === r.id),
        quote: await quote(r.id, stay),
      })),
    );
    return ok(results.filter((r) => r.quote.available >= stay.rooms));
  }
  if (root === "bookings" && resource === "quote" && method === "POST") {
    await limit("quote", 90);
    const stay = staySchema.parse(await jsonBody(request));
    if (!stay.roomId) throw new ApiError(400, "Select an accommodation.");
    return ok(await quote(stay.roomId, stay));
  }
  if (root === "bookings" && !resource && method === "POST") {
    await limit("booking", 12);
    const b = bookingSchema.parse(await jsonBody(request));
    const secret = process.env.BOOKING_ACCESS_SECRET;
    if (!secret || secret.length < 32)
      throw new ApiError(
        503,
        "Booking security settings are required.",
        "SETUP_REQUIRED",
      );
    // Stable on retries; the secret is server-only. An idempotency UUID alone cannot retrieve a booking.
    const access = createHmac("sha256", secret)
      .update(b.idempotencyKey)
      .digest("hex");
    const result = await rpc<{
      reference: string;
      total_minor: number;
      status: string;
    }>(
      "reserve_stay_server",
      {
        p_room: b.roomId,
        p_checkin: b.checkin,
        p_checkout: b.checkout,
        p_rooms: b.rooms,
        p_guests: b.guests,
        p_name: b.name,
        p_email: b.email,
        p_phone: b.phone,
        p_expected: b.expectedTotalMinor,
        p_key: b.idempotencyKey,
        p_access_hash: hash(access),
        p_request_hash: hash(JSON.stringify(b)),
      },
      undefined,
      true,
    );
    (await cookies()).set(`fp-booking-${result.reference}`, access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return ok(result, 201);
  }
  if (root === "bookings" && resource && ["GET", "PATCH"].includes(method)) {
    await limit("booking-access", 30);
    if (!/^FI-[A-F0-9]{18}$/.test(resource))
      throw new ApiError(404, "Booking not found.");
    const supplied =
      request.headers.get("x-booking-access") ||
      (await cookies()).get(`fp-booking-${resource}`)?.value;
    if (!supplied || supplied.length !== 64)
      throw new ApiError(
        404,
        "Booking not found. Use the device that placed it, or your private access code.",
      );
    const rows = await supabase<Row[]>(
      `/rest/v1/bookings?select=id,reference,hotel_id,guest_name,check_in,check_out,guest_count,status,payment_status,currency,total_minor,subtotal_minor,tax_minor,cancellation_requested_at,hotels(name),booking_items(room_type_id,quantity,nightly_rates_minor,room_types(name))&reference=eq.${resource}&access_hash=eq.${hash(supplied)}`,
      {},
      undefined,
      true,
    );
    if (!rows[0]) throw new ApiError(404, "Booking not found.");
    if (method === "PATCH") {
      z.object({ requestCancellation: z.literal(true) })
        .strict()
        .parse(await jsonBody(request));
      await rpc(
        "request_cancellation_server",
        { p_reference: resource, p_access_hash: hash(supplied) },
        undefined,
        true,
      );
      return ok({ requested: true });
    }
    return ok({ ...rows[0], accessCode: supplied });
  }
  if (root === "admin") {
    const s = await requireStaff();
    const globalAccess = s.assignments.some(
      (a) =>
        a.active &&
        a.hotel_id === null &&
        ["super_admin", "group_admin"].includes(a.role),
    );
    const scope = (column = "hotel_id") =>
      globalAccess
        ? ""
        : `&${column}=in.(${s.assignments
            .map((a) => a.hotel_id)
            .filter(Boolean)
            .join(",")})`;
    const hotelParam = url.searchParams.get("hotel_id");
    if (hotelParam) uuid.parse(hotelParam);
    if(resource==='gallery'&&id==='cleanup'){
      if(method==='GET')return ok(await rest('media_deletion_jobs',`select=*&status=eq.pending${hotelParam?`&hotel_id=eq.${hotelParam}`:''}`,s.token));
      if(method==='POST'&&action){uuid.parse(action);const job=(await rest<Row>('media_deletion_jobs',`select=*&id=eq.${action}&status=eq.pending`,s.token))[0];if(!job)throw new ApiError(404,'Cleanup job not found.');permit(s,job.hotel_id,'content');const refs=await rest('media_assets',`select=id&storage_path=eq.${eq(String(job.storage_path))}`,s.token);if(refs.length)throw new ApiError(409,'The stored file is still referenced.');await supabase('/storage/v1/object/hotel-media',{method:'DELETE',body:JSON.stringify({prefixes:[job.storage_path]})},s.token);await rpc('complete_media_cleanup',{p_job:job.id},s.token);return ok({storageDeleted:true});}
    }
    if(resource==='gallery'&&id&&action==='usage'){
      uuid.parse(id);if(method==='GET')return ok(await rpc('media_asset_usage',{p_image:id},s.token));
      if(method==='PATCH'){const b=z.object({targetId:uuid,kind:z.enum(['hero','logo'])}).strict().parse(await jsonBody(request));await rpc('detach_media_usage',{p_image:id,p_target:b.targetId,p_kind:b.kind},s.token);return ok({unassigned:true});}
    }
    if(resource==='gallery'&&id&&method==='DELETE'){
      uuid.parse(id);const raw=await request.text();if(raw.length>1000)throw new ApiError(413,'Request is too large.');let value;try{value=raw?JSON.parse(raw):{};}catch{throw new ApiError(400,'Send valid JSON.');}const b=z.object({unassign:z.boolean().default(false)}).strict().parse(value);
      const result=await rpc<{removed:boolean;usage?:unknown[];storage_path?:string;job_id?:string}>('remove_media_asset',{p_image:id,p_unassign:b.unassign},s.token);
      if(!result.removed)return ok(result);
      let storageDeleted=false;try{await supabase('/storage/v1/object/hotel-media',{method:'DELETE',body:JSON.stringify({prefixes:[result.storage_path]})},s.token);await rpc('complete_media_cleanup',{p_job:result.job_id},s.token);storageDeleted=true;}catch{/* Persisted job allows an authorized retry without claiming complete deletion. */}
      return ok({removed:true,storageDeleted,jobId:result.job_id,message:storageDeleted?'Image and stored file deleted.':'Image removed from the website. Storage cleanup is pending; retry it from Photography & logos.'});
    }
    if (resource === "session" && method === "GET")
      return ok({ user: s.user, assignments: s.assignments });
    if (resource === "staff" && method === "POST") {
      const b = z
        .object({
          auth_user_id: uuid,
          hotel_id: uuid.nullable(),
          role: z.enum([
            "super_admin",
            "group_admin",
            "property_manager",
            "front_desk",
            "finance",
            "marketing",
          ]),
          active: z.boolean(),
        })
        .strict()
        .parse(await jsonBody(request));
      permit(s, "", "settings");
      return ok({
        id: await rpc(
          "provision_staff",
          {
            p_user: b.auth_user_id,
            p_hotel: b.hotel_id,
            p_role: b.role,
            p_active: b.active,
          },
          s.token,
        ),
      });
    }
    if (
      resource === "pricing" &&
      (method === "PATCH" || (id === "bulk-update" && method === "POST"))
    ) {
      const b = rateSchema.parse(await jsonBody(request));
      permit(s, b.hotel_id, "pricing");
      return ok({
        updated: await rpc(
          "set_daily_rates",
          {
            p_hotel: b.hotel_id,
            p_room: b.room_type_id,
            p_from: b.from,
            p_to: b.to,
            p_rate: b.rate_minor,
            p_weekdays: b.weekdays,
            p_reason: b.reason,
          },
          s.token,
        ),
      });
    }
    if (resource === "pricing" && method === "GET") {
      if (id === "history")
        return ok(
          await rest(
            "pricing_history",
            `select=*&order=created_at.desc&limit=250${hotelParam ? `&hotel_id=eq.${hotelParam}` : ""}`,
            s.token,
          ),
        );
      const room = uuid.parse(url.searchParams.get("room_type_id"));
      const from = z.iso.date().parse(url.searchParams.get("from")),
        to = z.iso.date().parse(url.searchParams.get("to"));
      return ok(
        await rpc(
          "preview_rates_staff",
          { p_room: room, p_from: from, p_to: to },
          s.token,
        ),
      );
    }
    if (
      [
        "bookings",
        "guests",
        "reports",
        "audit-logs",
        "staff",
        "inventory",
        "payments",
      ].includes(resource)
    ) {
      const table =
        resource === "staff"
          ? "staff_assignments"
          : resource === "audit-logs"
            ? "audit_logs"
            : resource === "inventory"
              ? "inventory_blocks"
              : resource === "payments"
                ? "payments"
                : "bookings";
      if (method === "GET")
        return ok(
          await rest(
            table,
            `select=${resource === "guests" ? "id,hotel_id,guest_name,guest_email,guest_phone,created_at" : "*"}&limit=500${!["staff", "inventory", "payments"].includes(resource) ? "&order=created_at.desc" : ""}${hotelParam && !["inventory", "payments"].includes(resource) ? `&hotel_id=eq.${hotelParam}` : ""}`,
            s.token,
          ),
        );
      if (resource === "bookings" && method === "PATCH") {
        const b = z
          .object({
            id: uuid,
            status: z.enum([
              "checked_in",
              "checked_out",
              "cancelled",
              "no_show",
              "expired",
            ]),
          })
          .strict()
          .parse(await jsonBody(request));
        await rpc(
          "change_booking_status",
          { p_booking: b.id, p_status: b.status },
          s.token,
        );
        return ok({ updated: true });
      }
      if (resource === "inventory" && method === "POST") {
        const b = z
          .object({
            hotel_id: uuid,
            room_type_id: uuid,
            stay_date: z.iso.date(),
            blocked_units: z.number().int().min(0).max(1000),
            reason: z.string().trim().min(1).max(1000),
          })
          .strict()
          .parse(await jsonBody(request));
        permit(s, b.hotel_id, "operations");
        const r = (
          await rest<RoomRow>(
            "room_types",
            `select=*&id=eq.${b.room_type_id}&hotel_id=eq.${b.hotel_id}`,
            s.token,
          )
        )[0];
        if (!r) throw new ApiError(404, "Accommodation not found.");
        return ok(
          await supabase(
            "/rest/v1/inventory_blocks?on_conflict=room_type_id,stay_date",
            {
              method: "POST",
              headers: {
                Prefer: "resolution=merge-duplicates,return=representation",
              },
              body: JSON.stringify({
                room_type_id: b.room_type_id,
                stay_date: b.stay_date,
                blocked_units: b.blocked_units,
                reason: b.reason,
                updated_by: s.user.id,
              }),
            },
            s.token,
          ),
        );
      }
    }
    if (resource === "uploads" && method === "POST") {
      if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
        throw new ApiError(413, "Upload is too large.");
      const form = await request.formData();
      const file = form.get("file");
      if(form.get('rightsConfirmed')!=='true')throw new ApiError(400,'Confirm that you have permission to publish this image.');
      if (!(file instanceof File)) throw new ApiError(400, "Select an image.");
      const metadata = contentSchemas.gallery.parse(
        JSON.parse(String(form.get("metadata") || "{}")),
      );
      permit(s, metadata.hotel_id, "content");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let extension;
      try {
        extension = validateImage(bytes, file.type);
      } catch (err) {
        throw new ApiError(400, (err as Error).message);
      }
      const replaceId = form.get("id") ? uuid.parse(form.get("id")) : undefined;
      const old = replaceId
        ? (
            await rest<MediaRow>(
              "media_assets",
              `id=eq.${replaceId}&hotel_id=eq.${metadata.hotel_id}&select=*`,
              s.token,
            )
          )[0]
        : undefined;
      if (replaceId && !old) throw new ApiError(404, "Image not found.");
      const path = `${metadata.hotel_id}/${randomBytes(16).toString("hex")}.${extension}`;
      await supabase(
        `/storage/v1/object/hotel-media/${path}`,
        { method: "POST", headers: { "Content-Type": file.type }, body: bytes },
        s.token,
      );
      let result;
      try {
        result = await supabase(
          `/rest/v1/media_assets${old ? `?id=eq.${old.id}&hotel_id=eq.${metadata.hotel_id}` : ""}`,
          {
            method: old ? "PATCH" : "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({
              ...metadata,
              storage_path: path,
              url: `${config().url}/storage/v1/object/public/hotel-media/${path}`,
            }),
          },
          s.token,
        );
        if(Array.isArray(result)&&!result.length)throw new ApiError(409,'The image changed or was removed. Reload before replacing it.');
      } catch (e) {
        await supabase(
          "/storage/v1/object/hotel-media",
          { method: "DELETE", body: JSON.stringify({ prefixes: [path] }) },
          s.token,
        ).catch(() => {});
        throw e;
      }
      if (old)
        await supabase(
          "/storage/v1/object/hotel-media",
          {
            method: "DELETE",
            body: JSON.stringify({ prefixes: [old.storage_path] }),
          },
          s.token,
        ).catch(() => {});
      return ok(result, 201);
    }
    if (Object.hasOwn(resourceTables, resource)) {
      const name = resource as Resource,
        table = resourceTables[name];
      if (method === "GET")
        return ok(
          await rest(
            table,
            `select=*&limit=500${scope(name === "hotels" ? "id" : "hotel_id")}${hotelParam ? `&${name === "hotels" ? "id" : "hotel_id"}=eq.${hotelParam}` : ""}`,
            s.token,
          ),
        );
      if (id) uuid.parse(id);
      if (method === "DELETE" && id) {
        const rows = await rest<Row>(table, `id=eq.${id}&select=*`, s.token);
        const row = rows[0];
        if (!row) throw new ApiError(404, "Record not found.");
        permit(
          s,
          name === "hotels" ? row.id : row.hotel_id,
          resourceArea(name),
        );
        if (["hotels", "accommodations"].includes(name))
          throw new ApiError(
            400,
            "Archive the property or unpublish the accommodation to preserve booking history.",
          );
        await supabase(
          `/rest/v1/${table}?id=eq.${id}`,
          { method: "DELETE" },
          s.token,
        );
        if (name === "gallery")
          await supabase(
            "/storage/v1/object/hotel-media",
            {
              method: "DELETE",
              body: JSON.stringify({ prefixes: [String(row.storage_path)] }),
            },
            s.token,
          ).catch(() => {});
        return ok({ deleted: true });
      }
      if (["POST", "PATCH"].includes(method)) {
        if (name === "gallery" && method === "POST")
          throw new ApiError(400, "Use the secure image upload endpoint.");
        const b = contentSchemas[name].parse(await jsonBody(request));
        const hotel =
          name === "hotels"
            ? id || randomBytes(16).toString("hex")
            : "hotel_id" in b
              ? b.hotel_id
              : "";
        permit(s, hotel, resourceArea(name));
        if (method === "PATCH" && !id)
          throw new ApiError(400, "Record ID is required.");
        if (id) {
          const original = (
            await rest<Row>(table, `id=eq.${id}&select=*`, s.token)
          )[0];
          if (!original) throw new ApiError(404, "Record not found.");
          if (name !== "hotels" && original.hotel_id !== hotel)
            throw new ApiError(403, "Property association cannot change.");
        }
        const result = await supabase<unknown[]>(
          `/rest/v1/${table}${id ? `?id=eq.${id}` : ""}`,
          {
            method: id ? "PATCH" : "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(b),
          },
          s.token,
        );
        if (!result?.length) throw new ApiError(403, "No record was changed.");
        return ok(result, id ? 200 : 201);
      }
    }
  }
  throw new ApiError(404, "Endpoint not found.", "NOT_FOUND");
}
async function route(request: Request, context: Context) {
  try {
    const response=await handle(request, context);
    if(request.method!=='GET'&&new URL(request.url).pathname.startsWith('/api/admin/')&&response.ok)revalidatePath('/','layout');
    return response;
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: e.issues
              .map((i) => `${i.path.join(".") || "Input"}: ${i.message}`)
              .join("; "),
          },
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    if (e instanceof ApiError)
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status, headers: { "Cache-Control": "no-store" } },
      );
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The request could not be completed. Please try again.",
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { route as DELETE, route as GET, route as PATCH, route as POST };
