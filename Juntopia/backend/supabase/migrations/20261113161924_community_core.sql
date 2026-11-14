-- Core community. All authorization remains in Postgres, never in editable JWT metadata.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.categories (name text primary key, icon text not null, color text not null);
insert into public.categories values ('Música','♫','#a78bfa'),('Cine y series','▤','#fb7185'),('Libros','▥','#f5b942'),('Videojuegos','✣','#34d399'),('Anime y manga','✧','#818cf8'),('Arte','◈','#f472b6'),('Podcasts','◉','#60a5fa'),('Documentales','◎','#f59e0b');

create table public.blocks (
 blocker_id uuid not null references auth.users on delete cascade default auth.uid(),
 blocked_id uuid not null references auth.users on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create index blocks_target on public.blocks(blocked_id);
create table public.member_cards (
 id uuid primary key references auth.users on delete cascade default auth.uid(),
 display_name text not null check(char_length(trim(display_name)) between 1 and 50),
 username text not null unique check(username ~ '^[a-z0-9_]{3,24}$'),
 bio text not null default '' check(char_length(bio)<=280),
 avatar_base smallint not null default 0 check(avatar_base between 0 and 5),
 avatar_color text not null default '#a5c86a' check(avatar_color ~ '^#[0-9a-fA-F]{6}$'),
 discoverable boolean not null default false
);
create table public.friendships (
 id uuid primary key default gen_random_uuid(), requester_id uuid not null default auth.uid() references auth.users on delete cascade,
 addressee_id uuid not null references auth.users on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','rejected')),
 created_at timestamptz not null default now(), check(requester_id<>addressee_id)
);
create unique index friendships_pair on public.friendships(least(requester_id,addressee_id),greatest(requester_id,addressee_id));
create index friendships_addressee on public.friendships(addressee_id);
create index friendships_requester on public.friendships(requester_id);

create function private.blocked(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is null or exists(select 1 from public.blocks where (blocker_id=auth.uid() and blocked_id=target) or (blocker_id=target and blocked_id=auth.uid()));
$$;
create function private.friends(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and not private.blocked(target) and exists(select 1 from public.friendships where status='accepted' and ((requester_id=auth.uid() and addressee_id=target) or (addressee_id=auth.uid() and requester_id=target)));
$$;

create table public.content_items (
 id uuid primary key default gen_random_uuid(), created_by uuid not null default auth.uid() references auth.users on delete cascade,
 category text not null references public.categories(name), title text not null check(char_length(trim(title)) between 1 and 180),
 author text not null default '' check(char_length(author)<=180), description text not null default '' check(char_length(description)<=3000),
 official_url text not null check(official_url ~ '^https://[^[:space:]]+$' and char_length(official_url)<=2000),
 source text not null default 'community' check(char_length(source) between 1 and 100),
 created_at timestamptz not null default now()
);
create unique index content_source_unique on public.content_items(category,official_url);
create index content_category on public.content_items(category,created_at desc);
create index content_creator on public.content_items(created_by);
create table public.user_content_status (
 user_id uuid not null default auth.uid() references auth.users on delete cascade,
 content_id uuid not null references public.content_items on delete cascade,
 status text not null default 'pending' check(status in ('pending','in_progress','completed','abandoned')),
 favorite boolean not null default false, progress smallint not null default 0 check(progress between 0 and 100),
 emotional_tags text[] not null default '{}' check(cardinality(emotional_tags)<=5 and char_length(array_to_string(emotional_tags,''))<=300),
 primary key(user_id,content_id)
);
create index library_content on public.user_content_status(content_id);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 content_id uuid not null references public.content_items on delete cascade, rating smallint not null check(rating between 1 and 5),
 body text not null default '' check(char_length(body)<=3000), created_at timestamptz not null default now(), unique(user_id,content_id)
);
create index reviews_content on public.reviews(content_id);
create table public.collections (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 title text not null check(char_length(trim(title)) between 1 and 100), description text not null default '' check(char_length(description)<=500),
 visibility text not null default 'private' check(visibility in ('private','public')), created_at timestamptz not null default now()
);
create index collections_owner on public.collections(user_id);
create table public.collection_items (
 collection_id uuid not null references public.collections on delete cascade, content_id uuid not null references public.content_items on delete cascade,
 primary key(collection_id,content_id)
);
create index collection_content on public.collection_items(content_id);

create table public.parties (
 id uuid primary key default gen_random_uuid(), host_id uuid not null default auth.uid() references auth.users on delete cascade,
 title text not null check(char_length(trim(title)) between 1 and 120), description text not null default '' check(char_length(description)<=2000),
 category text not null references public.categories(name), content_id uuid references public.content_items on delete set null,
 starts_at timestamptz not null, timezone text not null default 'America/Costa_Rica' check(char_length(timezone)<=80),
 duration_minutes integer not null default 60 check(duration_minutes between 15 and 720), capacity integer not null default 8 check(capacity between 2 and 100),
 privacy text not null default 'public' check(privacy in ('public','friends','invitation')),
 mode text not null default 'internal' check(mode in ('internal','external')),
 official_url text not null default '' check(official_url='' or (official_url ~ '^https://[^[:space:]]+$' and char_length(official_url)<=2000)),
 rules text not null default 'Respeto, cuidado y contenido autorizado.' check(char_length(rules)<=1000),
 status text not null default 'scheduled' check(status in ('scheduled','live','ended','cancelled')), created_at timestamptz not null default now(),
 check(mode<>'external' or official_url<>'')
);
create index parties_schedule on public.parties(starts_at);
create index parties_host on public.parties(host_id);
create index parties_content on public.parties(content_id);
create table public.party_invites (
 party_id uuid not null references public.parties on delete cascade, user_id uuid not null references auth.users on delete cascade,
 primary key(party_id,user_id)
);
create index invites_user on public.party_invites(user_id);
create table public.party_attendees (
 party_id uuid not null references public.parties on delete cascade, user_id uuid not null references auth.users on delete cascade,
 rsvp text not null check(rsvp in ('going','maybe','declined','waitlist')), created_at timestamptz not null default now(), primary key(party_id,user_id)
);
create index attendees_user on public.party_attendees(user_id);
create table public.party_bans (
 party_id uuid not null references public.parties on delete cascade, user_id uuid not null references auth.users on delete cascade,
 primary key(party_id,user_id)
);
create index bans_user on public.party_bans(user_id);

create function private.can_party(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.parties p where p.id=target and not private.blocked(p.host_id)
 and not exists(select 1 from public.party_bans b where b.party_id=target and b.user_id=auth.uid())
 and (p.host_id=auth.uid() or p.privacy='public' or (p.privacy='friends' and private.friends(p.host_id))
 or exists(select 1 from public.party_invites i where i.party_id=target and i.user_id=auth.uid())));
$$;
create function private.hosts_party(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.parties where id=target and host_id=auth.uid());
$$;
create function private.in_party(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.can_party(target) and exists(select 1 from public.parties p where p.id=target and p.status in ('scheduled','live') and
 (p.host_id=auth.uid() or exists(select 1 from public.party_attendees a where a.party_id=target and a.user_id=auth.uid() and a.rsvp='going')));
$$;
create table public.party_messages (
 id uuid primary key default gen_random_uuid(), party_id uuid not null references public.parties on delete cascade,
 user_id uuid not null default auth.uid() references auth.users on delete cascade, body text not null check(char_length(trim(body)) between 1 and 2000), created_at timestamptz not null default now()
);
create index party_chat on public.party_messages(party_id,created_at desc);
create index party_messages_author on public.party_messages(user_id,created_at desc);
create table public.party_queue (
 id uuid primary key default gen_random_uuid(), party_id uuid not null references public.parties on delete cascade,
 content_id uuid not null references public.content_items on delete cascade, user_id uuid not null default auth.uid() references auth.users on delete cascade,
 created_at timestamptz not null default now(), unique(party_id,content_id)
);
create index queue_content on public.party_queue(content_id);
create index queue_user on public.party_queue(user_id);
create table public.party_votes (
 queue_id uuid not null references public.party_queue on delete cascade, user_id uuid not null default auth.uid() references auth.users on delete cascade,
 primary key(queue_id,user_id)
);
create index votes_user on public.party_votes(user_id);

create table public.conversations (
 id uuid primary key default gen_random_uuid(), member_a uuid not null default auth.uid() references auth.users on delete cascade,
 member_b uuid not null references auth.users on delete cascade, created_at timestamptz not null default now(), check(member_a<>member_b)
);
create unique index conversations_pair on public.conversations(least(member_a,member_b),greatest(member_a,member_b));
create index conversations_b on public.conversations(member_b);
create index conversations_a on public.conversations(member_a);
create function private.can_conversation(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.conversations c where c.id=target and ((c.member_a=auth.uid() and not private.blocked(c.member_b)) or (c.member_b=auth.uid() and not private.blocked(c.member_a))));
$$;
create table public.messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade,
 user_id uuid not null default auth.uid() references auth.users on delete cascade, body text not null check(char_length(trim(body)) between 1 and 2000), created_at timestamptz not null default now()
);
create index dm_chat on public.messages(conversation_id,created_at desc);
create index messages_author on public.messages(user_id,created_at desc);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
 title text not null, destination text not null check(destination in ('friends','parties','messages')), is_read boolean not null default false, created_at timestamptz not null default now()
);
create index notifications_owner on public.notifications(user_id,created_at desc);

create table public.creator_works (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 kind text not null check(kind in ('writing','art')), title text not null check(char_length(trim(title)) between 1 and 150),
 body text not null default '' check(char_length(body)<=100000), asset_path text,
 visibility text not null default 'private' check(visibility in ('private','public')),
 license text not null default 'original' check(license in ('original','cc-by','cc0')),
 attribution text not null default '' check(char_length(attribution)<=1000), created_at timestamptz not null default now(),
 check(asset_path is null or asset_path like user_id::text || '/%'), check(license='original' or char_length(trim(attribution))>0)
);
create index works_owner on public.creator_works(user_id);
create function private.can_work(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.creator_works w where id=target and (w.user_id=auth.uid() or (visibility='public' and not private.blocked(w.user_id))));
$$;
create table public.work_comments (
 id uuid primary key default gen_random_uuid(), work_id uuid not null references public.creator_works on delete cascade,
 user_id uuid not null default auth.uid() references auth.users on delete cascade, body text not null check(char_length(trim(body)) between 1 and 2000), created_at timestamptz not null default now()
);
create index work_comments_work on public.work_comments(work_id,created_at);
create index work_comments_user on public.work_comments(user_id);
create table public.reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 subject_type text not null check(subject_type in ('content_items','reviews','parties','messages','party_messages','member_cards','creator_works','work_comments')),
 subject_id uuid not null, reason text not null check(char_length(trim(reason)) between 5 and 1000),
 status text not null default 'pending' check(status in ('pending','reviewed','dismissed')), created_at timestamptz not null default now()
);
create index reports_owner on public.reports(user_id);
create table private.moderators (user_id uuid primary key references auth.users on delete cascade);
create table private.moderation_log (id uuid primary key default gen_random_uuid(), moderator_id uuid not null, report_id uuid not null, action text not null, created_at timestamptz not null default now());
alter table private.moderators enable row level security;
alter table private.moderation_log enable row level security;
create function private.is_moderator() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from private.moderators where user_id=auth.uid());
$$;

