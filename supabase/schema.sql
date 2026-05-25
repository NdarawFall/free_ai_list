create extension if not exists pgcrypto;

create schema if not exists app_private;

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

revoke all on public.app_admins from anon, authenticated;

insert into public.app_admins (email)
values ('ndarawpro@gmail.com')
on conflict (email) do nothing;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function app_private.is_admin() from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant select on public.app_admins to authenticated;

create or replace function public.is_current_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_admin();
$$;

revoke all on function public.is_current_admin() from public;
grant execute on function public.is_current_admin() to authenticated;

drop policy if exists "Admins can read admin emails" on public.app_admins;
create policy "Admins can read admin emails"
on public.app_admins
for select
to authenticated
using (app_private.is_admin());

create table if not exists public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  category text not null,
  url text not null,
  pricing_note text not null default 'Gratuit',
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_tools enable row level security;

drop policy if exists "Public can read AI tools" on public.ai_tools;
create policy "Public can read AI tools"
on public.ai_tools
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can add AI tools" on public.ai_tools;
drop policy if exists "Admins can insert AI tools" on public.ai_tools;
create policy "Admins can insert AI tools"
on public.ai_tools
for insert
to authenticated
with check (app_private.is_admin());

drop policy if exists "Admins can update AI tools" on public.ai_tools;
create policy "Admins can update AI tools"
on public.ai_tools
for update
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Admins can delete AI tools" on public.ai_tools;
create policy "Admins can delete AI tools"
on public.ai_tools
for delete
to authenticated
using (app_private.is_admin());

grant select on public.ai_tools to anon;
grant select, insert, update, delete on public.ai_tools to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_tools_updated_at on public.ai_tools;
create trigger set_ai_tools_updated_at
before update on public.ai_tools
for each row
execute function public.set_updated_at();

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke execute on function public.rls_auto_enable() from public;
    revoke execute on function public.rls_auto_enable() from anon, authenticated;
  end if;
end;
$$;

insert into public.ai_tools (name, tagline, category, url, pricing_note, tags, is_featured)
values
  ('ChatGPT', 'Assistant generaliste pour ecrire, coder et apprendre.', 'Assistant', 'https://chatgpt.com', 'Plan gratuit disponible', array['texte', 'code', 'productivite'], true),
  ('Claude', 'Assistant conversationnel utile pour documents et raisonnement.', 'Assistant', 'https://claude.ai', 'Plan gratuit disponible', array['texte', 'analyse'], true),
  ('Perplexity', 'Recherche web assistee par IA avec sources.', 'Recherche', 'https://www.perplexity.ai', 'Plan gratuit disponible', array['recherche', 'sources'], true),
  ('Google AI Studio', 'Experimenter avec les modeles Gemini dans le navigateur.', 'Developpeur', 'https://aistudio.google.com', 'Gratuit avec limites', array['api', 'gemini', 'prototype'], false),
  ('Hugging Face Spaces', 'Tester des demos IA open source dans le navigateur.', 'Open source', 'https://huggingface.co/spaces', 'Gratuit avec limites', array['open-source', 'demo', 'modeles'], false),
  ('Ideogram', 'Generation d''images avec rendu typographique solide.', 'Image', 'https://ideogram.ai', 'Credits gratuits', array['image', 'design'], false)
on conflict do nothing;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('ai', 'tool', 'blog', 'prompt')),
  title text not null,
  description text not null,
  url text,
  category text not null default 'Autre',
  image_url text,
  body text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_items enable row level security;

drop policy if exists "Public can read content items" on public.content_items;
create policy "Public can read content items"
on public.content_items
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert content items" on public.content_items;
create policy "Admins can insert content items"
on public.content_items
for insert
to authenticated
with check (app_private.is_admin());

drop policy if exists "Admins can update content items" on public.content_items;
create policy "Admins can update content items"
on public.content_items
for update
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Admins can delete content items" on public.content_items;
create policy "Admins can delete content items"
on public.content_items
for delete
to authenticated
using (app_private.is_admin());

grant select on public.content_items to anon;
grant select, insert, update, delete on public.content_items to authenticated;

drop trigger if exists set_content_items_updated_at on public.content_items;
create trigger set_content_items_updated_at
before update on public.content_items
for each row
execute function public.set_updated_at();
