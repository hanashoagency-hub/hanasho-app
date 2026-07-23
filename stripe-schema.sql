-- =============================================
-- HANHUB — STRIPE CARD PAYMENTS MIGRATION
-- Run this in the Supabase SQL Editor (safe to re-run any time)
-- =============================================

-- The original `transactions.payment_method` CHECK constraint only
-- allowed WaafiPay's mobile-money methods. This widens it to also
-- accept 'card' for Stripe payments, regardless of what Postgres
-- auto-named the original constraint.
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT con.conname INTO con_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'transactions'
    AND con.contype = 'c'
    AND att.attname = 'payment_method';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.transactions DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_payment_method_check
    CHECK (payment_method IN ('evc', 'zaad', 'sahal', 'somnet', 'card'));
END $$;

-- Track the Stripe PaymentIntent id alongside the existing WaafiPay
-- reference_id column (reference_id already stores it via the
-- existing complete_purchase() call — this index just makes
-- Stripe-specific admin lookups/refund reconciliation fast).
CREATE INDEX IF NOT EXISTS transactions_reference_id_idx ON public.transactions (reference_id);