-- All exposed tables start with no implicit privileges.
do $$ declare t text; begin
 foreach t in array array['categories','blocks','member_cards','friendships','content_items','user_content_status','reviews','collections','collection_items','parties','party_invites','party_attendees','party_bans','party_messages','party_queue','party_votes','conversations','messages','notifications','creator_works','work_comments','reports'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
grant insert,delete on public.blocks,public.friendships,public.collection_items,public.party_invites,public.party_bans,public.party_queue,public.party_votes to authenticated;
grant insert,update,delete on public.member_cards,public.user_content_status,public.reviews,public.collections,public.creator_works to authenticated;
grant insert,delete on public.content_items,public.work_comments,public.messages,public.party_messages to authenticated;
grant insert on public.parties,public.conversations,public.reports to authenticated;
grant update(status) on public.friendships to authenticated;
grant update(title,description,category,content_id,starts_at,timezone,duration_minutes,capacity,privacy,mode,official_url,rules,status) on public.parties to authenticated;
grant update(is_read) on public.notifications to authenticated;

create policy categories_read on public.categories for select to authenticated using(true);
create policy blocks_own on public.blocks for all to authenticated using(blocker_id=(select auth.uid())) with check(blocker_id=(select auth.uid()));
create policy cards_read on public.member_cards for select to authenticated using(id=(select auth.uid()) or (not private.blocked(id) and (discoverable or private.friends(id))));
create policy cards_owner on public.member_cards for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy friends_read on public.friendships for select to authenticated using(((select auth.uid()) in (requester_id,addressee_id)) and not private.blocked(case when requester_id=(select auth.uid()) then addressee_id else requester_id end));
create policy friends_request on public.friendships for insert to authenticated with check(requester_id=(select auth.uid()) and status='pending' and not private.blocked(addressee_id) and exists(select 1 from public.member_cards c where c.id=addressee_id));
create policy friends_answer on public.friendships for update to authenticated using(addressee_id=(select auth.uid()) and status='pending' and not private.blocked(requester_id)) with check(addressee_id=(select auth.uid()) and status in ('accepted','rejected'));
create policy friends_delete on public.friendships for delete to authenticated using((select auth.uid()) in (requester_id,addressee_id));
create policy content_read on public.content_items for select to authenticated using(not private.blocked(created_by));
create policy content_insert on public.content_items for insert to authenticated with check(created_by=(select auth.uid()));
create policy content_delete on public.content_items for delete to authenticated using(created_by=(select auth.uid()));
create policy library_own on public.user_content_status for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy reviews_read on public.reviews for select to authenticated using(not private.blocked(user_id));
create policy reviews_own on public.reviews for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy collections_read on public.collections for select to authenticated using(user_id=(select auth.uid()) or (visibility='public' and not private.blocked(user_id)));
create policy collections_own on public.collections for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy collection_items_read on public.collection_items for select to authenticated using(exists(select 1 from public.collections c where c.id=collection_id));
create policy collection_items_insert on public.collection_items for insert to authenticated with check(exists(select 1 from public.collections c where c.id=collection_id and c.user_id=(select auth.uid())));
create policy collection_items_delete on public.collection_items for delete to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.user_id=(select auth.uid())));
create policy parties_read on public.parties for select to authenticated using(private.can_party(id));
create policy parties_create on public.parties for insert to authenticated with check(host_id=(select auth.uid()));
create policy parties_update on public.parties for update to authenticated using(host_id=(select auth.uid())) with check(host_id=(select auth.uid()));
create policy invites_read on public.party_invites for select to authenticated using(user_id=(select auth.uid()) or private.hosts_party(party_id));
create policy invites_manage on public.party_invites for all to authenticated using(private.hosts_party(party_id)) with check(private.hosts_party(party_id) and not private.blocked(user_id));
create policy bans_read on public.party_bans for select to authenticated using(user_id=(select auth.uid()) or private.hosts_party(party_id));
create policy bans_manage on public.party_bans for all to authenticated using(private.hosts_party(party_id)) with check(private.hosts_party(party_id) and user_id<>(select auth.uid()));
create policy attendees_read on public.party_attendees for select to authenticated using(private.can_party(party_id) and not private.blocked(user_id));
create function private.read_party_chat(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.can_party(target) and (private.hosts_party(target) or exists(select 1 from public.party_attendees a where a.party_id=target and a.user_id=auth.uid() and a.rsvp='going'));
$$;
create policy party_chat_read on public.party_messages for select to authenticated using(private.read_party_chat(party_id) and not private.blocked(user_id));
create policy party_chat_send on public.party_messages for insert to authenticated with check(user_id=(select auth.uid()) and private.in_party(party_id));
create policy party_chat_delete on public.party_messages for delete to authenticated using(user_id=(select auth.uid()) or private.hosts_party(party_id));
create policy queue_read on public.party_queue for select to authenticated using(private.can_party(party_id));
create policy queue_insert on public.party_queue for insert to authenticated with check(user_id=(select auth.uid()) and private.in_party(party_id));
create policy queue_delete on public.party_queue for delete to authenticated using(user_id=(select auth.uid()) or private.hosts_party(party_id));
create policy votes_read on public.party_votes for select to authenticated using(exists(select 1 from public.party_queue q where q.id=queue_id));
create policy votes_insert on public.party_votes for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.party_queue q where q.id=queue_id and private.in_party(q.party_id)));
create policy votes_delete on public.party_votes for delete to authenticated using(user_id=(select auth.uid()));
create policy conversations_read on public.conversations for select to authenticated using(private.can_conversation(id));
create policy conversations_create on public.conversations for insert to authenticated with check(member_a=(select auth.uid()) and private.friends(member_b));
create policy messages_read on public.messages for select to authenticated using(private.can_conversation(conversation_id));
create policy messages_send on public.messages for insert to authenticated with check(user_id=(select auth.uid()) and private.can_conversation(conversation_id));
create policy messages_delete on public.messages for delete to authenticated using(user_id=(select auth.uid()) and private.can_conversation(conversation_id));
create policy notifications_read on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy works_read on public.creator_works for select to authenticated using(private.can_work(id));
create policy works_own on public.creator_works for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy comments_read on public.work_comments for select to authenticated using(private.can_work(work_id) and not private.blocked(user_id));
create policy comments_insert on public.work_comments for insert to authenticated with check(user_id=(select auth.uid()) and private.can_work(work_id));
create policy comments_delete on public.work_comments for delete to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.creator_works w where w.id=work_id and w.user_id=(select auth.uid())));
create policy reports_read on public.reports for select to authenticated using(user_id=(select auth.uid()) or private.is_moderator());
create policy reports_insert on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');

