alter table public.profiles add column avatar_options jsonb not null default '{"hair":"#302b27","outfit":"#485b37","accessory":"none"}'::jsonb
 check(jsonb_typeof(avatar_options)='object' and avatar_options ?& array['hair','outfit','accessory'] and avatar_options->>'hair' ~ '^#[0-9a-fA-F]{6}$' and avatar_options->>'outfit' ~ '^#[0-9a-fA-F]{6}$' and avatar_options->>'accessory' in ('none','glasses','leaf','headphones') and char_length(avatar_options::text)<=400);
alter table public.member_cards add column avatar_options jsonb not null default '{"hair":"#302b27","outfit":"#485b37","accessory":"none"}'::jsonb
 check(jsonb_typeof(avatar_options)='object' and avatar_options ?& array['hair','outfit','accessory'] and avatar_options->>'hair' ~ '^#[0-9a-fA-F]{6}$' and avatar_options->>'outfit' ~ '^#[0-9a-fA-F]{6}$' and avatar_options->>'accessory' in ('none','glasses','leaf','headphones') and char_length(avatar_options::text)<=400);
create table public.user_settings (
 user_id uuid primary key default auth.uid() references auth.users on delete cascade,
 theme text not null default 'system' check(theme in ('system','dark','light')),
 timezone text not null default 'America/Costa_Rica' check(char_length(timezone) between 1 and 80),
 activity_visible boolean not null default false
);
alter table public.user_settings enable row level security;
revoke all on public.user_settings from anon,authenticated;
grant select,insert,update on public.user_settings to authenticated;
create policy settings_own on public.user_settings for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function private.validate_timezone() returns trigger language plpgsql security invoker set search_path='' as $$ begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then raise exception 'Invalid timezone' using errcode='23514'; end if;
 return new;
end $$;
revoke all on function private.validate_timezone() from public,anon,authenticated;
create trigger settings_timezone before insert or update on public.user_settings for each row execute function private.validate_timezone();

create function public.save_profile(profile_data jsonb, visible boolean default false) returns void language plpgsql security invoker set search_path='' as $$
declare p public.profiles;
begin
 if auth.uid() is null or not exists(select 1 from public.policy_acceptances where user_id=auth.uid()) then raise exception 'Accept policies first' using errcode='42501'; end if;
 if (profile_data->>'id')::uuid is distinct from auth.uid() then raise exception 'Owner mismatch' using errcode='42501'; end if;
 insert into public.profiles(id,display_name,username,bio,avatar_base,avatar_color,interests,onboarding_step,onboarding_complete,activity_visible,avatar_options)
 values(auth.uid(),trim(profile_data->>'display_name'),profile_data->>'username',coalesce(profile_data->>'bio',''),(profile_data->>'avatar_base')::smallint,profile_data->>'avatar_color',array(select jsonb_array_elements_text(profile_data->'interests')),(profile_data->>'onboarding_step')::smallint,(profile_data->>'onboarding_complete')::boolean,(profile_data->>'activity_visible')::boolean,coalesce(profile_data->'avatar_options','{"hair":"#302b27","outfit":"#485b37","accessory":"none"}'::jsonb))
 on conflict(id) do update set display_name=excluded.display_name,username=excluded.username,bio=excluded.bio,avatar_base=excluded.avatar_base,avatar_color=excluded.avatar_color,interests=excluded.interests,onboarding_step=excluded.onboarding_step,onboarding_complete=excluded.onboarding_complete,activity_visible=excluded.activity_visible,avatar_options=excluded.avatar_options returning * into p;
 if p.onboarding_complete then
 insert into public.member_cards(id,display_name,username,bio,avatar_base,avatar_color,avatar_options,discoverable) values(p.id,p.display_name,p.username,p.bio,p.avatar_base,p.avatar_color,p.avatar_options,visible)
 on conflict(id) do update set display_name=excluded.display_name,username=excluded.username,bio=excluded.bio,avatar_base=excluded.avatar_base,avatar_color=excluded.avatar_color,avatar_options=excluded.avatar_options,discoverable=excluded.discoverable;
 end if;
end $$;
revoke all on function public.save_profile(jsonb,boolean) from public,anon;
grant execute on function public.save_profile(jsonb,boolean) to authenticated;

create function private.party_capacity_guard() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.capacity < 1+(select count(*) from public.party_attendees a where a.party_id=new.id and a.rsvp='going' and not exists(select 1 from public.party_bans b where b.party_id=new.id and b.user_id=a.user_id)) then raise exception 'Capacity below current participants' using errcode='23514'; end if;
 return new;
end $$;
revoke all on function private.party_capacity_guard() from public,anon,authenticated;
create trigger party_capacity before update of capacity on public.parties for each row execute function private.party_capacity_guard();
create function private.party_change_notice() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.starts_at is distinct from old.starts_at or new.status is distinct from old.status then
 insert into public.notifications(user_id,title,destination)
 select user_id,case when new.status='cancelled' then 'Se canceló un plan de tu agenda' else 'Hay cambios en un plan de tu agenda' end,'parties' from
 (select user_id from public.party_attendees where party_id=new.id and rsvp in ('going','maybe','waitlist') union select user_id from public.party_invites where party_id=new.id) audience
 where user_id<>new.host_id;
 end if; return new;
end $$;
revoke all on function private.party_change_notice() from public,anon,authenticated;
create trigger party_change_notifications after update on public.parties for each row execute function private.party_change_notice();
