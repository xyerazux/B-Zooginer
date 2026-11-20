-- Migration 005: Activity Logs and Singleton Site Settings
-- Project: B-Zooginer Pre-Order Platform

-- 1. Create ACTIVITY_LOGS table (audit trail, append-only)
CREATE TABLE public.activity_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       text NOT NULL,
  entity_type  text NOT NULL,
  entity_id    text NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT logs_action_not_empty CHECK (char_length(trim(action)) > 0),
  CONSTRAINT logs_entity_type_not_empty CHECK (char_length(trim(entity_type)) > 0)
);

-- 2. Create SITE_SETTINGS table (singleton configuration row)
CREATE TABLE public.site_settings (
  id                      integer PRIMARY KEY DEFAULT 1,
  hero_title              text NOT NULL DEFAULT 'B-Zooginer',
  hero_subtitle           text NOT NULL DEFAULT 'Platform Pre-Order Resmi Bazaar Kewirausahaan Sekolah',
  hero_image_url          text,
  featured_group_ids      uuid[] NOT NULL DEFAULT '{}',
  announcement_text       text,
  is_announcement_active  boolean NOT NULL DEFAULT false,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  updated_by              uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- Insert default singleton row if not already present
INSERT INTO public.site_settings (id, hero_title, hero_subtitle)
VALUES (1, 'B-Zooginer', 'Platform Pre-Order Resmi Bazaar Kewirausahaan Sekolah')
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