-- Serialized RSVP prevents oversubscription under concurrent requests. Host occupies one seat.
create function private.set_rsvp(target uuid, answer text) returns text language plpgsql security definer set search_path='' as $$
declare p public.parties; assigned text; occupied integer;
begin
 if auth.uid() is null or answer not in ('going','maybe','declined') then raise exception 'Invalid RSVP' using errcode='22023'; end if;
 select * into p from public.parties where id=target for update;
 if not found or not private.can_party(target) or p.status not in ('scheduled','live') then raise exception 'Party unavailable' using errcode='42501'; end if;
 if p.host_id=auth.uid() then raise exception 'Host already participates' using errcode='22023'; end if;
 assigned:=answer;
 if answer='going' then
 select count(*)+1 into occupied from public.party_attendees a where a.party_id=target and a.rsvp='going' and a.user_id<>auth.uid()
 and not exists(select 1 from public.party_bans b where b.party_id=target and b.user_id=a.user_id);
 if occupied>=p.capacity then assigned:='waitlist'; end if;
 end if;
 insert into public.party_attendees(party_id,user_id,rsvp) values(target,auth.uid(),assigned) on conflict(party_id,user_id) do update set rsvp=excluded.rsvp;
 return assigned;
end $$;
create function public.set_party_rsvp(target uuid,answer text) returns text language sql security invoker set search_path='' as $$ select private.set_rsvp(target,answer); $$;

