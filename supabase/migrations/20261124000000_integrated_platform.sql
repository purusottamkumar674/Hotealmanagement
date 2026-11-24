-- Additive upgrade of the existing starter. Never seeds live rooms, prices or legal content.
begin;
alter table public.hotels
 add column state text, add column postal_code text,
 add column latitude numeric check(latitude between -90 and 90),
 add column longitude numeric check(longitude between -180 and 180),
 add column google_maps_url text, add column google_place_id text,
 add column logo_id uuid, add column booking_enabled boolean not null default false,
 add column pay_at_property boolean not null default false,
 add column tax_approved boolean not null default false,
 add column tax_basis_points integer not null default 0 check(tax_basis_points between 0 and 10000),
 add column seo_title text, add column seo_description text,
 add column review_url text, add column local_keywords text not null default '',
 add constraint paired_coordinates check((latitude is null)=(longitude is null));
alter table public.room_types
 add column accommodation_category text not null default 'room' check(accommodation_category in ('room','apartment')),
 add column bhk_count integer check(bhk_count between 1 and 3),
 add column bedrooms integer not null default 1 check(bedrooms between 0 and 20),
 add column bathrooms integer not null default 1 check(bathrooms between 0 and 20),
 add column beds integer not null default 1 check(beds between 0 and 30),
 add column living_room boolean not null default false,
 add column kitchen_available boolean not null default false,
 add column pricing_change_reason text,
 add constraint bhk_category check((accommodation_category='room' and bhk_count is null) or (accommodation_category='apartment' and bhk_count is not null and bedrooms=bhk_count)),
 add constraint room_hotel_identity unique(id,hotel_id);
alter table public.bookings add column access_hash text, add column idempotency_key uuid unique,
 add column request_hash text, add column cancellation_requested_at timestamptz,
 add column policy_snapshot jsonb not null default '{}'::jsonb;

create table public.nearby_places (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id),
 name text not null, category text not null check(category in ('railway','airport','hospital','shopping','restaurant','attraction','bus','business','landmark')),
 description text, distance_km numeric check(distance_km>=0), travel_time_minutes integer check(travel_time_minutes>=0),
 travel_mode text not null default 'driving' check(travel_mode in ('walking','driving','transit','bicycling')),
 google_maps_url text, source_note text not null check(length(trim(source_note))>0),
 sort_order integer not null default 0 check(sort_order>=0), active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.amenities (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id), room_type_id uuid,
 name text not null, icon text not null default 'BedDouble', description text, category text not null,
 sort_order integer not null default 0 check(sort_order>=0), active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(room_type_id,hotel_id) references public.room_types(id,hotel_id)
);
create table public.faqs (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id), question text not null, answer text not null,
 category text not null, sort_order integer not null default 0 check(sort_order>=0), active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.site_content (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id),
 slug text not null check(slug in ('about','terms-and-conditions','privacy-policy','cancellation-policy','booking-policy')),
 title text not null, body text not null, approved boolean not null default false, active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(hotel_id,slug)
);
create table public.media_assets (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id), room_type_id uuid,
 storage_path text unique not null, url text not null, alt_text text not null check(length(trim(alt_text))>0),
 category text not null check(category in ('exterior','interior','bedroom','living-room','bathroom','kitchen','amenities','nearby','logo','hero')),
 featured boolean not null default false, active boolean not null default false,
 sort_order integer not null default 0 check(sort_order>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,hotel_id), foreign key(room_type_id,hotel_id) references public.room_types(id,hotel_id)
);
alter table public.hotels add constraint hotel_logo_same_property foreign key(logo_id,id) references public.media_assets(id,hotel_id);
create table public.hero_slides (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id),
 image_id uuid not null, mobile_image_id uuid, heading text not null, subtitle text not null default '', cta_text text not null,
 cta_link text not null check(cta_link ~ '^/[^/\\]' or cta_link='/'),
 sort_order integer not null default 0 check(sort_order>=0), active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(image_id,hotel_id) references public.media_assets(id,hotel_id),
 foreign key(mobile_image_id,hotel_id) references public.media_assets(id,hotel_id)
);
create table public.pricing_rules (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id), room_type_id uuid not null,
 name text not null, kind text not null check(kind in ('season','event','weekend')), start_date date not null, end_date date not null,
 weekdays integer[] not null default '{0,1,2,3,4,5,6}' check(weekdays <@ array[0,1,2,3,4,5,6] and cardinality(weekdays)>0),
 check(kind<>'weekend' or weekdays <@ array[0,6]),
 rate_minor bigint not null check(rate_minor between 0 and 100000000), priority integer not null default 0,
 approved boolean not null default false, active boolean not null default false, reason text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_date>=start_date), foreign key(room_type_id,hotel_id) references public.room_types(id,hotel_id)
);
create table public.pricing_history (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id), room_type_id uuid not null,
 stay_date date not null, old_rate_minor bigint not null, new_rate_minor bigint not null,
 changed_by uuid not null references auth.users(id), reason text not null, created_at timestamptz not null default now(),
 foreign key(room_type_id,hotel_id) references public.room_types(id,hotel_id)
);
create index on public.pricing_rules(room_type_id,start_date,end_date) where active and approved;
create index on public.pricing_history(hotel_id,created_at desc);
create table public.seo_observations (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id),
 keyword text not null, observed_on date not null, search_location text not null,
 metric_type text not null check(metric_type in ('maps','organic')),
 observed_position integer check(observed_position between 1 and 1000), source_note text not null, evidence_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.booking_items(room_type_id);

