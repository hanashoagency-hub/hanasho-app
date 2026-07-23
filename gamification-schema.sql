-- =============================================
-- HANHUB GAMIFICATION SCHEMA
-- Run this in the Supabase SQL Editor (after supabase-schema.sql)
-- =============================================

-- 1. USER STATS (XP + streaks)
CREATE TABLE public.user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  xp INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. XP EVENTS (append-only log, for auditing/history)
CREATE TABLE public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BADGES (catalog)
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_threshold INT
);

-- 4. USER BADGES (earned)
CREATE TABLE public.user_badges (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- 5. REWARD CLAIMS (manual claim audit trail)
CREATE TABLE public.reward_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reward_code TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reward_code)
);

-- Seed the badge catalog
INSERT INTO public.badges (code, label, description, icon, xp_threshold) VALUES
  ('streak_7',       '7-Day Streak',    'Logged in 7 days in a row.',                'Flame',   NULL),
  ('streak_30',      '30-Day Streak',   'Logged in 30 days in a row.',               'Flame',   NULL),
  ('streak_100',     '100-Day Streak',  'Logged in 100 days in a row. Legendary.',   'Flame',   NULL),
  ('first_lesson',   'First Step',      'Completed your first lesson.',              'BookOpen',NULL),
  ('bronze_learner', 'Bronze Learner',  'Reached 100 XP.',                           'Award',   100),
  ('silver_learner', 'Silver Learner',  'Reached 500 XP.',                           'Award',   500),
  ('gold_learner',   'Gold Learner',    'Reached 1500 XP.',                          'Award',   1500);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Award XP to a user (idempotency is the caller's responsibility, e.g. check
-- lesson_progress didn't already exist before calling this for a lesson).
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_amount INT, p_reason TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.xp_events (user_id, amount, reason) VALUES (p_user_id, p_amount, p_reason);

  INSERT INTO public.user_stats (user_id, xp, updated_at)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET xp = public.user_stats.xp + EXCLUDED.xp,
        updated_at = NOW();

  -- Auto-award XP-threshold badges the user now qualifies for
  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT p_user_id, b.id
  FROM public.badges b
  WHERE b.xp_threshold IS NOT NULL
    AND b.xp_threshold <= (SELECT xp FROM public.user_stats WHERE user_id = p_user_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record a daily login: updates streaks and awards login XP.
-- Safe to call multiple times per day (no-ops after the first call today).
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id UUID)
RETURNS TABLE (streak_count INT, xp_awarded INT, is_new_today BOOLEAN) AS $$
DECLARE
  v_last_date DATE;
  v_streak INT;
  v_longest INT;
  v_today DATE := CURRENT_DATE;
  v_xp INT := 0;
  v_badge_code TEXT;
BEGIN
  SELECT last_active_date, user_stats.streak_count, user_stats.longest_streak
    INTO v_last_date, v_streak, v_longest
    FROM public.user_stats WHERE user_id = p_user_id;

  IF v_last_date IS NULL THEN
    v_streak := 1;
    v_longest := COALESCE(v_longest, 0);
  ELSIF v_last_date = v_today THEN
    -- Already recorded today — no-op.
    RETURN QUERY SELECT COALESCE(v_streak, 1), 0, false;
    RETURN;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_streak := v_streak + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_longest := GREATEST(COALESCE(v_longest, 0), v_streak);
  v_xp := 10;

  IF v_streak IN (7, 30, 100) THEN
    v_xp := v_xp + 50;
    v_badge_code := 'streak_' || v_streak;
  END IF;

  INSERT INTO public.user_stats (user_id, xp, streak_count, longest_streak, last_active_date, updated_at)
  VALUES (p_user_id, v_xp, v_streak, v_longest, v_today, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET xp = public.user_stats.xp + EXCLUDED.xp,
        streak_count = v_streak,
        longest_streak = v_longest,
        last_active_date = v_today,
        updated_at = NOW();

  INSERT INTO public.xp_events (user_id, amount, reason) VALUES (p_user_id, v_xp, 'daily_login');

  IF v_badge_code IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.badges WHERE code = v_badge_code
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY SELECT v_streak, v_xp, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- USER_STATS: public read (needed for the leaderboard); writes only via
-- service-role server actions (no INSERT/UPDATE policy for regular users).
CREATE POLICY "User stats are viewable by everyone" ON public.user_stats FOR SELECT USING (true);

-- XP_EVENTS: users can see their own event history only.
CREATE POLICY "Users can view their own xp events" ON public.xp_events FOR SELECT USING (auth.uid() = user_id);

-- BADGES: public catalog, readable by everyone.
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- USER_BADGES: public read (needed to show badges on leaderboard/profiles).
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);

-- REWARD_CLAIMS: users can see their own claims only; writes via service-role only.
CREATE POLICY "Users can view their own reward claims" ON public.reward_claims FOR SELECT USING (auth.uid() = user_id);
