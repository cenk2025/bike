-- 2026-09-27: QR tags, web push subscriptions and data retention.
--
-- Run in the Supabase SQL editor after 2026-09-26_matching_privacy_stats.sql.
-- Re-runnable.
--
--   1. bikes.tag_code – short code printed on a QR sticker. Scanning it opens
--      /q/<code>, where the finder can message the owner without an account
--      (also for pre-registered bikes that are not public).
--   2. push_subscriptions – browser push endpoints per user (PWA
--      notifications, sent by supabase/functions/notify-owner).
--   3. purge_old_data() + daily pg_cron job – enforces the retention periods
--      promised in the privacy policy (/tietosuoja).

------------------------------------------------------------------------------
-- 1. QR tags
------------------------------------------------------------------------------
-- 10 characters from an alphabet without look-alikes (no 0/O, 1/I/L).
create or replace function public.gen_tag_code()
returns text
language plpgsql volatile
as $$
declare
    alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    code text := '';
begin
    for i in 1..10 loop
        code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    return code;
end;
$$;

alter table public.bikes add column if not exists tag_code text;
update public.bikes set tag_code = public.gen_tag_code() where tag_code is null;
alter table public.bikes alter column tag_code set default public.gen_tag_code();
create unique index if not exists bikes_tag_code_idx on public.bikes (tag_code);

-- Public lookup for the QR landing page. Returns no personal data.
create or replace function public.bike_by_tag(p_code text)
returns table (
    id         text,
    brand      text,
    model      text,
    type       text,
    color      text,
    status     text,
    image_url  text
)
language sql stable security definer
set search_path = public
as $$
    select b.id::text, b.brand::text, b.model::text, b.type::text, b.color::text,
           b.status::text, b.image_url::text
    from public.bikes b
    where b.tag_code = upper(trim(p_code))
      and b.user_id is not null
    limit 1;
$$;

grant execute on function public.bike_by_tag(text) to anon, authenticated;

-- Messages may now also be sent to pre-registered bikes (via their QR tag).
create or replace function public.bike_messages_guard()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
    new.sender_user_id := auth.uid();   -- cannot be spoofed by the client
    new.read_at := null;

    if not exists (
        select 1 from public.bikes b
        where b.id = new.bike_id and b.status in ('varastettu', 'ilmoitettu', 'rekisteröity')
    ) and not public.is_admin() then
        raise exception 'Tälle ilmoitukselle ei voi lähettää viestiä.';
    end if;

    if (select count(*) from public.bike_messages
        where lower(sender_email) = lower(new.sender_email)
          and created_at > now() - interval '1 hour') >= 5 then
        raise exception 'Liian monta viestiä. Yritä myöhemmin uudelleen.';
    end if;

    if (select count(*) from public.bike_messages
        where bike_id = new.bike_id
          and created_at > now() - interval '1 day') >= 20 then
        raise exception 'Tälle ilmoitukselle on lähetetty liikaa viestejä tänään.';
    end if;

    return new;
end;
$$;

------------------------------------------------------------------------------
-- 2. Web push subscriptions
------------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
    id         bigint generated always as identity primary key,
    user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
    endpoint   text not null unique,
    p256dh     text not null,
    auth       text not null,
    created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push own" on public.push_subscriptions;
create policy "push own" on public.push_subscriptions
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- 3. Data retention (see /tietosuoja, section 6)
------------------------------------------------------------------------------
create or replace function public.purge_old_data()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
    delete from public.bike_messages
        where created_at < now() - interval '12 months';

    -- Anonymous found reports.
    delete from public.bikes
        where user_id is null
          and status in ('ilmoitettu', 'löytynyt')
          and created_at < now() - interval '12 months';

    -- Recovered bikes: keep for two years after recovery.
    delete from public.bikes
        where status = 'löytynyt'
          and coalesce(recovered_at, created_at) < now() - interval '2 years';
end;
$$;

revoke execute on function public.purge_old_data from public, anon, authenticated;

-- Daily at 03:17 UTC. pg_cron must be enabled (Database -> Extensions);
-- if it is not available the migration still succeeds and prints a notice.
do $$
begin
    create extension if not exists pg_cron;
    perform cron.schedule('cyclefound-purge-old-data', '17 3 * * *', 'select public.purge_old_data()');
exception when others then
    raise notice 'pg_cron not available (%). Enable it and re-run this block to schedule purge_old_data().', sqlerrm;
end $$;
