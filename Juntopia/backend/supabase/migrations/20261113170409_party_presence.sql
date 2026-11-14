create table public.party_presence(
 party_id uuid not null references public.parties on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 seen_at timestamptz not null default now(),primary key(party_id,user_id)
);
create index presence_user on public.party_presence(user_id);
alter table public.party_presence enable row level security;
revoke all on public.party_presence from anon,authenticated;
grant select on public.party_presence to authenticated;
create function private.sharing_presence(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=target and activity_visible);
$$;
create policy presence_read on public.party_presence for select to authenticated using(
 seen_at>now()-interval '70 seconds' and private.read_party_chat(party_id) and not private.blocked(user_id) and private.sharing_presence(user_id)
);
create function private.party_heartbeat(target uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.in_party(target) then raise exception 'Participation required' using errcode='42501'; end if;
 if not private.sharing_presence(auth.uid()) then delete from public.party_presence where party_id=target and user_id=auth.uid(); return false; end if;
 insert into public.party_presence(party_id,user_id) values(target,auth.uid()) on conflict(party_id,user_id) do update set seen_at=now();
 return true;
end $$;
create function public.party_heartbeat(target uuid) returns boolean language sql security invoker set search_path='' as $$ select private.party_heartbeat(target); $$;
revoke all on function private.sharing_presence(uuid),private.party_heartbeat(uuid) from public,anon,authenticated;
grant execute on function private.sharing_presence(uuid),private.party_heartbeat(uuid) to authenticated;
revoke all on function public.party_heartbeat(uuid) from public,anon;
grant execute on function public.party_heartbeat(uuid) to authenticated;
alter publication supabase_realtime add table public.party_presence;
