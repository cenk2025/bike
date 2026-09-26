-- 2026-09-26: Automatic matching, privacy hardening, pre-registration, real
-- statistics and in-app messaging.
--
-- Run this whole file once in the Supabase SQL editor BEFORE deploying the
-- matching frontend. It is written to be re-runnable.
--
-- What it does:
--   1. bikes: new columns (color, city, event_date, police report number,
--      finder_email, is_demo, serial_normalized) and a new status
--      'rekisteröity' (bike registered in advance, not stolen).
--      Drops any UNIQUE constraint on serial_number – a found bike and the
--      matching stolen bike MUST be able to carry the same serial.
--   2. Privacy: the bikes table is no longer publicly readable. Public pages
--      read the column-limited view `bikes_public`, which never exposes
--      contact details, finder e-mail or serial numbers.
--   3. bike_messages: visitors contact an owner/finder through CycleFound
--      instead of seeing their e-mail / phone.
--   4. bike_matches + trigger: every insert/update scores the bike against
--      the opposite side (stolen/registered <-> found) and stores likely
--      matches. Owners see them on their dashboard via my_matches().
--   5. RPCs: public_stats(), search_bikes(q), check_serial(serial).
--   6. Basic abuse protection (rate limits) for anonymous inserts.

create extension if not exists pg_trgm with schema extensions;

------------------------------------------------------------------------------
-- 0. Helpers
------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.is_admin = true
    );
$$;

-- Canonical form of a serial / frame number used for matching:
-- upper-case, only A-Z0-9, and the look-alikes O->0, I->1, L->1 folded
-- together so "wtu 0I23-45" and "WTU012345" compare equal.
-- Anything shorter than 4 characters is treated as "unknown".
create or replace function public.normalize_serial(s text)
returns text
language sql immutable parallel safe
as $$
    select case
        when length(x) < 4 then null
        else x
    end
    from (
        select translate(regexp_replace(upper(coalesce(s, '')), '[^A-Z0-9]', '', 'g'), 'OIL', '011') as x
    ) t;
$$;

------------------------------------------------------------------------------
-- 1. bikes: schema changes
------------------------------------------------------------------------------
do $$
declare
    r record;
begin
    -- status may have been created as an enum; switch to text so new
    -- statuses can be added without enum migrations.
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'bikes'
          and column_name = 'status' and data_type = 'USER-DEFINED'
    ) then
        execute 'alter table public.bikes alter column status type text using status::text';
    end if;

    -- Drop old CHECK constraints on status (re-created below with the new value).
    for r in
        select conname from pg_constraint
        where conrelid = 'public.bikes'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%status%'
    loop
        execute format('alter table public.bikes drop constraint %I', r.conname);
    end loop;

    -- Drop UNIQUE constraints / indexes on serial_number.
    for r in
        select con.conname
        from pg_constraint con
        join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
        where con.conrelid = 'public.bikes'::regclass
          and con.contype = 'u'
          and a.attname = 'serial_number'
    loop
        execute format('alter table public.bikes drop constraint %I', r.conname);
    end loop;

    for r in
        select indexname from pg_indexes
        where schemaname = 'public' and tablename = 'bikes'
          and indexdef ilike 'create unique index%(serial_number)%'
    loop
        execute format('drop index if exists public.%I', r.indexname);
    end loop;
end $$;

alter table public.bikes alter column serial_number drop not null;
alter table public.bikes alter column user_id drop not null;
-- A finder rarely knows the model (or even the brand) of a found bike.
alter table public.bikes alter column brand drop not null;
alter table public.bikes alter column model drop not null;
alter table public.bikes alter column type drop not null;
alter table public.bikes alter column location drop not null;
alter table public.bikes alter column image_url drop not null;

alter table public.bikes
    add column if not exists description          text,
    add column if not exists images               text[],
    add column if not exists color                text,
    add column if not exists city                 text,
    add column if not exists event_date           date,         -- stolen / found date
    add column if not exists police_report_number text,         -- rikosilmoituksen numero
    add column if not exists finder_email         text,         -- private: anonymous finder's e-mail
    add column if not exists recovered_at         timestamptz,
    add column if not exists is_demo              boolean not null default false;

alter table public.bikes
    add column if not exists serial_normalized text
    generated always as (public.normalize_serial(serial_number)) stored;

alter table public.bikes
    add constraint bikes_status_check
    check (status in ('varastettu', 'ilmoitettu', 'löytynyt', 'rekisteröity')) not valid;

create index if not exists bikes_serial_normalized_idx on public.bikes (serial_normalized);
create index if not exists bikes_status_idx on public.bikes (status);