-- No new property records are seeded: client must create the two approved properties.
-- Group authority requires a NULL property. Property roles never cross hotel boundaries.
create or replace function public.can_manage_hotel(p_hotel uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.staff_assignments where auth_user_id=auth.uid() and active and
 ((hotel_id is null and role in ('super_admin','group_admin')) or hotel_id=p_hotel));
$$;
create function public.hotel_permission(p_hotel uuid,p_area text) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.staff_assignments where auth_user_id=auth.uid() and active and
 ((hotel_id is null and role in ('super_admin','group_admin')) or
 (hotel_id=p_hotel and (role='property_manager' or (p_area='content' and role='marketing') or
 (p_area='pricing' and role='finance') or (p_area='operations' and role='front_desk')))));
$$;
revoke all on function public.hotel_permission(uuid,text) from public;
grant execute on function public.hotel_permission(uuid,text) to authenticated;

-- Replace broad starter policies, including direct booking/status mutations.
drop policy hotels_staff_update on public.hotels;
drop policy rooms_staff_all on public.room_types;
drop policy rates_staff_all on public.daily_rates;
drop policy blocks_staff_all on public.inventory_blocks;
drop policy booking_staff_update on public.bookings;
drop policy booking_staff_or_owner_read on public.bookings;
drop policy booking_items_authorized_read on public.booking_items;
drop policy payments_authorized_read on public.payments;
drop policy review_staff_all on public.reviews_worklist;
drop policy seo_staff_all on public.seo_tasks;
create policy hotels_write on public.hotels for all to authenticated using(public.hotel_permission(id,'settings')) with check(public.hotel_permission(id,'settings'));
create policy rooms_staff_read on public.room_types for select to authenticated using(public.can_manage_hotel(hotel_id));
create policy rooms_write on public.room_types for all to authenticated using(public.hotel_permission(hotel_id,'settings')) with check(public.hotel_permission(hotel_id,'settings'));
create policy blocks_read on public.inventory_blocks for select to authenticated using(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)));
create policy blocks_write on public.inventory_blocks for all to authenticated using(exists(select 1 from public.room_types r where r.id=room_type_id and public.hotel_permission(r.hotel_id,'operations'))) with check(exists(select 1 from public.room_types r where r.id=room_type_id and public.hotel_permission(r.hotel_id,'operations')));
create policy rates_staff_read on public.daily_rates for select to authenticated using(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)));
create policy bookings_read on public.bookings for select to authenticated using(guest_user_id=auth.uid() or public.hotel_permission(hotel_id,'operations') or public.hotel_permission(hotel_id,'pricing'));
create policy items_read on public.booking_items for select to authenticated using(exists(select 1 from public.bookings b where b.id=booking_id));
create policy payments_read on public.payments for select to authenticated using(exists(select 1 from public.bookings b where b.id=booking_id));
create policy reviews_read on public.reviews_worklist for select to authenticated using(public.can_manage_hotel(hotel_id));
create policy reviews_write on public.reviews_worklist for all to authenticated using(public.hotel_permission(hotel_id,'content')) with check(public.hotel_permission(hotel_id,'content'));
create policy seo_read on public.seo_tasks for select to authenticated using(public.can_manage_hotel(hotel_id));
create policy seo_write on public.seo_tasks for all to authenticated using(public.hotel_permission(hotel_id,'content')) with check(public.hotel_permission(hotel_id,'content'));
create policy staff_group_read on public.staff_assignments for select to authenticated using(public.hotel_permission(null,'settings'));
create policy audit_group_read on public.audit_logs for select to authenticated using(public.hotel_permission(null,'settings'));

