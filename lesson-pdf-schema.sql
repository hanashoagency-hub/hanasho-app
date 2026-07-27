-- =============================================
-- HANHUB — PDF LESSONS MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'video';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_lesson_type_check'
  ) THEN
    ALTER TABLE public.lessons ADD CONSTRAINT lessons_lesson_type_check CHECK (lesson_type IN ('video', 'pdf'));
  END IF;
END $$;

-- Public bucket — PDFs are read the same way lesson videos already are
-- (no signed-URL gating), 50MB cap. Uploads only ever happen through the
-- admin server action (service-role client, bypasses RLS), so no write
-- policy is needed here — only public read.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lesson-pdfs', 'lesson-pdfs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "Lesson PDFs are publicly viewable" ON storage.objects;
CREATE POLICY "Lesson PDFs are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'lesson-pdfs');
