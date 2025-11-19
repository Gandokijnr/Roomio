-- Add Paystack authorization and billing retry tracking fields

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS paystack_authorization_code text,
  ADD COLUMN IF NOT EXISTS billing_retry_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_retry_last_attempt timestamptz;