create function private.notify_social() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='friendships' then
 if tg_op='INSERT' then insert into public.notifications(user_id,title,destination) values(new.addressee_id,'Tenés una nueva solicitud de amistad','friends');
 elsif new.status='accepted' and old.status<>new.status then insert into public.notifications(user_id,title,destination) values(new.requester_id,'Aceptaron tu solicitud de amistad','friends'); end if;
 elsif tg_table_name='party_invites' then insert into public.notifications(user_id,title,destination) values(new.user_id,'Te invitaron a una Party','parties');
 elsif tg_table_name='messages' then insert into public.notifications(user_id,title,destination) select case when member_a=new.user_id then member_b else member_a end,'Tenés un nuevo mensaje','messages' from public.conversations where id=new.conversation_id;
 end if; return new;
end $$;
create trigger friendship_notifications after insert or update on public.friendships for each row execute function private.notify_social();
create trigger invite_notifications after insert on public.party_invites for each row execute function private.notify_social();
create trigger message_notifications after insert on public.messages for each row execute function private.notify_social();

-- Server-enforced acceptance record; editable user metadata is never authorization.
create table public.policy_acceptances(user_id uuid primary key default auth.uid() references auth.users on delete cascade, version text not null check(version='2026-11-13-beta'), accepted_at timestamptz not null default now());
alter table public.policy_acceptances enable row level security;
revoke all on public.policy_acceptances from anon, authenticated;
grant select on public.policy_acceptances to authenticated;
create policy acceptance_read on public.policy_acceptances for select to authenticated using(user_id=(select auth.uid()));
create function private.accept_policy() returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 insert into public.policy_acceptances(user_id,version) values(auth.uid(),'2026-11-13-beta') on conflict(user_id) do nothing;
end $$;
create function public.accept_policy() returns void language sql security invoker set search_path='' as $$ select private.accept_policy(); $$;