create function public.provision_staff(p_user uuid,p_hotel uuid,p_role public.staff_role,p_active boolean) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare sid uuid; begin
 if not public.hotel_permission(null,'settings') then raise insufficient_privilege using message='Group administrator required'; end if;
 if p_user=auth.uid() then raise exception 'Self assignment changes are not allowed'; end if;
 if (p_role in ('super_admin','group_admin'))<>(p_hotel is null) then raise exception 'Choose a property for property roles and no property for group roles'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text||coalesce(p_hotel::text,'group')||p_role::text,0));
 select id into sid from public.staff_assignments where auth_user_id=p_user and hotel_id is not distinct from p_hotel and role=p_role limit 1;
 if sid is null then insert into public.staff_assignments(auth_user_id,hotel_id,role,active) values(p_user,p_hotel,p_role,p_active) returning id into sid;
 else update public.staff_assignments set active=p_active where id=sid; end if;
 insert into public.audit_logs(hotel_id,actor_id,action,entity_type,entity_id,details) values(p_hotel,auth.uid(),'staff_assignment','staff_assignments',sid,jsonb_build_object('user_id',p_user,'role',p_role,'active',p_active));
 return sid;
end $$;
revoke all on function public.provision_staff(uuid,uuid,public.staff_role,boolean) from public;
grant execute on function public.provision_staff(uuid,uuid,public.staff_role,boolean) to authenticated;

do $$ declare t text; area text; begin
 foreach t in array array['nearby_places','amenities','faqs','site_content','media_assets','hero_slides','pricing_rules','pricing_history','seo_observations'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create index on public.%I(hotel_id)',t);
  execute format('create policy staff_read on public.%I for select to authenticated using(public.can_manage_hotel(hotel_id))',t);
  if t<>'pricing_history' then
   area:=case when t='pricing_rules' then 'pricing' else 'content' end;
   execute format('create policy staff_write on public.%I for all to authenticated using(public.hotel_permission(hotel_id,%L)) with check(public.hotel_permission(hotel_id,%L))',t,area,area);
  end if;
  if t not in ('pricing_history','pricing_rules','seo_observations') then
   execute format('create policy published_read on public.%I for select to anon,authenticated using(active %s and exists(select 1 from public.hotels h where h.id=hotel_id and h.status=''published''))',t,case when t='site_content' then 'and approved' else '' end);
  end if;
 end loop;
end $$;

create function public.touch_updated_at() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin new.updated_at:=now(); return new; end $$;
do $$ declare t text; begin
 foreach t in array array['hotels','nearby_places','amenities','faqs','site_content','media_assets','hero_slides','pricing_rules','seo_observations'] loop
  execute format('create trigger touch_timestamp before update on public.%I for each row execute function public.touch_updated_at()',t);
 end loop;
end $$;
revoke all on function public.touch_updated_at() from public;
create function public.guard_content_approval() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin
 if auth.uid() is not null and new.approved and not public.hotel_permission(new.hotel_id,'settings') then
  raise insufficient_privilege using message='Management approval required';
 end if;
 return new;
end $$;
create trigger content_approval before insert or update on public.site_content for each row execute function public.guard_content_approval();
revoke all on function public.guard_content_approval() from public;

-- Audit and lock content/rule mutations. Audit records cannot be modified by staff.
create function public.audit_property_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare j jsonb; h uuid; begin
 j:=case when TG_OP='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 h:=case when TG_TABLE_NAME='hotels' then (j->>'id')::uuid else (j->>'hotel_id')::uuid end;
 if TG_TABLE_NAME='inventory_blocks' then select hotel_id into h from public.room_types where id=(j->>'room_type_id')::uuid; end if;
 insert into public.audit_logs(hotel_id,actor_id,action,entity_type,entity_id,details)
 values(h,auth.uid(),TG_OP,TG_TABLE_NAME,(j->>'id')::uuid,jsonb_build_object('old',case when TG_OP<>'INSERT' then to_jsonb(old) else null end,'new',case when TG_OP<>'DELETE' then to_jsonb(new) else null end));
 return coalesce(new,old);
end $$;
do $$ declare t text; begin
 foreach t in array array['hotels','room_types','nearby_places','amenities','faqs','site_content','media_assets','hero_slides','pricing_rules','inventory_blocks','seo_tasks','reviews_worklist','seo_observations'] loop
  execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.audit_property_change()',t);
 end loop;
end $$;

create function public.resolve_rate_minor(p_room uuid,p_date date) returns bigint
language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select rate_minor from public.daily_rates where room_type_id=p_room and stay_date=p_date),
 (select rate_minor from public.pricing_rules where room_type_id=p_room and approved and active and p_date between start_date and end_date
 and extract(dow from p_date)::integer=any(weekdays)
 order by case when kind in ('season','event') then 2 else 1 end desc,priority desc,created_at desc,id desc limit 1),
 (select base_rate_minor from public.room_types where id=p_room));
