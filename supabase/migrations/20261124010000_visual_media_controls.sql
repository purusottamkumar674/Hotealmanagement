-- Additive visual/media controls. No hotel, booking, rate or asset records are seeded or overwritten.
begin;
alter table public.hotels add column sample_images_enabled boolean not null default true;
alter table public.media_assets add column rights_note text not null default '';
alter table public.media_assets drop constraint media_assets_category_check;
alter table public.media_assets add constraint media_assets_category_check check(category in ('exterior','interior','reception','rooms','bedroom','living-room','bathroom','kitchen','amenities','nearby','logo','hero','other'));
alter table public.hero_slides alter column image_id drop not null;
alter table public.hero_slides add constraint active_slide_has_image check(not active or image_id is not null);

create table public.media_deletion_jobs(
 id uuid primary key default gen_random_uuid(),hotel_id uuid not null references public.hotels(id),storage_path text not null,
 status text not null default 'pending' check(status in ('pending','deleted')),created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),completed_at timestamptz
);
create index on public.media_deletion_jobs(hotel_id,status);
alter table public.media_deletion_jobs enable row level security;
create policy media_cleanup_read on public.media_deletion_jobs for select to authenticated using(public.hotel_permission(hotel_id,'content'));
grant select on public.media_deletion_jobs to authenticated;
revoke insert,update,delete on public.media_deletion_jobs from anon,authenticated;

create function public.media_asset_usage(p_image uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare h uuid;result jsonb;begin
 select hotel_id into h from public.media_assets where id=p_image;
 if not public.hotel_permission(h,'content') then raise insufficient_privilege; end if;
 select coalesce(jsonb_agg(u),'[]') into result from (
  select s.id,'hero' as kind,s.heading as label,s.active as published,
  case when s.image_id=p_image then 'desktop' else 'mobile' end as slot
  from public.hero_slides s where s.hotel_id=h and (s.image_id=p_image or s.mobile_image_id=p_image)
  union all select id,'logo',name,status='published','logo' from public.hotels where id=h and logo_id=p_image
 ) u;
 return result;
end $$;
revoke all on function public.media_asset_usage(uuid) from public;
grant execute on function public.media_asset_usage(uuid) to authenticated;

create function public.detach_media_usage(p_image uuid,p_target uuid,p_kind text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare h uuid;begin
 select hotel_id into h from public.media_assets where id=p_image for update;
 if not public.hotel_permission(h,'content') then raise insufficient_privilege;end if;
 if p_kind='logo' then
  if not public.hotel_permission(h,'settings') then raise insufficient_privilege;end if;
  update public.hotels set logo_id=null where id=p_target and id=h and logo_id=p_image;
 elsif p_kind='hero' then
  update public.hero_slides set active=case when image_id=p_image then false else active end,
  image_id=case when image_id=p_image then null else image_id end,
  mobile_image_id=case when mobile_image_id=p_image then null else mobile_image_id end
  where id=p_target and hotel_id=h and (image_id=p_image or mobile_image_id=p_image);
 else raise exception 'Invalid media usage';end if;
 if not found then raise exception 'Media usage changed; reload before editing';end if;
end $$;
revoke all on function public.detach_media_usage(uuid,uuid,text) from public;
grant execute on function public.detach_media_usage(uuid,uuid,text) to authenticated;

create function public.remove_media_asset(p_image uuid,p_unassign boolean default false) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.media_assets%rowtype;uses jsonb;job uuid;begin
 select * into m from public.media_assets where id=p_image for update;
 if not found then raise exception 'Image not found';end if;
 if not public.hotel_permission(m.hotel_id,'content') then raise insufficient_privilege;end if;
 uses:=public.media_asset_usage(p_image);
 if jsonb_array_length(uses)>0 and not p_unassign then return jsonb_build_object('removed',false,'usage',uses);end if;
 if exists(select 1 from public.hotels where id=m.hotel_id and logo_id=m.id) then
  if not public.hotel_permission(m.hotel_id,'settings') then raise insufficient_privilege using message='A property manager must unassign the logo';end if;
  update public.hotels set logo_id=null where id=m.hotel_id and logo_id=m.id;
 end if;
 update public.hero_slides set active=case when image_id=m.id then false else active end,
 image_id=case when image_id=m.id then null else image_id end,
 mobile_image_id=case when mobile_image_id=m.id then null else mobile_image_id end
 where hotel_id=m.hotel_id and (image_id=m.id or mobile_image_id=m.id);
 delete from public.media_assets where id=m.id;
 insert into public.media_deletion_jobs(hotel_id,storage_path,created_by) values(m.hotel_id,m.storage_path,auth.uid()) returning id into job;
 return jsonb_build_object('removed',true,'storage_path',m.storage_path,'job_id',job,'hotel_id',m.hotel_id);
end $$;
revoke all on function public.remove_media_asset(uuid,boolean) from public;
grant execute on function public.remove_media_asset(uuid,boolean) to authenticated;

create function public.complete_media_cleanup(p_job uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare h uuid;begin
 select hotel_id into h from public.media_deletion_jobs where id=p_job;
 if not public.hotel_permission(h,'content') then raise insufficient_privilege;end if;
 update public.media_deletion_jobs set status='deleted',completed_at=now() where id=p_job;
end $$;
revoke all on function public.complete_media_cleanup(uuid) from public;
grant execute on function public.complete_media_cleanup(uuid) to authenticated;
commit;