-- Old found reports got a random "FOUND-XXXX" serial – that is not a real
-- serial and would only add noise, so clear it.
update public.bikes set serial_number = null where serial_number like 'FOUND-%';

-- Backfill city from the free-text location ("Mannerheimintie 10, Helsinki").
update public.bikes
    set city = initcap(trim(regexp_replace(location, '^.*,', '')))
    where city is null and coalesce(location, '') <> '';

------------------------------------------------------------------------------
-- 2. bikes: row level security (reset to a known-good set)
------------------------------------------------------------------------------
alter table public.bikes enable row level security;

do $$
declare
    r record;
begin
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'bikes'
    loop
        execute format('drop policy %I on public.bikes', r.policyname);
    end loop;
end $$;

-- Only the owner and admins can read full rows (contact info, serial, ...).
create policy "bikes owner read" on public.bikes
    for select using (user_id = auth.uid() or public.is_admin());

-- Logged-in users can report their own bikes; anyone (also anonymous) can
-- report a FOUND bike.
create policy "bikes insert" on public.bikes
    for insert with check (
        (auth.uid() is not null and user_id = auth.uid()
            and status in ('varastettu', 'rekisteröity', 'ilmoitettu'))
        or (user_id is null and status = 'ilmoitettu')
    );

create policy "bikes owner update" on public.bikes
    for update using (user_id = auth.uid() or public.is_admin())
    with check (user_id = auth.uid() or public.is_admin());

create policy "bikes owner delete" on public.bikes
    for delete using (user_id = auth.uid() or public.is_admin());

-- Public, column-limited view. It runs with the view owner's rights (so it
-- is not filtered by the RLS above) but only exposes non-sensitive columns
-- and never shows pre-registered bikes.
create or replace view public.bikes_public as
    select
        id, brand, model, type, color, city, location, status,
        image_url, images, description, event_date, created_at, is_demo,
        (serial_normalized is not null) as has_serial
    from public.bikes
    where status in ('varastettu', 'ilmoitettu', 'löytynyt');

grant select on public.bikes_public to anon, authenticated;

------------------------------------------------------------------------------
-- 3. bike_matches and bike_messages (FK type follows bikes.id)
------------------------------------------------------------------------------
do $$
declare
    idtype text;
begin
    select format_type(a.atttypid, a.atttypmod) into idtype
    from pg_attribute a
    where a.attrelid = 'public.bikes'::regclass and a.attname = 'id';

    execute format($f$
        create table if not exists public.bike_matches (
            id            bigint generated always as identity primary key,
            lost_bike_id  %1$s not null references public.bikes(id) on delete cascade,
            found_bike_id %1$s not null references public.bikes(id) on delete cascade,
            score         int not null,
            reasons       text[] not null default '{}',
            status        text not null default 'uusi'
                          check (status in ('uusi', 'vahvistettu', 'hylatty')),
            created_at    timestamptz not null default now(),
            unique (lost_bike_id, found_bike_id)
        )$f$, idtype);

    execute format($f$
        create table if not exists public.bike_messages (
            id             bigint generated always as identity primary key,
            bike_id        %1$s not null references public.bikes(id) on delete cascade,
            sender_user_id uuid default auth.uid() references auth.users(id) on delete set null,
            sender_name    text not null check (char_length(sender_name) between 1 and 100),
            sender_email   text not null check (char_length(sender_email) <= 200
                                                and sender_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
            sender_phone   text check (char_length(sender_phone) <= 40),
            body           text not null check (char_length(body) between 5 and 2000),
            read_at        timestamptz,
            created_at     timestamptz not null default now()
        )$f$, idtype);
end $$;

create index if not exists bike_matches_lost_idx  on public.bike_matches (lost_bike_id);
create index if not exists bike_matches_found_idx on public.bike_matches (found_bike_id);
create index if not exists bike_messages_bike_idx on public.bike_messages (bike_id);

alter table public.bike_matches  enable row level security;
alter table public.bike_messages enable row level security;

drop policy if exists "matches read" on public.bike_matches;
create policy "matches read" on public.bike_matches
    for select using (
        public.is_admin()
        or exists (select 1 from public.bikes b where b.id = lost_bike_id  and b.user_id = auth.uid())
        or exists (select 1 from public.bikes b where b.id = found_bike_id and b.user_id = auth.uid())
    );

-- The owner of the lost bike confirms / rejects a suggested match.
drop policy if exists "matches owner update" on public.bike_matches;
create policy "matches owner update" on public.bike_matches
    for update using (
        public.is_admin()
        or exists (select 1 from public.bikes b where b.id = lost_bike_id and b.user_id = auth.uid())
    );

drop policy if exists "messages insert" on public.bike_messages;
create policy "messages insert" on public.bike_messages
    for insert with check (true);   -- validated by bike_messages_guard()

drop policy if exists "messages owner read" on public.bike_messages;
create policy "messages owner read" on public.bike_messages
    for select using (
        public.is_admin()
        or exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = auth.uid())
    );

