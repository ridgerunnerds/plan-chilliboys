-- Chilli Boys Plan Portal — Clean Supabase Schema
-- Run this in the Supabase SQL Editor, then rebuild & redeploy your app.

-- ─── Clean slate ───
DROP TABLE IF EXISTS public.storyboards;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ─── Profiles (plain table, no FK to auth.users to avoid PostgREST issues) ───
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'pm', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Projects ───
CREATE TABLE public.projects (
  id text PRIMARY KEY,
  user_id text NOT NULL DEFAULT '',
  user_name text NOT NULL DEFAULT '',
  user_email text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'quoted', 'approved', 'in_progress', 'completed')),
  quote numeric,
  phone text,
  storyboard_id text,
  feedback jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Storyboards ───
CREATE TABLE public.storyboards (
  id text PRIMARY KEY,
  user_id text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  elements jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- ─── Disable RLS for simplicity (tighten in production later) ───
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboards DISABLE ROW LEVEL SECURITY;

-- ─── Trigger: auto-create profile on signup ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
