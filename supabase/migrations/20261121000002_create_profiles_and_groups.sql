-- Migration 002: Groups and User Profiles
-- Project: B-Zooginer Pre-Order Platform

-- 1. Create GROUPS table
CREATE TABLE public.groups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  description  text,
  logo_url     text,
  poster_url   text,
  is_published boolean NOT NULL DEFAULT false,
  po_status    public.po_status_type NOT NULL DEFAULT 'coming_soon',
  sort_order   integer NOT NULL DEFAULT 0,
  created_by   uuid, -- FK to profiles(id) added after profiles table creation
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT groups_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT groups_slug_format CHECK (slug ~ '^[a-z0-9\-]+$')
);

CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. Create PROFILES table (extending Supabase auth.users)
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.role_type NOT NULL DEFAULT 'group_admin',
  group_id   uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  full_name  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_full_name_not_empty CHECK (char_length(trim(full_name)) > 0),
  -- A group_admin MUST have a group_id assigned; a master_admin must NOT have a group_id
  CONSTRAINT role_group_id_consistency CHECK (
    (role = 'master_admin' AND group_id IS NULL) OR
    (role = 'group_admin' AND group_id IS NOT NULL)
  )
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Add FK from groups.created_by to profiles.id
ALTER TABLE public.groups
  ADD CONSTRAINT fk_groups_created_by
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Trigger to automatically create a profile entry when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role       public.role_type;
  v_group_id   uuid;
  v_full_name  text;
BEGIN
  -- Extract metadata provided during user creation
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.role_type, 'group_admin');
  v_group_id := (NEW.raw_user_meta_data->>'group_id')::uuid;
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, role, group_id, full_name)
  VALUES (NEW.id, v_role, v_group_id, v_full_name)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    group_id = EXCLUDED.group_id,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
