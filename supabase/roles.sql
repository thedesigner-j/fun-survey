-- Owner + Editor roles. Run once in Supabase → SQL Editor → New query → Run (after schema.sql).
-- Safe to run again.
--
-- Owner  (admins table): everything, plus managing the team and deleting responses.
-- Editor (editors table): questions, intro/thanks, illustrations, viewing responses.
-- Owners add editors by email from the admin's Team tab — no SQL needed after this.

-- ───────────── Editors ─────────────
create table if not exists public.editors (
  email text primary key check (email = lower(email) and email like '%_@_%'),
  added_at timestamptz not null default now()
);
alter table public.editors enable row level security;

create or replace function public.is_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.editors where email = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.can_edit()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin() or public.is_editor();
$$;

create or replace function public.my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select case when public.is_admin() then 'owner' when public.is_editor() then 'editor' end;
$$;

drop policy if exists "owners manage editors" on public.editors;
create policy "owners manage editors" on public.editors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, delete on public.editors to authenticated;
grant execute on function public.is_editor(), public.can_edit(), public.my_role() to authenticated;

-- ───────────── Questions ─────────────
drop policy if exists "anyone reads active questions" on public.questions;
create policy "anyone reads active questions" on public.questions
  for select using (active or public.can_edit());

drop policy if exists "admins manage questions" on public.questions;
create policy "admins manage questions" on public.questions
  for all to authenticated using (public.can_edit()) with check (public.can_edit());

-- ───────────── Intro / outro settings ─────────────
drop policy if exists "admins update settings" on public.settings;
create policy "admins update settings" on public.settings
  for update to authenticated using (public.can_edit()) with check (public.can_edit());

-- ───────────── Responses (editors view, only owners delete) ─────────────
drop policy if exists "admins read responses" on public.responses;
create policy "admins read responses" on public.responses
  for select to authenticated using (public.can_edit());

-- ───────────── Illustration uploads ─────────────
drop policy if exists "admins list illustrations" on storage.objects;
create policy "admins list illustrations" on storage.objects
  for select to authenticated using (bucket_id = 'illustrations' and public.can_edit());

drop policy if exists "admins upload illustrations" on storage.objects;
create policy "admins upload illustrations" on storage.objects
  for insert to authenticated with check (bucket_id = 'illustrations' and public.can_edit());

drop policy if exists "admins delete illustrations" on storage.objects;
create policy "admins delete illustrations" on storage.objects
  for delete to authenticated using (bucket_id = 'illustrations' and public.can_edit());
