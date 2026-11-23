-- Flower Inn & Petal Inn — STARTER schema; NOT DEPLOYED.
-- Review with the actual hotel operator and a database/security engineer before applying.
-- This migration is foundation only. The Next.js frontend preview does NOT use this schema.
create extension if not exists pgcrypto;

create type public.booking_state as enum ('pending','confirmed','checked_in','checked_out','cancelled','no_show','expired');
create type public.staff_role as enum ('super_admin','group_admin','property_manager','front_desk','finance','marketing');

create table public.hotels (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check (char_length(slug) between 2 and 100),
 name text not null,
 description text,
 address text,
 city text,
 country text not null default 'India',
 timezone text not null default 'Asia/Kolkata',
 contact_phone text,
 contact_email text,
 check_in_time time,
 check_out_time time,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.room_types (
 id uuid primary key default gen_random_uuid(),
 hotel_id uuid not null references public.hotels(id),
 slug text not null,
 name text not null,
 description text,
 inventory integer not null check(inventory>=0),
 max_guests integer not null check(max_guests>0),
 base_rate_minor bigint not null check(base_rate_minor>=0),
 currency char(3) not null default 'INR',
 published boolean not null default false,
 created_at timestamptz not null default now(),
 unique(hotel_id,slug)
);
create index on public.room_types(hotel_id,published);

create table public.daily_rates (
 id uuid primary key default gen_random_uuid(),
 room_type_id uuid not null references public.room_types(id),
 stay_date date not null,
 rate_minor bigint not null check(rate_minor>=0),
 currency char(3) not null default 'INR',
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),
 unique(room_type_id,stay_date)
);
create index on public.daily_rates(stay_date,room_type_id);

create table public.inventory_blocks (
 id uuid primary key default gen_random_uuid(),
 room_type_id uuid not null references public.room_types(id),
 stay_date date not null,
 blocked_units integer not null default 0 check(blocked_units>=0),
 reason text,
 updated_by uuid references auth.users(id),
 unique(room_type_id,stay_date)
);

create table public.staff_assignments (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid not null references auth.users(id) on delete cascade,
 hotel_id uuid references public.hotels(id), -- NULL allowed only for group-level roles (server enforced)
 role public.staff_role not null,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(auth_user_id,hotel_id,role)
);
create index on public.staff_assignments(auth_user_id,hotel_id,active);

create table public.bookings (
 id uuid primary key default gen_random_uuid(),
 reference text unique not null default ('FI-'+upper(encode(gen_random_bytes(9),'hex'))),
 hotel_id uuid not null references public.hotels(id),
 guest_user_id uuid references auth.users(id),
 guest_name text not null,
 guest_email text not null,
 guest_phone text not null,
 check_in date not null,
 check_out date not null,
 guest_count integer not null check(guest_count>0),
 status public.booking_state not null default 'pending',
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','authorized','paid','failed','refunded','partially_refunded')),
 hold_expires_at timestamptz,
 currency char(3) not null default 'INR',
 subtotal_minor bigint not null check(subtotal_minor>=0),
 tax_minor bigint not null default 0 check(tax_minor>=0),
 discount_minor bigint not null default 0 check(discount_minor>=0),
 total_minor bigint not null check(total_minor>=0),
 source text not null default 'website',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (check_out>check_in),
 check (check_out<=check_in+interval '60 days')
);
create index on public.bookings(hotel_id,check_in,check_out,status);
create index on public.bookings(guest_user_id,created_at desc);
create index on public.bookings(lower(guest_email));

create table public.booking_items (
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null references public.bookings(id) on delete restrict,
 room_type_id uuid not null references public.room_types(id),
 quantity integer not null check(quantity between 1 and 20),
 nightly_rates_minor jsonb not null default '[]'::jsonb,
 subtotal_minor bigint not null check(subtotal_minor>=0)
);
create index on public.booking_items(room_type_id,booking_id);

create table public.payments (
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null references public.bookings(id),
 provider text not null,
 provider_payment_id text unique,
 amount_minor bigint not null check(amount_minor>=0),
 currency char(3) not null default 'INR',
 status text not null default 'pending',
 verified_at timestamptz,
 created_at timestamptz not null default now()
);

create table public.reviews_worklist (
 id uuid primary key default gen_random_uuid(),
 hotel_id uuid not null references public.hotels(id),
 source text,
 external_review_id text,
 review_content text,
 star_rating smallint check(star_rating between 1 and 5),
 reply_draft text,
 workflow_status text not null default 'new' check(workflow_status in ('new','draft','approved','published','archived')),
 source_verified boolean not null default false,
 created_at timestamptz not null default now()
);