drop policy if exists "messages owner update" on public.bike_messages;
create policy "messages owner update" on public.bike_messages
    for update using (
        public.is_admin()
        or exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = auth.uid())
    );

drop policy if exists "messages owner delete" on public.bike_messages;
create policy "messages owner delete" on public.bike_messages
    for delete using (
        public.is_admin()
        or exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = auth.uid())
    );

------------------------------------------------------------------------------
-- 4. Abuse protection
------------------------------------------------------------------------------
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
        where b.id = new.bike_id and b.status in ('varastettu', 'ilmoitettu')
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

drop trigger if exists bike_messages_guard on public.bike_messages;
create trigger bike_messages_guard
    before insert on public.bike_messages
    for each row execute function public.bike_messages_guard();

create or replace function public.bikes_insert_guard()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
    if new.user_id is null then
        if (select count(*) from public.bikes
            where user_id is null and created_at > now() - interval '10 minutes') >= 30 then
            raise exception 'Palvelu on juuri nyt ruuhkainen. Yritä hetken kuluttua uudelleen.';
        end if;
        if new.finder_email is not null and (
            select count(*) from public.bikes
            where lower(finder_email) = lower(new.finder_email)
              and created_at > now() - interval '1 hour') >= 5 then
            raise exception 'Liian monta ilmoitusta lyhyessä ajassa. Yritä myöhemmin uudelleen.';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists bikes_insert_guard on public.bikes;
create trigger bikes_insert_guard
    before insert on public.bikes
    for each row execute function public.bikes_insert_guard();

------------------------------------------------------------------------------
-- 5. Matching
------------------------------------------------------------------------------
-- Scores a (lost/registered, found) pair. >= 50 is stored as a match.
create or replace function public.bike_match_score(
    l public.bikes, f public.bikes,
    out score int, out reasons text[]
)
language plpgsql stable
set search_path = public, extensions
as $$
declare
    l_brand text := lower(trim(coalesce(l.brand, '')));
    f_brand text := lower(trim(coalesce(f.brand, '')));
    l_model text := lower(trim(coalesce(l.model, '')));
    f_model text := lower(trim(coalesce(f.model, '')));
    f_text  text := lower(coalesce(f.brand, '') || ' ' || coalesce(f.model, '') || ' ' || coalesce(f.description, ''));
    l_city  text := lower(trim(coalesce(l.city, '')));
    f_city  text := lower(trim(coalesce(f.city, '')));
    l_date  date := coalesce(l.event_date, l.created_at::date);
    f_date  date := coalesce(f.event_date, f.created_at::date);
begin
    score := 0;
    reasons := '{}';

    -- Serial / frame number: the strongest signal in both directions.
    if l.serial_normalized is not null and f.serial_normalized is not null then
        if l.serial_normalized = f.serial_normalized then
            score := score + 100;
            reasons := reasons || 'Sarjanumero täsmää'::text;
        else
            score := score - 60;
        end if;
    end if;

    if l_brand <> '' and f_brand <> '' then
        if l_brand = f_brand then
            score := score + 25;
            reasons := reasons || 'Sama merkki'::text;
        elsif position(l_brand in f_text) > 0 or similarity(l_brand, f_brand) > 0.4 then
            score := score + 15;
            reasons := reasons || 'Samankaltainen merkki'::text;
        end if;
    end if;

    if length(l_model) >= 2 and l_model <> 'unknown' then
        if l_model = f_model then
            score := score + 15;
            reasons := reasons || 'Sama malli'::text;
        elsif length(l_model) >= 3 and position(l_model in f_text) > 0 then
            score := score + 10;
            reasons := reasons || 'Malli mainittu kuvauksessa'::text;
        end if;
    end if;

    if coalesce(l.color, '') <> '' then
        if lower(trim(l.color)) = lower(trim(coalesce(f.color, ''))) then
            score := score + 10;
            reasons := reasons || 'Sama väri'::text;
        elsif position(lower(trim(l.color)) in f_text) > 0 then
            score := score + 5;
            reasons := reasons || 'Väri mainittu kuvauksessa'::text;
        end if;
    end if;

    if coalesce(l.type, '') not in ('', 'Muu') and l.type = f.type then
        score := score + 5;
        reasons := reasons || 'Sama tyyppi'::text;
    end if;

    if l_city <> '' then
        if l_city = f_city then
            score := score + 15;
            reasons := reasons || 'Sama kaupunki'::text;
        elsif position(l_city in lower(coalesce(f.location, ''))) > 0 then
            score := score + 10;
            reasons := reasons || 'Löytöpaikka samalla alueella'::text;
        end if;
    end if;

    -- A bike can't be found (much) before it went missing. Pre-registered
    -- bikes have no loss date, so skip the time checks for them.
    if l.status = 'varastettu' then
        if f_date < l_date - 3 then
            score := score - 40;
        elsif f_date <= l_date + 60 then
            score := score + 5;
            reasons := reasons || 'Ajallisesti lähellä'::text;
        end if;
    end if;