create function private.moderate_report(target uuid, decision text) returns void language plpgsql security definer set search_path='' as $$
declare r public.reports;
begin
 if not private.is_moderator() then raise exception 'Moderator required' using errcode='42501'; end if;
 if decision not in ('reviewed','dismissed','remove') then raise exception 'Invalid decision'; end if;
 select * into r from public.reports where id=target for update;
 if not found then raise exception 'Report unavailable'; end if;
 if decision='remove' then
 -- Fixed whitelist from a constrained column, never arbitrary SQL supplied by clients.
 if r.subject_type='member_cards' then update public.member_cards set discoverable=false where id=r.subject_id;
 elsif r.subject_type='parties' then update public.parties set status='cancelled' where id=r.subject_id;
 else execute format('delete from public.%I where id=$1',r.subject_type) using r.subject_id; end if;
 end if;
 update public.reports set status=case when decision='remove' then 'reviewed' else decision end where id=target;
 insert into private.moderation_log(moderator_id,report_id,action) values(auth.uid(),target,decision);
end $$;
create function public.moderate_report(target uuid,decision text) returns void language sql security invoker set search_path='' as $$ select private.moderate_report(target,decision); $$;
create function public.is_moderator() returns boolean language sql stable security invoker set search_path='' as $$ select private.is_moderator(); $$;

