-- =============================================
-- HANHUB — COURSE PROMOTIONS + COUPON CODES MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- Lets an announcement of type 'discount' / 'flash_sale' / 'limited_time_offer'
-- (scoped to a specific course via announcements.course_id) drive real
-- checkout pricing, not just banner copy. A 'free_course_promo' announcement
-- needs no percentage — it's treated as 100% off.
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage NUMERIC NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- NULL = applies to any course
  max_uses INT, -- NULL = unlimited
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ, -- NULL = never expires
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons (code);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated, service_role;
GRANT SELECT ON public.coupons TO anon;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- No public SELECT policy — coupon validity is only ever checked through the
-- admin-client server action (which bypasses RLS), so a code can't be
-- enumerated/guessed by querying the table directly from the client.
DROP POLICY IF EXISTS "Service role manages coupons" ON public.coupons;
CREATE POLICY "Service role manages coupons" ON public.coupons
  FOR ALL USING (auth.role() = 'service_role');
