-- Fun Survey — run this whole file once in Supabase → SQL Editor → New query → Run.

-- ───────────── Admins ─────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ───────────── Questions ─────────────
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  type text not null default 'single'
    check (type in ('single', 'multi', 'text', 'rating', 'slider')),
  title text not null default 'New question',
  subtitle text not null default '',
  options jsonb not null default '[]'::jsonb,
  illustration text not null default 'fries',
  color text not null default '#FFC72C',
  required boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.questions enable row level security;

drop policy if exists "anyone reads active questions" on public.questions;
create policy "anyone reads active questions" on public.questions
  for select using (active or public.is_admin());

drop policy if exists "admins manage questions" on public.questions;
create policy "admins manage questions" on public.questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── Intro / outro settings (single row) ─────────────
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  intro_title text not null default 'Hey, got a sec? 🍔',
  intro_subtitle text not null default 'Five quick questions. Faster than the drive-thru, promise.',
  intro_button text not null default 'Let''s go',
  intro_illustration text not null default 'burger',
  intro_color text not null default '#FFC72C',
  outro_title text not null default 'Thanks a bunch!',
  outro_subtitle text not null default 'Your answers are in. We read every single one.',
  outro_illustration text not null default 'cone',
  outro_color text not null default '#DA291C'
);
insert into public.settings (id) values (1) on conflict (id) do nothing;
alter table public.settings enable row level security;

drop policy if exists "anyone reads settings" on public.settings;
create policy "anyone reads settings" on public.settings for select using (true);

drop policy if exists "admins update settings" on public.settings;
create policy "admins update settings" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── Responses ─────────────
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  answers jsonb not null check (pg_column_size(answers) < 20000)
);
alter table public.responses enable row level security;

drop policy if exists "anyone submits" on public.responses;
create policy "anyone submits" on public.responses
  for insert to anon, authenticated with check (true);

drop policy if exists "admins read responses" on public.responses;
create policy "admins read responses" on public.responses
  for select to authenticated using (public.is_admin());

drop policy if exists "admins delete responses" on public.responses;
create policy "admins delete responses" on public.responses
  for delete to authenticated using (public.is_admin());

-- ───────────── Grants ─────────────
grant usage on schema public to anon, authenticated;
grant select on public.questions, public.settings to anon, authenticated;
grant insert on public.responses to anon, authenticated;
grant insert, update, delete on public.questions to authenticated;
grant update on public.settings to authenticated;
grant select, delete on public.responses to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Live responses in the admin dashboard
do $$
begin
  alter publication supabase_realtime add table public.responses;
exception when duplicate_object then null;
end $$;

-- ───────────── Illustration uploads ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('illustrations', 'illustrations', true, 5242880,
        array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "admins list illustrations" on storage.objects;
create policy "admins list illustrations" on storage.objects
  for select to authenticated using (bucket_id = 'illustrations' and public.is_admin());

drop policy if exists "admins upload illustrations" on storage.objects;
create policy "admins upload illustrations" on storage.objects
  for insert to authenticated with check (bucket_id = 'illustrations' and public.is_admin());

drop policy if exists "admins delete illustrations" on storage.objects;
create policy "admins delete illustrations" on storage.objects
  for delete to authenticated using (bucket_id = 'illustrations' and public.is_admin());

-- ───────────── Starter questions (only if empty) ─────────────
insert into public.questions (position, type, title, subtitle, options, illustration, color, required)
select * from (values
  (1, 'single', 'How did you find us?', 'Be honest, we won''t be offended.',
      '["Social media", "A friend told me", "Google", "Pure luck ✨"]'::jsonb, 'fries', '#FFC72C', true),
  (2, 'rating', 'How''s your first impression?', 'Tap the face that fits.',
      '[]'::jsonb, 'burger', '#FFF1C7', true),
  (3, 'multi', 'What are you most excited about?', 'Pick as many as you like.',
      '["Speed", "Design", "Price", "The vibes"]'::jsonb, 'nuggets', '#DA291C', true),
  (4, 'slider', 'How likely are you to tell a friend?', 'Slide it.',
      '["Nope", "Already texting them"]'::jsonb, 'drink', '#FFE08A', true),
  (5, 'text', 'Anything else on your mind?', 'Ideas, wishes, hot takes — all welcome.',
      '[]'::jsonb, 'bag', '#F5DEB8', false)
) as seed(position, type, title, subtitle, options, illustration, color, required)
where not exists (select 1 from public.questions);