-- Private files remain private even when someone knows their path.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('creator-works','creator-works',false,5242880,array['image/jpeg','image/png','image/webp']);
create function private.can_asset(path text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (split_part(path,'/',1)=auth.uid()::text or exists(select 1 from public.creator_works w where w.asset_path=path and private.can_work(w.id)));
$$;
create policy works_files_read on storage.objects for select to authenticated using(bucket_id='creator-works' and private.can_asset(name));
create policy works_files_create on storage.objects for insert to authenticated with check(bucket_id='creator-works' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy works_files_delete on storage.objects for delete to authenticated using(bucket_id='creator-works' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Lock down function execution including PostgreSQL's default PUBLIC grant.
create table private.write_events(user_id uuid not null references auth.users on delete cascade, action text not null, created_at timestamptz not null default now());
create index write_events_lookup on private.write_events(user_id,created_at);
alter table private.write_events enable row level security;
create function private.throttle_write() returns trigger language plpgsql security definer set search_path='' as $$
declare recent integer;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(auth.uid()::text));
 select count(*) into recent from private.write_events where user_id=auth.uid() and created_at>now()-interval '1 minute';
 if recent>=40 then raise exception 'Demasiadas acciones. Esperá un minuto.' using errcode='P0001'; end if;
 insert into private.write_events(user_id,action) values(auth.uid(),tg_table_name);
 delete from private.write_events where user_id=auth.uid() and created_at<now()-interval '1 day';
 return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['content_items','reviews','friendships','conversations','messages','party_messages','parties','creator_works','work_comments','reports'] loop
 execute format('create trigger throttle_write before insert on public.%I for each row execute function private.throttle_write()',t);
 end loop;
end $$;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.blocked(uuid),private.friends(uuid),private.can_party(uuid),private.hosts_party(uuid),private.in_party(uuid),private.read_party_chat(uuid),private.can_conversation(uuid),private.can_work(uuid),private.is_moderator(),private.set_rsvp(uuid,text),private.accept_policy(),private.moderate_report(uuid,text),private.can_asset(text) to authenticated;
revoke all on function public.set_party_rsvp(uuid,text),public.accept_policy(),public.moderate_report(uuid,text),public.is_moderator() from public,anon;
grant execute on function public.set_party_rsvp(uuid,text),public.accept_policy(),public.moderate_report(uuid,text),public.is_moderator() to authenticated;
alter publication supabase_realtime add table public.messages,public.party_messages,public.notifications,public.party_attendees,public.parties,public.friendships,public.party_queue,public.party_votes;
