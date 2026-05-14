-- 2026-05-14: Add owner contact preferences to the bikes table.
--
-- The bike report form lets the owner opt in to being contacted directly if
-- someone finds their bike, and pick which channel(s) they want to share.
-- Run this in the Supabase SQL editor (or via `supabase db push`) before
-- deploying the updated app — the inserts/updates will otherwise fail with
-- "column does not exist".

alter table public.bikes
    add column if not exists allow_contact boolean      not null default false,
    add column if not exists contact_email text,
    add column if not exists contact_phone text;

-- Keep the existing RLS policies as-is: owners can read/write their own rows,
-- and the public-read policy that powers the homepage / loydetyt list will
-- now also expose contact_email and contact_phone — that is intentional,
-- because they were only populated when the owner ticked allow_contact.
