-- Example server-only atomic hold creation. NOT CONNECTED TO THE FRONTEND OR EXECUTED.
-- Review timezone, tax, rate plan, hold expiry, and payment policy before use.
-- Permission intentionally limited to service_role; never expose service role key to a browser.
create or replace function public.create_booking_hold_server(
 p_room_type uuid,
 p_check_in date,
 p_check_out date,
 p_rooms integer,
 p_guests integer,
 p_name text,
 p_email text,
 p_phone text
) returns table(booking_id uuid, reference text, subtotal_minor bigint, hold_expires_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
 v_room public.room_types%rowtype;
 v_date date;
 v_blocked integer;
 v_reserved integer;
 v_rate bigint;
 v_total bigint := 0;
 v_nightly jsonb := '[]'::jsonb;
 v_id uuid;
 v_reference text;
 v_expiry timestamptz;
begin
 if p_check_in < current_date or p_check_out <= p_check_in or p_check_out > p_check_in + 30 then
  raise exception 'Invalid stay dates';
 end if;
 if p_rooms is null or p_rooms < 1 or p_rooms > 5 or p_guests is null or p_guests < 1 then
  raise exception 'Invalid room or guest count';
 end if;
 if length(trim(coalesce(p_name,''))) < 2 or length(trim(coalesce(p_email,''))) < 5 or length(trim(coalesce(p_phone,''))) < 8 then
  raise exception 'Invalid guest contact';
 end if;

 -- Serializes competing holds for the SAME room type (subject to all other mutations using same locking discipline).
 select * into v_room from public.room_types where id=p_room_type and published=true for update;
 if not found then raise exception 'Room type is unavailable'; end if;
 if p_guests > p_rooms*v_room.max_guests then raise exception 'Capacity exceeded'; end if;

 for v_date in select d::date from generate_series(p_check_in::timestamp,(p_check_out-1)::timestamp,interval '1 day') as d loop
  select coalesce(max(blocked_units),0) into v_blocked from public.inventory_blocks where room_type_id=p_room_type and stay_date=v_date;
  select coalesce(sum(bi.quantity),0) into v_reserved from public.booking_items bi
   join public.bookings b on b.id=bi.booking_id
   where bi.room_type_id=p_room_type and b.check_in<=v_date and b.check_out>v_date
   and (b.status in ('confirmed','checked_in') or (b.status='pending' and b.hold_expires_at>now()));
  if v_room.inventory-v_blocked-v_reserved<p_rooms then raise exception 'Room inventory sold out for %',v_date; end if;

  select dr.rate_minor into v_rate from public.daily_rates dr where dr.room_type_id=p_room_type and dr.stay_date=v_date;
  if v_rate is null then
   v_rate := case when extract(isodow from v_date) in (6,7) then round(v_room.base_rate_minor*1.12)::bigint else v_room.base_rate_minor end;
  end if;
  v_total := v_total + v_rate*p_rooms;
  v_nightly := v_nightly || jsonb_build_object('date',v_date,'rate_minor',v_rate,'rooms',p_rooms);
 end loop;

 -- Tax/discount deliberately zero while client rules are unapproved. DO NOT launch without rates/tax policy.
 insert into public.bookings(hotel_id,guest_name,guest_email,guest_phone,check_in,check_out,guest_count,status,payment_status,hold_expires_at,currency,subtotal_minor,tax_minor,discount_minor,total_minor,source)
 values(v_room.hotel_id,trim(p_name),lower(trim(p_email)),trim(p_phone),p_check_in,p_check_out,p_guests,'pending','unpaid',now()+interval '10 minutes',v_room.currency,v_total,0,0,v_total,'website')
 returning id,bookings.reference,bookings.hold_expires_at into v_id,v_reference,v_expiry;
 insert into public.booking_items(booking_id,room_type_id,quantity,nightly_rates_minor,subtotal_minor)
 values(v_id,p_room_type,p_rooms,v_nightly,v_total);
 return query select v_id,v_reference,v_total,v_expiry;
end;
$$;

revoke all on function public.create_booking_hold_server(uuid,date,date,integer,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.create_booking_hold_server(uuid,date,date,integer,integer,text,text,text) to service_role;
-- Required future work: dedicated trusted API with rate limiting / bot checks, payment
-- verification and hold confirmation, idempotency keys, audit logs, timezone policy,
-- refunded/cancelled state reconciliation, and stress testing.
