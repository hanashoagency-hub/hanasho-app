-- =============================================
-- HANHUB — BOOKS (SELLABLE PRODUCT) MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  cover_image TEXT,
  file_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  benefits TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated, service_role;
GRANT SELECT ON public.books TO anon;

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published books are publicly viewable" ON public.books;
CREATE POLICY "Published books are publicly viewable" ON public.books
  FOR SELECT USING (is_published = true);

-- Book cover images — public, small, image only (same convention as course-covers).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers', 'book-covers', true, 10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Book covers are publicly viewable" ON storage.objects;
CREATE POLICY "Book covers are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

-- Purchasable book files (PDF/ePub). Public bucket, same convention as
-- lesson-pdfs — access is gated in the UI (the download link is only ever
-- shown to a purchaser), not at the storage layer, uploads only ever
-- happen through the admin server action (service-role client).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-files', 'book-files', true, 104857600,
  ARRAY['application/pdf', 'application/epub+zip']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 104857600,
      allowed_mime_types = ARRAY['application/pdf', 'application/epub+zip'];

DROP POLICY IF EXISTS "Book files are publicly viewable" ON storage.objects;
CREATE POLICY "Book files are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-files');
