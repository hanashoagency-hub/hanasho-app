-- =============================================
-- HANHUB — PERMISSIONS, ATOMIC PURCHASE, AVATAR STORAGE FIX
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- -------------------------------------------------------------
-- 1. RE-ASSERT TABLE GRANTS
-- -------------------------------------------------------------
-- "permission denied for table X" is a Postgres GRANT-level error —
-- it happens BEFORE Row Level Security is even evaluated. RLS policies
-- can be perfectly correct (and they are here) while writes still fail
-- if the connecting role was never explicitly granted table access.
-- This re-issues the grants Supabase normally sets by default, so it's
-- safe/idempotent to run even if they already exist.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Make sure this also applies automatically to any table created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- -------------------------------------------------------------
-- 2. ATOMIC PURCHASE COMPLETION
-- -------------------------------------------------------------
-- Single SECURITY DEFINER function that saves the transaction AND the
-- purchase record together. Runs with the function owner's privileges
-- (bypassing RLS/grant ambiguity entirely), and because it's one
-- function call, Postgres wraps it in an implicit transaction: if the
-- purchase insert fails, the transaction insert is rolled back too —
-- so we never end up with a "paid but not saved" half-state again.
-- Duplicate-safe: re-calling with the same reference_id or an
-- already-owned course is a no-op, not an error.

CREATE OR REPLACE FUNCTION public.complete_purchase(
  p_user_id UUID,
  p_course_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_payment_method TEXT,
  p_phone_number TEXT,
  p_reference_id TEXT,
  p_status TEXT,
  p_waafipay_response JSONB
)
RETURNS TABLE (already_owned BOOLEAN, purchase_saved BOOLEAN) AS $$
DECLARE
  v_already_owned BOOLEAN := false;
BEGIN
  -- Idempotent on reference_id: a retried webhook/callback for the same
  -- payment should not create a second transaction row.
  INSERT INTO public.transactions (
    user_id, course_id, amount, currency, payment_method,
    phone_number, reference_id, status, waafipay_response
  )
  VALUES (
    p_user_id, p_course_id, p_amount, p_currency, p_payment_method,
    p_phone_number, p_reference_id, p_status, p_waafipay_response
  )
  ON CONFLICT (reference_id) DO NOTHING;

  IF p_status = 'success' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.purchases
      WHERE user_id = p_user_id AND course_id = p_course_id
    ) INTO v_already_owned;

    INSERT INTO public.purchases (user_id, course_id)
    VALUES (p_user_id, p_course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;

    RETURN QUERY SELECT v_already_owned, true;
  ELSE
    RETURN QUERY SELECT false, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.complete_purchase TO service_role, authenticated;

-- reference_id must be unique for the ON CONFLICT above to work as a
-- dedupe key (safe no-op if the constraint already exists).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_reference_id_key'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_reference_id_key UNIQUE (reference_id);
  END IF;
END $$;

-- -------------------------------------------------------------
-- 3. AVATAR STORAGE BUCKET
-- -------------------------------------------------------------
-- Public bucket (avatars are meant to be publicly viewable via
-- getPublicUrl), 5MB limit, image types only. Files are stored under
-- `<user_id>/filename.ext` — the storage policies below enforce that a
-- user can only write inside their own folder.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Avatar images are publicly viewable" ON storage.objects;
CREATE POLICY "Avatar images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );
