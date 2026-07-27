-- =============================================
-- HANHUB — COURSE SUBSCRIPTIONS (monthly plan) + LIFETIME/VIP
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- Per-course opt-in to the monthly-subscription option and its base price.
-- Lifetime purchase = the existing courses.price (unchanged) and always
-- includes VIP Telegram. Monthly = discounted monthly_price, time-boxed
-- access, no VIP.
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS offers_subscription BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS monthly_price NUMERIC NOT NULL DEFAULT 0;

-- Allow the subscription payment method on transactions.
DO $$
DECLARE con_name text;
BEGIN
  SELECT con.conname INTO con_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'transactions' AND con.contype = 'c' AND att.attname = 'payment_method';
  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.transactions DROP CONSTRAINT %I', con_name);
  END IF;
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_payment_method_check
    CHECK (payment_method IN ('evc','zaad','sahal','somnet','card','free_promo','sub_evc','sub_zaad','sub_sahal','sub_somnet','sub_card'));
END $$;

CREATE TABLE IF NOT EXISTS public.course_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | expired | cancelled
  current_period_end TIMESTAMPTZ NOT NULL,
  renewal_count INT NOT NULL DEFAULT 0, -- 0 = first month (50% off), >=1 = renewals (60% off)
  last_payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_subscriptions_user_idx ON public.course_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS course_subscriptions_period_idx ON public.course_subscriptions (current_period_end);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_subscriptions TO authenticated, service_role;

ALTER TABLE public.course_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own subscriptions readable" ON public.course_subscriptions;
CREATE POLICY "Own subscriptions readable" ON public.course_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Atomic subscription payment: records the transaction and extends the
-- subscription period by one month, incrementing renewal_count. Idempotent
-- on reference_id (a retried callback won't double-extend). Returns the new
-- period end + renewal count so the UI can show them.
CREATE OR REPLACE FUNCTION public.complete_subscription(
  p_user_id UUID,
  p_course_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_payment_method TEXT,
  p_phone_number TEXT,
  p_reference_id TEXT,
  p_status TEXT,
  p_gateway_response JSONB
)
RETURNS TABLE (period_end TIMESTAMPTZ, renewals INT) AS $$
DECLARE
  v_existing_ref BOOLEAN;
  v_base TIMESTAMPTZ;
  v_new_end TIMESTAMPTZ;
  v_renewals INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.transactions WHERE reference_id = p_reference_id) INTO v_existing_ref;

  INSERT INTO public.transactions (
    user_id, course_id, amount, currency, payment_method,
    phone_number, reference_id, status, waafipay_response
  ) VALUES (
    p_user_id, p_course_id, p_amount, p_currency, p_payment_method,
    p_phone_number, p_reference_id, p_status, p_gateway_response
  ) ON CONFLICT (reference_id) DO NOTHING;

  IF p_status <> 'success' OR v_existing_ref THEN
    SELECT current_period_end, renewal_count INTO v_new_end, v_renewals
    FROM public.course_subscriptions WHERE user_id = p_user_id AND course_id = p_course_id;
    RETURN QUERY SELECT v_new_end, COALESCE(v_renewals, 0);
    RETURN;
  END IF;

  -- Extend from the later of "now" or the current period end (so early
  -- renewals stack rather than lose remaining time).
  SELECT current_period_end INTO v_base
  FROM public.course_subscriptions WHERE user_id = p_user_id AND course_id = p_course_id;
  IF v_base IS NULL OR v_base < now() THEN
    v_base := now();
  END IF;
  v_new_end := v_base + interval '30 days';

  INSERT INTO public.course_subscriptions (user_id, course_id, status, current_period_end, renewal_count, last_payment_method, updated_at)
  VALUES (p_user_id, p_course_id, 'active', v_new_end, 1, p_payment_method, now())
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET status = 'active',
        current_period_end = v_new_end,
        renewal_count = public.course_subscriptions.renewal_count + 1,
        last_payment_method = p_payment_method,
        updated_at = now()
  RETURNING current_period_end, renewal_count INTO v_new_end, v_renewals;

  RETURN QUERY SELECT v_new_end, v_renewals;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.complete_subscription TO service_role, authenticated;
