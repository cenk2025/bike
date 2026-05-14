-- 2026-05-14: Admin role + editable homepage advertising slots.
--
-- Run this in the Supabase SQL editor. Then create a public storage bucket
-- named `ad-images` (see the policy block at the bottom of this file).

------------------------------------------------------------------------------
-- 1. profiles: one row per auth user, carries the is_admin flag
------------------------------------------------------------------------------
create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    email       text,
    is_admin    boolean      not null default false,
    created_at  timestamptz  not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read their own profile (the admin check uses this row).
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
    for select using (auth.uid() = id);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before this migration.
insert into public.profiles (id, email)
    select id, email from auth.users
on conflict (id) do nothing;

-- Promote the project owner to admin.
update public.profiles
    set is_admin = true
    where email = 'cenk.yakinlar@hotmail.com';

------------------------------------------------------------------------------
-- 2. ad_slots: editable content for the two homepage CTA boxes
------------------------------------------------------------------------------
create table if not exists public.ad_slots (
    slug        text primary key,                         -- 'insurance' | 'premium'
    eyebrow     text,                                     -- small label above the title
    title       text         not null,
    description text,
    image_url   text,                                     -- optional ad image
    cta_label   text,
    cta_href    text,                                     -- mailto: or https:
    is_active   boolean      not null default true,
    updated_at  timestamptz  not null default now(),
    updated_by  uuid         references auth.users(id)
);

alter table public.ad_slots enable row level security;

-- Anyone (including anonymous visitors) can read active slots.
drop policy if exists "ad_slots public read" on public.ad_slots;
create policy "ad_slots public read" on public.ad_slots
    for select using (is_active = true);

-- Admins (and only admins) can insert / update / delete.
drop policy if exists "ad_slots admin write" on public.ad_slots;
create policy "ad_slots admin write" on public.ad_slots
    for all using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true
        )
    ) with check (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true
        )
    );

-- Bump updated_at automatically.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists ad_slots_touch on public.ad_slots;
create trigger ad_slots_touch
    before update on public.ad_slots
    for each row execute function public.touch_updated_at();

-- Seed the two slots with the same copy that ships in FeaturedSections.tsx
-- so the homepage looks identical even before an admin edits anything.
insert into public.ad_slots (slug, eyebrow, title, description, cta_label, cta_href) values
    (
        'insurance',
        'Mielenrauha',
        'Mainosmahdollisuudet vakuutusyhtiöille',
        'CycleFound auttaa pyöräilijöitä saamaan pyöränsä takaisin — ja vakuutusyhtiöitä vähentämään korvauskuluja. Etsimme kumppaneita rakentamaan turvallisempaa pyöräily-Suomea yhdessä.',
        'Ota yhteyttä kumppanuudesta',
        'mailto:info@voon.fi?subject=Mainoskumppanuus%20%E2%80%93%20vakuutusyhti%C3%B6'
    ),
    (
        'premium',
        'PREMIUM-MAINOSPAIKKA — VAPAA',
        'Bränditila pyörä- ja moottoripyöräyhtiöille',
        'Premium-sijoittelu CycleFoundin etusivulla. Tavoita ostohaluiset pyöräilijät juuri silloin, kun he tutkivat pyöriinsä liittyviä palveluita.',
        'Varaa mainospaikka',
        'mailto:info@voon.fi?subject=Premium-mainospaikka%20%E2%80%93%20py%C3%B6r%C3%A4-%2Fmoottoripy%C3%B6r%C3%A4yhti%C3%B6'
    )
on conflict (slug) do nothing;

------------------------------------------------------------------------------
-- 3. Storage bucket `ad-images` (run in the Supabase Storage UI OR as SQL)
------------------------------------------------------------------------------
-- In the dashboard:  Storage → New bucket → name: ad-images → Public: ON
-- Then add these two policies under the bucket's "Policies" tab:
--
--   • READ  (public):  bucket_id = 'ad-images'
--   • WRITE (admins):  bucket_id = 'ad-images'
--                      AND exists (
--                          select 1 from public.profiles p
--                          where p.id = auth.uid() and p.is_admin = true
--                      )
--
-- Or, equivalently, run these statements:

insert into storage.buckets (id, name, public)
    values ('ad-images', 'ad-images', true)
on conflict (id) do nothing;

drop policy if exists "ad-images public read" on storage.objects;
create policy "ad-images public read" on storage.objects
    for select using (bucket_id = 'ad-images');

drop policy if exists "ad-images admin write" on storage.objects;
create policy "ad-images admin write" on storage.objects
    for all using (
        bucket_id = 'ad-images' and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true
        )
    ) with check (
        bucket_id = 'ad-images' and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true
        )
    );
