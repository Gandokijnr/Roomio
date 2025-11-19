-- Update tenants table for trial/billing/subscription lifecycle

-- Extend status enum to include billing_pending
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_status_check;

ALTER TABLE tenants
  ADD CONSTRAINT tenants_status_check
  CHECK (status IN ('pending', 'trial', 'billing_hold', 'active', 'suspended'));

-- Add lifecycle and billing fields
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS paystack_customer_code text,
  ADD COLUMN IF NOT EXISTS current_plan_id uuid REFERENCES plans(id) ON DELETE SET NULL;
