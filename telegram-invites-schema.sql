-- =============================================
-- HANHUB — TELEGRAM VIP ACCESS MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

CREATE TABLE IF NOT EXISTS public.telegram_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  channel_invite_link TEXT,
  channel_status TEXT NOT NULL DEFAULT 'active', -- active | revoked | expired
  channel_expires_at TIMESTAMPTZ,
  group_invite_link TEXT,
  group_status TEXT NOT NULL DEFAULT 'active',
  group_expires_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_invites TO authenticated, service_role;
GRANT SELECT ON public.telegram_invites TO anon;

ALTER TABLE public.telegram_invites ENABLE ROW LEVEL SECURITY;

-- All reads/writes happen through server actions using the admin
-- (service-role) client, which bypasses RLS regardless — this policy
-- only matters if a client ever queries the table directly, and it
-- correctly limits that to a user's own rows.
DROP POLICY IF EXISTS "Users can view their own telegram invites" ON public.telegram_invites;
CREATE POLICY "Users can view their own telegram invites" ON public.telegram_invites
  FOR SELECT USING (auth.uid() = user_id);
