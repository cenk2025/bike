-- 2026-10-09: Let users delete their own account from the mobile app.
--
-- Apple requires apps that support account creation to also offer account
-- deletion in-app (App Store Review Guideline 5.1.1(v)). Run once in the
-- Supabase SQL editor. Re-runnable.
--
-- The user's bikes and stories are deleted explicitly (which also removes
-- their matches and messages); deleting the auth user then cascades to
-- profiles and push_subscriptions.

create or replace function public.delete_my_account()
returns void
language plpgsql security definer
set search_path = public
as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then
        raise exception 'Not signed in';
    end if;

    delete from public.bikes where user_id = uid;
    delete from public.stories where user_id = uid;
    delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account from public, anon;
grant execute on function public.delete_my_account to authenticated;