$$;
revoke all on function public.resolve_rate_minor(uuid,date) from public;

create function public.quote_stay_server(p_room uuid,p_checkin date,p_checkout date,p_rooms integer,p_guests integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.room_types%rowtype; h public.hotels%rowtype; d date; rate bigint; reserved integer; blocked integer; available integer:=2147483647;
 subtotal bigint:=0; tax bigint; nightly jsonb:='[]'; begin
 select * into r from public.room_types where id=p_room and published;
 if not found then raise exception 'Accommodation unavailable'; end if;
 select * into h from public.hotels where id=r.hotel_id and status='published';
 if not found then raise exception 'Property unavailable'; end if;
 if p_checkin is null or p_checkout is null or p_checkin<(now() at time zone h.timezone)::date or p_checkout<=p_checkin or p_checkout>p_checkin+30
 or p_rooms is null or p_rooms not between 1 and 5 or p_guests is null or p_guests not between 1 and p_rooms*r.max_guests then raise exception 'Invalid dates or occupancy'; end if;
 for d in select generate_series(p_checkin::timestamp,(p_checkout-1)::timestamp,interval '1 day')::date loop
  select coalesce(sum(bi.quantity),0) into reserved from public.booking_items bi join public.bookings b on b.id=bi.booking_id
   where bi.room_type_id=p_room and b.check_in<=d and b.check_out>d and (b.status in ('confirmed','checked_in') or (b.status='pending' and b.hold_expires_at>now()));
  select coalesce(max(blocked_units),0) into blocked from public.inventory_blocks where room_type_id=p_room and stay_date=d;
  available:=least(available,greatest(0,r.inventory-reserved-blocked));
  rate:=public.resolve_rate_minor(p_room,d); subtotal:=subtotal+rate*p_rooms;
  nightly:=nightly||jsonb_build_object('date',d,'rate_minor',rate);
 end loop;
 tax:=case when h.tax_approved then (subtotal*h.tax_basis_points+5000)/10000 else 0 end;
 return jsonb_build_object('room_id',r.id,'hotel_id',h.id,'room_name',r.name,'hotel_name',h.name,'tax_configured',h.tax_approved,'currency',r.currency,'nights',p_checkout-p_checkin,'nightly',nightly,
 'subtotal_minor',subtotal,'tax_minor',tax,'discount_minor',0,'total_minor',subtotal+tax,'available',available,
 'bookable',h.booking_enabled and h.pay_at_property and h.tax_approved and
 (select count(distinct slug)=4 from public.site_content where hotel_id=h.id and active and approved and slug in ('booking-policy','cancellation-policy','terms-and-conditions','privacy-policy')));
end $$;
revoke all on function public.quote_stay_server(uuid,date,date,integer,integer) from public;
grant execute on function public.quote_stay_server(uuid,date,date,integer,integer) to service_role;

create function public.set_daily_rates(p_hotel uuid,p_room uuid,p_from date,p_to date,p_rate bigint,p_weekdays integer[],p_reason text) returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare d date; previous bigint; n integer:=0; begin
 if not public.hotel_permission(p_hotel,'pricing') then raise insufficient_privilege using message='Property pricing permission required'; end if;
 perform 1 from public.room_types where id=p_room and hotel_id=p_hotel for update;
 if not found then raise exception 'Accommodation does not belong to selected hotel'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>365 or p_rate is null or p_rate not between 0 and 100000000
 or length(trim(coalesce(p_reason,'')))=0 or p_weekdays is null or cardinality(p_weekdays)=0 or not p_weekdays <@ array[0,1,2,3,4,5,6] then raise exception 'Invalid rate update'; end if;
 for d in select generate_series(p_from::timestamp,p_to::timestamp,interval '1 day')::date loop
  if extract(dow from d)::integer=any(p_weekdays) then
   previous:=public.resolve_rate_minor(p_room,d);
   insert into public.daily_rates(room_type_id,stay_date,rate_minor,currency,updated_by) select p_room,d,p_rate,currency,auth.uid() from public.room_types where id=p_room
   on conflict(room_type_id,stay_date) do update set rate_minor=excluded.rate_minor,updated_at=now(),updated_by=auth.uid();
   insert into public.pricing_history(hotel_id,room_type_id,stay_date,old_rate_minor,new_rate_minor,changed_by,reason) values(p_hotel,p_room,d,previous,p_rate,auth.uid(),p_reason);
   n:=n+1;
  end if;
 end loop;
 return n;
end $$;
revoke all on function public.set_daily_rates(uuid,uuid,date,date,bigint,integer[],text) from public;
grant execute on function public.set_daily_rates(uuid,uuid,date,date,bigint,integer[],text) to authenticated;

create function public.preview_rates_staff(p_room uuid,p_from date,p_to date) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare h uuid; result jsonb; begin
 select hotel_id into h from public.room_types where id=p_room;
 if not public.can_manage_hotel(h) then raise insufficient_privilege; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>365 then raise exception 'Invalid date range'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('date',d::date,'rate_minor',public.resolve_rate_minor(p_room,d::date)) order by d),'[]') into result
 from generate_series(p_from::timestamp,p_to::timestamp,interval '1 day') d;
 return result;
