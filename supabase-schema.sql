-- Chilli Boys Plan Portal — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ─── Profiles table (extends auth.users) ───
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  role text not null default 'client' check (role in ('client', 'pm', 'admin')),
  created_at timestamptz not null default now()
);

-- Disable RLS for simplicity (configure properly in production)
alter table public.profiles disable row level security;

-- ─── Projects table ───
create table if not exists public.projects (
  id text primary key,
  user_id text not null default '',
  user_name text not null default '',
  user_email text not null default '',
  title text not null default '',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_review', 'quoted', 'approved', 'in_progress', 'completed')),
  quote numeric,
  phone text,
  storyboard_id text,
  feedback jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.projects disable row level security;

-- ─── Storyboards table ───
create table if not exists public.storyboards (
  id text primary key,
  user_id text not null default '',
  name text not null default '',
  elements jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.storyboards disable row level security;

-- ─── Trigger: auto-create profile on signup ───
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.raw_user_meta_data->>'role', 'client'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
