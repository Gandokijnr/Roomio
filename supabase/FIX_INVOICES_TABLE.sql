-- =====================================================
-- FIX INVOICES TABLE - Add Missing Columns
-- =====================================================

-- Check if invoices table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
    RAISE NOTICE 'Invoices table exists, checking columns...';
  ELSE
    RAISE NOTICE 'Invoices table does not exist, will create it';
  END IF;
END $$;

-- Add missing columns if they don't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_due DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'NGN';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issued_by UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'));
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Invoices table columns verified/added';
  RAISE NOTICE 'Run your query again - it should work now!';
END $$;
