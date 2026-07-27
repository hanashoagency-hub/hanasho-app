-- =============================================
-- HANHUB — ANNOUNCEMENT BANNER SYSTEM MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  color_theme TEXT NOT NULL DEFAULT 'lime', -- lime | blue | red | yellow | purple
  icon TEXT, -- emoji, e.g. "🎉"

  announcement_type TEXT NOT NULL DEFAULT 'general',
  -- free_course_promo | limited_time_offer | flash_sale | discount |
  -- important_notice | maintenance_notice | new_course_launch | general

  placement TEXT NOT NULL DEFAULT 'site_wide',
  -- homepage | courses_page | course_page | dashboard | checkout | site_wide
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- only used when placement = 'course_page'

  show_countdown BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 0,

  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_placement_idx ON public.announcements (placement);
CREATE INDEX IF NOT EXISTS announcements_course_id_idx ON public.announcements (course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated, service_role;
GRANT SELECT ON public.announcements TO anon;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enabled announcements are publicly viewable" ON public.announcements;
CREATE POLICY "Enabled announcements are publicly viewable" ON public.announcements
  FOR SELECT USING (is_enabled = true);