end $$;
revoke all on function public.preview_rates_staff(uuid,date,date) from public;
grant execute on function public.preview_rates_staff(uuid,date,date) to authenticated;

create function public.reserve_stay_server(p_room uuid,p_checkin date,p_checkout date,p_rooms integer,p_guests integer,p_name text,p_email text,p_phone text,p_expected bigint,p_key uuid,p_access_hash text,p_request_hash text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare q jsonb; b public.bookings%rowtype; h uuid; begin
 -- Serialize both same-key retries and all reservations/pricing/inventory changes for this room type.
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into b from public.bookings where idempotency_key=p_key;
 if found then
  if b.request_hash is distinct from p_request_hash or b.access_hash is distinct from p_access_hash then raise exception 'Idempotency conflict'; end if;
  return jsonb_build_object('reference',b.reference,'total_minor',b.total_minor,'status',b.status);
 end if;
 perform 1 from public.room_types where id=p_room for update;
 q:=public.quote_stay_server(p_room,p_checkin,p_checkout,p_rooms,p_guests); h:=(q->>'hotel_id')::uuid;
 if not (q->>'bookable')::boolean then raise exception 'Approved booking, payment and tax policies are required'; end if;
 if (q->>'available')::integer<p_rooms then raise exception 'Accommodation sold out'; end if;
 if p_expected is null or p_expected<>(q->>'total_minor')::bigint then raise exception 'Price changed; refresh your quote'; end if;
 if length(trim(coalesce(p_name,'')))<2 or length(p_name)>100 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_phone !~ '^\+?[0-9 ()-]{8,30}$' or length(coalesce(p_access_hash,''))<>64 then raise exception 'Invalid guest information'; end if;
 insert into public.bookings(hotel_id,guest_name,guest_email,guest_phone,check_in,check_out,guest_count,status,payment_status,currency,subtotal_minor,tax_minor,total_minor,idempotency_key,access_hash,request_hash)
 values(h,trim(p_name),lower(trim(p_email)),trim(p_phone),p_checkin,p_checkout,p_guests,'confirmed','unpaid',q->>'currency',(q->>'subtotal_minor')::bigint,(q->>'tax_minor')::bigint,(q->>'total_minor')::bigint,p_key,p_access_hash,p_request_hash) returning * into b;
 insert into public.booking_items(booking_id,room_type_id,quantity,nightly_rates_minor,subtotal_minor) values(b.id,p_room,p_rooms,q->'nightly',(q->>'subtotal_minor')::bigint);
 update public.bookings set policy_snapshot=jsonb_build_object('accepted_at',now(),'policies',(select jsonb_agg(jsonb_build_object('id',id,'slug',slug,'title',title,'body',body,'updated_at',updated_at)) from public.site_content where hotel_id=h and approved and active and slug<>'about')) where id=b.id;
 insert into public.audit_logs(hotel_id,action,entity_type,entity_id,details) values(h,'reservation_created','bookings',b.id,jsonb_build_object('reference',b.reference,'payment','pay_at_property'));
 return jsonb_build_object('reference',b.reference,'total_minor',b.total_minor,'status',b.status);
end $$;
revoke all on function public.reserve_stay_server(uuid,date,date,integer,integer,text,text,text,bigint,uuid,text,text) from public;
grant execute on function public.reserve_stay_server(uuid,date,date,integer,integer,text,text,text,bigint,uuid,text,text) to service_role;
create function public.request_cancellation_server(p_reference text,p_access_hash text) returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$
declare b public.bookings%rowtype; begin
 select * into b from public.bookings where reference=p_reference and access_hash=p_access_hash for update;
 if not found or b.status not in ('pending','confirmed') then raise exception 'Reservation cannot receive a cancellation request'; end if;
 if b.cancellation_requested_at is null then
  update public.bookings set cancellation_requested_at=now(),updated_at=now() where id=b.id;
  insert into public.audit_logs(hotel_id,action,entity_type,entity_id) values(b.hotel_id,'guest_cancellation_request','bookings',b.id);
 end if;
 return true;
end $$;
revoke all on function public.request_cancellation_server(text,text) from public;
grant execute on function public.request_cancellation_server(text,text) to service_role;
-- Disable the old prototype RPC with its unapproved 12% weekend uplift.
revoke execute on function public.create_booking_hold_server(uuid,date,date,integer,integer,text,text,text) from service_role;

-- Parent locks establish the same serialization order for staff inventory/rule edits.
create function public.lock_room_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare rid uuid; begin
 rid:=case when TG_OP='DELETE' then old.room_type_id else new.room_type_id end;
 if TG_OP='UPDATE' and new.room_type_id<>old.room_type_id then raise exception 'Room association is immutable; create a new record'; end if;
 perform 1 from public.room_types where id=rid for update;
 return coalesce(new,old);
end $$;
create trigger rules_parent_lock before insert or update or delete on public.pricing_rules for each row execute function public.lock_room_change();
create trigger blocks_parent_lock before insert or update or delete on public.inventory_blocks for each row execute function public.lock_room_change();
create function public.guard_inventory() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare rid uuid; inv integer; d date; units integer; block_date date; block_units integer; begin
 if TG_TABLE_NAME='room_types' then
  if new.hotel_id<>old.hotel_id then raise exception 'Property association is immutable'; end if;
  if new.base_rate_minor<>old.base_rate_minor and length(trim(coalesce(new.pricing_change_reason,'')))=0 then raise exception 'A reason is required for base rate changes'; end if;
  rid:=new.id; inv:=new.inventory;
 else rid:=new.room_type_id; block_date:=new.stay_date; block_units:=new.blocked_units; select inventory into inv from public.room_types where id=rid; end if;
 for d in select distinct x::date from public.bookings b join public.booking_items bi on bi.booking_id=b.id
 cross join lateral generate_series(b.check_in::timestamp,(b.check_out-1)::timestamp,interval '1 day') x
 where bi.room_type_id=rid and (b.status in ('confirmed','checked_in') or (b.status='pending' and b.hold_expires_at>now()))
 union select stay_date from public.inventory_blocks where room_type_id=rid loop
  select coalesce(sum(bi.quantity),0) into units from public.booking_items bi join public.bookings b on b.id=bi.booking_id
  where bi.room_type_id=rid and b.check_in<=d and b.check_out>d and (b.status in ('confirmed','checked_in') or (b.status='pending' and b.hold_expires_at>now()));
  units:=units+case when block_date=d then block_units else coalesce((select blocked_units from public.inventory_blocks where room_type_id=rid and stay_date=d),0) end;
  if units>inv then raise exception 'Inventory cannot be lower than reserved and blocked units'; end if;
 end loop;
 if block_units>inv then raise exception 'Block exceeds inventory'; end if;
 return new;
end $$;
create trigger rooms_inventory_guard before update on public.room_types for each row execute function public.guard_inventory();
create trigger blocks_inventory_guard before insert or update on public.inventory_blocks for each row execute function public.guard_inventory();

create function public.change_booking_status(p_booking uuid,p_status public.booking_state) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare b public.bookings%rowtype; begin
 select * into b from public.bookings where id=p_booking;
 if not public.hotel_permission(b.hotel_id,'operations') then raise insufficient_privilege using message='Property operations permission required'; end if;
 perform 1 from public.room_types where id in(select room_type_id from public.booking_items where booking_id=p_booking) order by id for update;
 select * into b from public.bookings where id=p_booking for update;
 if not ((b.status='confirmed' and p_status in ('checked_in','cancelled','no_show')) or (b.status='checked_in' and p_status='checked_out') or (b.status='pending' and p_status in ('cancelled','expired'))) then raise exception 'Invalid booking status transition'; end if;
 update public.bookings set status=p_status,updated_at=now() where id=p_booking;
 insert into public.audit_logs(hotel_id,actor_id,action,entity_type,entity_id,details) values(b.hotel_id,auth.uid(),'booking_status','bookings',b.id,jsonb_build_object('old',b.status,'new',p_status));
end $$;
revoke all on function public.change_booking_status(uuid,public.booking_state) from public;
grant execute on function public.change_booking_status(uuid,public.booking_state) to authenticated;

-- Distributed fixed-window limits. The API hashes IPs and never stores the original IP.
create table public.api_rate_limits (key text primary key, hits integer not null default 1, expires_at timestamptz not null);
alter table public.api_rate_limits enable row level security;
create function public.consume_api_limit(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$ declare n integer; begin
 insert into public.api_rate_limits(key,hits,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set hits=case when api_rate_limits.expires_at<=now() then 1 else api_rate_limits.hits+1 end,
 expires_at=case when api_rate_limits.expires_at<=now() then now()+make_interval(secs=>p_seconds) else api_rate_limits.expires_at end returning hits into n;
 if random()<0.01 then delete from public.api_rate_limits where expires_at<now()-interval '1 day'; end if;
 return n<=p_limit;
end $$;
revoke all on function public.consume_api_limit(text,integer,integer) from public;
grant execute on function public.consume_api_limit(text,integer,integer) to service_role;

-- Supabase Storage writes use the user's JWT and property permission; no service key upload bypass.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('hotel-media','hotel-media',true,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy hotel_media_insert on storage.objects for insert to authenticated with check(bucket_id='hotel-media' and public.hotel_permission((storage.foldername(name))[1]::uuid,'content'));
create policy hotel_media_delete on storage.objects for delete to authenticated using(bucket_id='hotel-media' and public.hotel_permission((storage.foldername(name))[1]::uuid,'content'));
create policy hotel_media_read on storage.objects for select to authenticated using(bucket_id='hotel-media' and public.can_manage_hotel((storage.foldername(name))[1]::uuid));

grant select on public.nearby_places,public.amenities,public.faqs,public.site_content,public.media_assets,public.hero_slides to anon,authenticated;
grant select,insert,update,delete on public.hotels,public.room_types,public.inventory_blocks,public.nearby_places,public.amenities,public.faqs,public.site_content,public.media_assets,public.hero_slides,public.pricing_rules,public.seo_tasks,public.reviews_worklist to authenticated;
grant select,insert,update,delete on public.seo_observations to authenticated;
grant select on public.pricing_history,public.audit_logs,public.bookings,public.booking_items,public.payments,public.daily_rates,public.staff_assignments to authenticated;
revoke insert,update,delete on public.daily_rates,public.pricing_history,public.bookings,public.booking_items,public.payments,public.audit_logs,public.staff_assignments from anon,authenticated;
-- Trigger functions are callable only by their triggers, never as public RPCs.
revoke all on function public.audit_property_change(),public.lock_room_change(),public.guard_inventory() from public;
commit;