end;
$$;

-- Recomputes unreviewed matches for one bike. Reviewed matches
-- ('vahvistettu' / 'hylatty') are kept as they are.
--
-- NOTE: this scans all bikes on the opposite side. That is fine for tens of
-- thousands of rows; beyond that, pre-filter by serial / brand / city.
create or replace function public.refresh_bike_matches(p_bike_id public.bikes.id%type)
returns void
language plpgsql security definer
set search_path = public, extensions
as $$
declare
    b public.bikes;
    o public.bikes;
    s record;
begin
    delete from public.bike_matches
        where status = 'uusi'
          and (lost_bike_id = p_bike_id or found_bike_id = p_bike_id);

    select * into b from public.bikes where id = p_bike_id;
    if not found then
        return;
    end if;

    if b.status in ('varastettu', 'rekisteröity') then
        for o in select * from public.bikes where status = 'ilmoitettu' and id <> b.id loop
            select * into s from public.bike_match_score(b, o);
            if s.score >= 50 then
                insert into public.bike_matches (lost_bike_id, found_bike_id, score, reasons)
                    values (b.id, o.id, s.score, s.reasons)
                    on conflict (lost_bike_id, found_bike_id) do nothing;
            end if;
        end loop;
    elsif b.status = 'ilmoitettu' then
        for o in select * from public.bikes where status in ('varastettu', 'rekisteröity') and id <> b.id loop
            select * into s from public.bike_match_score(o, b);
            if s.score >= 50 then
                insert into public.bike_matches (lost_bike_id, found_bike_id, score, reasons)
                    values (o.id, b.id, s.score, s.reasons)
                    on conflict (lost_bike_id, found_bike_id) do nothing;
            end if;
        end loop;
    end if;
end;
$$;

create or replace function public.bikes_after_change()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
    perform public.refresh_bike_matches(new.id);

    -- Owner marked the bike recovered: stamp it and close the found
    -- report(s) of every match the owner confirmed.
    if new.status = 'löytynyt' and (tg_op = 'INSERT' or old.status is distinct from 'löytynyt') then
        update public.bikes set recovered_at = now()
            where id = new.id and recovered_at is null;

        update public.bikes f
            set status = 'löytynyt', recovered_at = now()
            from public.bike_matches m
            where m.lost_bike_id = new.id
              and m.status = 'vahvistettu'
              and f.id = m.found_bike_id
              and f.status = 'ilmoitettu';
    end if;

    return null;
end;
$$;

drop trigger if exists bikes_match_trg on public.bikes;
create trigger bikes_match_trg
    after insert or update of serial_number, brand, model, type, color, city,
                              location, status, event_date, description
    on public.bikes
    for each row execute function public.bikes_after_change();

-- Internal helpers: not callable from the browser.
revoke execute on function public.refresh_bike_matches from public, anon, authenticated;
revoke execute on function public.bike_match_score from public, anon, authenticated;

