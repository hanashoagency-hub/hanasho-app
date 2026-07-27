-- =============================================
-- HANHUB — RBAC PERMISSIONS, MESSAGING, COMMUNITY, ACHIEVEMENTS
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- -------------------------------------------------------------
-- 1. MEMBERSHIP + ACCOUNT STATUS (extends profiles)
-- -------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_type TEXT NOT NULL DEFAULT 'free';
-- free | premium | vip | lifetime
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';
-- active | expired | suspended | cancelled
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';
-- active | suspended | banned | pending_verification | inactive

-- -------------------------------------------------------------
-- 2. PER-USER CONTENT PERMISSIONS
-- -------------------------------------------------------------
-- One row per user per content kind. "all_access" grants everything of that
-- kind including FUTURE items (that's what future access means — a blanket
-- grant is inherently future-proof). Individual item grants live in
-- user_item_grants. expires_at NULL = lifetime.
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_kind TEXT NOT NULL, -- course | book | digital_product
  all_access BOOLEAN NOT NULL DEFAULT false,
  can_download BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_kind)
);

CREATE TABLE IF NOT EXISTS public.user_item_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_kind TEXT NOT NULL, -- course | book | digital_product
  item_id UUID NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_kind, item_id)
);

CREATE INDEX IF NOT EXISTS user_item_grants_user_idx ON public.user_item_grants (user_id, content_kind);

-- -------------------------------------------------------------
-- 3. MESSAGING (threaded, Gmail-style)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.message_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_is_admin BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages (thread_id, created_at);

-- Per-recipient state of a thread (a broadcast to 100 students = 100 rows,
-- each with independent read/star/archive/trash state, exactly like Gmail).
CREATE TABLE IF NOT EXISTS public.message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.message_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  folder TEXT NOT NULL DEFAULT 'inbox', -- inbox | archived | trash
  UNIQUE (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_recipients_user_idx ON public.message_recipients (user_id, folder, is_read);

-- -------------------------------------------------------------
-- 4. NOTIFICATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL, -- message | community | system
  title TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, is_read, created_at DESC);

-- -------------------------------------------------------------
-- 5. COMMUNITY (posts, reactions, comments, bookmarks, reports)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT,
  image_urls TEXT[] DEFAULT '{}',
  post_type TEXT NOT NULL DEFAULT 'text', -- text | achievement | certificate
  visibility TEXT NOT NULL DEFAULT 'students', -- public | students | private
  hashtags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_feed_idx ON public.community_posts (is_hidden, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE, -- nested replies
  body TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_comments_post_idx ON public.community_comments (post_id, created_at);

CREATE TABLE IF NOT EXISTS public.community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL DEFAULT 'like', -- like | love | celebrate
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | resolved | dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- 6. ACHIEVEMENTS (user-uploaded certificates/awards + profile extras)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  kind TEXT NOT NULL DEFAULT 'achievement', -- achievement | certificate | award | badge
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Community image uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images', 'community-images', true, 10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Community images are publicly viewable" ON storage.objects;
CREATE POLICY "Community images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-images');

-- -------------------------------------------------------------
-- 7. GRANTS + RLS
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.user_permissions, public.user_item_grants,
  public.message_threads, public.messages, public.message_recipients,
  public.notifications,
  public.community_posts, public.community_comments, public.community_reactions,
  public.community_bookmarks, public.community_reports,
  public.user_achievements
TO authenticated, service_role;

GRANT SELECT ON public.community_posts, public.community_comments, public.community_reactions, public.user_achievements TO anon;

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_item_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Sensitive tables: all reads/writes flow through server actions using the
-- service-role client. Users may read only their own rows directly.
DROP POLICY IF EXISTS "Own permissions readable" ON public.user_permissions;
CREATE POLICY "Own permissions readable" ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Own grants readable" ON public.user_item_grants;
CREATE POLICY "Own grants readable" ON public.user_item_grants FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Own recipient rows readable" ON public.message_recipients;
CREATE POLICY "Own recipient rows readable" ON public.message_recipients FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Own notifications readable" ON public.notifications;
CREATE POLICY "Own notifications readable" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Community content is broadly readable; writes go through server actions.
DROP POLICY IF EXISTS "Visible posts readable" ON public.community_posts;
CREATE POLICY "Visible posts readable" ON public.community_posts FOR SELECT USING (is_hidden = false);
DROP POLICY IF EXISTS "Visible comments readable" ON public.community_comments;
CREATE POLICY "Visible comments readable" ON public.community_comments FOR SELECT USING (is_hidden = false);
DROP POLICY IF EXISTS "Reactions readable" ON public.community_reactions;
CREATE POLICY "Reactions readable" ON public.community_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Achievements readable" ON public.user_achievements;
CREATE POLICY "Achievements readable" ON public.user_achievements FOR SELECT USING (true);
