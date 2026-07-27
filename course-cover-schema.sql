-- =============================================
-- HANHUB — COURSE COVER IMAGE UPLOAD MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- Public bucket for course thumbnails. Uploads only ever happen through
-- the admin server action (service-role client, bypasses RLS), so only
-- a public read policy is needed here.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-covers', 'course-covers', true, 10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Course covers are publicly viewable" ON storage.objects;
CREATE POLICY "Course covers are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-covers');