create table public.seo_tasks (
 id uuid primary key default gen_random_uuid(),
 hotel_id uuid not null references public.hotels(id),
 title text not null,
 status text not null default 'todo' check(status in ('todo','in_progress','done')),
 created_at timestamptz not null default now()
);

create table public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 hotel_id uuid references public.hotels(id),
 actor_id uuid references auth.users(id),
 action text not null,
 entity_type text,
 entity_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index on public.audit_logs(hotel_id,created_at desc);

-- Privilege checks. Definer function avoids recursive staff RLS policies.
create or replace function public.can_manage_hotel(p_hotel uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
 select exists (
  select 1 from public.staff_assignments s
  where s.auth_user_id = auth.uid() and s.active = true and
   (
    s.role in ('super_admin','group_admin') or
    (s.hotel_id = p_hotel and s.role in ('property_manager','front_desk','finance','marketing'))
   )
 );
$$;
revoke all on function public.can_manage_hotel(uuid) from public;
grant execute on function public.can_manage_hotel(uuid) to authenticated;

alter table public.hotels enable row level security;
alter table public.room_types enable row level security;
alter table public.daily_rates enable row level security;
alter table public.inventory_blocks enable row level security;
alter table public.staff_assignments enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews_worklist enable row level security;
alter table public.seo_tasks enable row level security;
alter table public.audit_logs enable row level security;

create policy hotels_public_read on public.hotels for select to anon,authenticated using (status='published');
create policy hotels_staff_read on public.hotels for select to authenticated using(public.can_manage_hotel(id));
create policy hotels_staff_update on public.hotels for update to authenticated using(public.can_manage_hotel(id)) with check(public.can_manage_hotel(id));

create policy rooms_public_read on public.room_types for select to anon,authenticated
 using(published and exists(select 1 from public.hotels h where h.id=hotel_id and h.status='published'));
create policy rooms_staff_all on public.room_types for all to authenticated
 using(public.can_manage_hotel(hotel_id)) with check(public.can_manage_hotel(hotel_id));

create policy rates_public_read on public.daily_rates for select to anon,authenticated
 using(exists(select 1 from public.room_types r join public.hotels h on h.id=r.hotel_id where r.id=room_type_id and r.published and h.status='published'));
create policy rates_staff_all on public.daily_rates for all to authenticated
 using(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)))
 with check(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)));

create policy blocks_staff_all on public.inventory_blocks for all to authenticated
 using(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)))
 with check(exists(select 1 from public.room_types r where r.id=room_type_id and public.can_manage_hotel(r.hotel_id)));

create policy staff_self_read on public.staff_assignments for select to authenticated using(auth_user_id=auth.uid());
-- Staff assignment creation/revocation deliberately service-role-only pending a audited provisioning workflow.

create policy booking_staff_or_owner_read on public.bookings for select to authenticated
 using(guest_user_id=auth.uid() or public.can_manage_hotel(hotel_id));
create policy booking_staff_update on public.bookings for update to authenticated
 using(public.can_manage_hotel(hotel_id)) with check(public.can_manage_hotel(hotel_id));
-- Bookings inserts must only happen through a server-authorized RPC, NEVER direct anonymous INSERT.

create policy booking_items_authorized_read on public.booking_items for select to authenticated
 using(exists(select 1 from public.bookings b where b.id=booking_id and (b.guest_user_id=auth.uid() or public.can_manage_hotel(b.hotel_id))));
create policy payments_authorized_read on public.payments for select to authenticated
 using(exists(select 1 from public.bookings b where b.id=booking_id and (b.guest_user_id=auth.uid() or public.can_manage_hotel(b.hotel_id))));

create policy review_staff_all on public.reviews_worklist for all to authenticated
 using(public.can_manage_hotel(hotel_id)) with check(public.can_manage_hotel(hotel_id));
create policy seo_staff_all on public.seo_tasks for all to authenticated
 using(public.can_manage_hotel(hotel_id)) with check(public.can_manage_hotel(hotel_id));
create policy audit_staff_read on public.audit_logs for select to authenticated
 using(hotel_id is not null and public.can_manage_hotel(hotel_id));

-- IMPORTANT: This initial RLS is a STARTER. Add field-level/role-level authorization:
-- marketing must not edit financial tables; front-desk must not edit price policy, etc.
-- Review public-view grants, RLS and security-definer privileges before production.
