create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (char_length(display_name) <= 50),
 username text not null default '' check (username = '' or username ~ '^[a-z0-9_]{3,24}$'),
 bio text not null default '' check (char_length(bio) <= 280),
 avatar_base smallint not null default 0 check (avatar_base between 0 and 5),
 avatar_color text not null default '#a5c86a' check (avatar_color ~ '^#[0-9a-fA-F]{6}$'),
 interests text[] not null default '{}' check (cardinality(interests) <= 8 and interests <@ array['Música','Cine y series','Libros','Videojuegos','Anime y manga','Arte','Podcasts','Documentales']::text[]),
 onboarding_step smallint not null default 0 check (onboarding_step between 0 and 3),
 onboarding_complete boolean not null default false,
 activity_visible boolean not null default false,
 created_at timestamptz not null default now(),
 check (not onboarding_complete or (char_length(trim(display_name)) > 0 and username <> ''))
);
create unique index profiles_username_unique on public.profiles(username) where username <> '';
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
comment on table public.profiles is 'Private onboarding profiles. Public community profiles require a separate explicit access model.';