-- Matches for the current user, joined with the *other* bike's public data.
-- For the finder side we only reveal what the owner already made public.
create or replace function public.my_matches()
returns table (
    match_id        bigint,
    score           int,
    reasons         text[],
    match_status    text,
    created_at      timestamptz,
    my_role         text,          -- 'omistaja' | 'löytäjä'
    my_bike_id      text,
    my_bike_label   text,
    other_bike_id   text,
    other_brand     text,
    other_model     text,
    other_type      text,
    other_color     text,
    other_city      text,
    other_location  text,
    other_image_url text,
    other_description text,
    other_event_date  date
)
language sql stable security definer
set search_path = public
as $$
    select
        m.id, m.score, m.reasons, m.status, m.created_at,
        'omistaja'::text,
        l.id::text, concat_ws(' ', l.brand, l.model)::text,
        f.id::text, f.brand::text, f.model::text, f.type::text, f.color::text,
        f.city::text, f.location::text, f.image_url::text, f.description::text, f.event_date
    from public.bike_matches m
    join public.bikes l on l.id = m.lost_bike_id
    join public.bikes f on f.id = m.found_bike_id
    where l.user_id = auth.uid()
    union all
    select
        m.id, m.score, m.reasons, m.status, m.created_at,
        'löytäjä'::text,
        f.id::text, concat_ws(' ', f.brand, f.model)::text,
        l.id::text, l.brand::text, l.model::text, l.type::text, l.color::text,
        null, null, null, null, null
    from public.bike_matches m
    join public.bikes l on l.id = m.lost_bike_id
    join public.bikes f on f.id = m.found_bike_id
    where f.user_id = auth.uid() and m.status <> 'hylatty'
    order by 2 desc;
$$;

grant execute on function public.my_matches() to authenticated;

------------------------------------------------------------------------------
-- 6. Public RPCs
------------------------------------------------------------------------------
create or replace function public.public_stats()
returns json
language sql stable security definer
set search_path = public
as $$
    select json_build_object(
        'recovered',      (select count(*) from public.bikes where status = 'löytynyt'),
        'stolen_active',  (select count(*) from public.bikes where status = 'varastettu'),
        'found_reports',  (select count(*) from public.bikes where status = 'ilmoitettu'),
        'registered',     (select count(*) from public.bikes where status = 'rekisteröity'),
        'reported_today', (select count(*) from public.bikes
                            where status in ('varastettu', 'ilmoitettu')
                              and created_at >= date_trunc('day', now())),
        'matches',        (select count(*) from public.bike_matches where status <> 'hylatty'),
        'users',          (select count(*) from public.profiles)
    );
$$;

grant execute on function public.public_stats() to anon, authenticated;

-- Free-text search over public bikes. A serial number only matches when the
-- whole (normalised) serial is given – partial serials are not searchable so
-- serials can't be enumerated.
create or replace function public.search_bikes(q text, max_results int default 24)
returns setof public.bikes_public
language sql stable security definer
set search_path = public
as $$
    with input as (
        select
            trim(coalesce(q, '')) as raw,
            '%' || replace(replace(replace(trim(coalesce(q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pat,
            public.normalize_serial(q) as serial
    )
    select bp.*
    from public.bikes_public bp
    join public.bikes b on b.id = bp.id
    cross join input i
    where length(i.raw) >= 2
      and (
            (i.serial is not null and b.serial_normalized = i.serial)
            or bp.brand    ilike i.pat
            or bp.model    ilike i.pat
            or bp.location ilike i.pat
            or bp.city     ilike i.pat
            or bp.color    ilike i.pat
      )
    order by (i.serial is not null and b.serial_normalized = i.serial) desc, bp.created_at desc
    limit least(greatest(coalesce(max_results, 24), 1), 50);
$$;

grant execute on function public.search_bikes(text, int) to anon, authenticated;

-- "Check before you buy": is this serial reported stolen / found / registered?
create or replace function public.check_serial(p_serial text)
returns table (
    status      text,
    brand       text,
    model       text,
    type        text,
    color       text,
    city        text,
    event_date  date,
    reported_at timestamptz
)
language sql stable security definer
set search_path = public
as $$
    select
        b.status::text,
        b.brand::text,
        b.model::text,
        b.type::text,
        b.color::text,
        case when b.status = 'rekisteröity' then null else b.city::text end,
        case when b.status = 'rekisteröity' then null else b.event_date end,
        b.created_at::timestamptz
    from public.bikes b
    where public.normalize_serial(p_serial) is not null
      and b.serial_normalized = public.normalize_serial(p_serial)
      and b.status in ('varastettu', 'ilmoitettu', 'rekisteröity')
    order by b.created_at desc
    limit 5;
$$;

grant execute on function public.check_serial(text) to anon, authenticated;

------------------------------------------------------------------------------
-- 7. Stories: demo flag (used by migrations/demo_seed.sql)
------------------------------------------------------------------------------
alter table if exists public.stories
    add column if not exists is_demo boolean not null default false;

------------------------------------------------------------------------------
-- 8. Compute matches for existing data
------------------------------------------------------------------------------
select public.refresh_bike_matches(id) from public.bikes where status in ('varastettu', 'rekisteröity');
