-- =====================================================
-- COMPLETE ACCOUNTING SETUP
-- =====================================================
-- Run this entire script to set up the accounting system
-- Safe to run multiple times (uses IF NOT EXISTS)

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (if you want fresh start)
-- =====================================================
-- Uncomment these lines ONLY if you want to start fresh
-- DROP TABLE IF EXISTS payment_splits CASCADE;
-- DROP TABLE IF EXISTS invoice_line_items CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS payment_transactions CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS vendors CASCADE;
-- DROP TABLE IF EXISTS budgets CASCADE;
-- DROP TABLE IF EXISTS financial_accounts CASCADE;
-- DROP TABLE IF EXISTS tax_rates CASCADE;

-- =====================================================
-- STEP 2: CREATE ALL TABLES
-- =====================================================

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_reference VARCHAR(50) UNIQUE NOT NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  invoice_id UUID,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'deposit')),
  payment_method VARCHAR(30) CHECK (payment_method IN (
    'cash', 'card', 'bank_transfer', 'pos', 'mobile_money', 
    'paystack', 'stripe', 'flutterwave', 'check', 'other'
  )),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  amount_in_base_currency DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  gateway_reference VARCHAR(100),
  gateway_response JSONB,
  description TEXT,
  payment_category VARCHAR(50) CHECK (payment_category IN (
    'room_rental', 'food_beverage', 'spa', 'gym', 'laundry', 
    'transportation', 'event_hall', 'bar', 'minibar', 'other'
  )),
  processed_by UUID,
  processed_at TIMESTAMP,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add columns if they don't exist (handles existing tables gracefully)
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

-- Drop old constraint if exists and add new one
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check'
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_status_check;
  END IF;
  
  -- Update any invalid status values to 'draft'
  UPDATE invoices SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded');
  
  -- Add the constraint
  ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'));
  
  RAISE NOTICE 'Invoices status constraint updated';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add constraint: %', SQLERRM;
END $$;

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(50) CHECK (item_type IN (
    'room', 'food', 'beverage', 'service', 'product', 'fee', 'tax', 'discount'
  )),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  reference_id UUID,
  service_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_number VARCHAR(50) UNIQUE NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  expense_category VARCHAR(50) CHECK (expense_category IN (
    'salaries', 'utilities', 'maintenance', 'supplies', 'marketing',
    'rent', 'insurance', 'taxes', 'equipment', 'food_supplies',
    'cleaning_supplies', 'transportation', 'professional_fees', 'other'
  )),
  vendor_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(30),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'partial', 'paid', 'overdue'
  )),
  payment_date DATE,
  receipt_number VARCHAR(100),
  invoice_reference VARCHAR(100),
  description TEXT NOT NULL,
  notes TEXT,
  attachments JSONB,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  )),
  next_occurrence DATE,
  approved_by UUID,
  approved_at TIMESTAMP,
  recorded_by UUID NOT NULL,
  department VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code VARCHAR(50) UNIQUE NOT NULL,
  vendor_name VARCHAR(200) NOT NULL,
  vendor_type VARCHAR(50) CHECK (vendor_type IN (
    'food_supplier', 'beverage_supplier', 'maintenance', 'utilities',
    'cleaning_supplies', 'equipment', 'professional_service', 'other'
  )),
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  tax_id VARCHAR(50),
  registration_number VARCHAR(50),
  payment_terms TEXT,
  credit_limit DECIMAL(12,2),
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_year INTEGER NOT NULL,
  budget_month INTEGER CHECK (budget_month >= 1 AND budget_month <= 12),
  budget_quarter INTEGER CHECK (budget_quarter >= 1 AND budget_quarter <= 4),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  budgeted_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  variance DECIMAL(12,2),
  variance_percentage DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'revised')),
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(budget_year, budget_month, category, subcategory)
);

-- Financial Accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(30) CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'expense'
  )),
  account_category VARCHAR(50),
  parent_account_id UUID REFERENCES financial_accounts(id),
  current_balance DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax Rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_name VARCHAR(100) NOT NULL,
  tax_code VARCHAR(20) UNIQUE NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL,
  applies_to VARCHAR(20) CHECK (applies_to IN ('rooms', 'food', 'services', 'all')),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Splits
CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  payment_method VARCHAR(30) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  gateway_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_payment_transactions_reservation ON payment_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_guest ON payment_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

CREATE INDEX IF NOT EXISTS idx_invoices_reservation ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_guest ON invoices(guest_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category);

-- =====================================================
-- STEP 4: ENABLE RLS
-- =====================================================

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated access" ON payment_transactions;
CREATE POLICY "Allow authenticated access" ON payment_transactions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON invoices;
CREATE POLICY "Allow authenticated access" ON invoices FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON invoice_line_items;
CREATE POLICY "Allow authenticated access" ON invoice_line_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON expenses;
CREATE POLICY "Allow authenticated access" ON expenses FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON vendors;
CREATE POLICY "Allow authenticated access" ON vendors FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON budgets;
CREATE POLICY "Allow authenticated access" ON budgets FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON financial_accounts;
CREATE POLICY "Allow authenticated access" ON financial_accounts FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON tax_rates;
CREATE POLICY "Allow authenticated access" ON tax_rates FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access" ON payment_splits;
CREATE POLICY "Allow authenticated access" ON payment_splits FOR ALL TO authenticated USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ACCOUNTING SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✓ payment_transactions';
  RAISE NOTICE '  ✓ invoices';
  RAISE NOTICE '  ✓ invoice_line_items';
  RAISE NOTICE '  ✓ expenses';
  RAISE NOTICE '  ✓ vendors';
  RAISE NOTICE '  ✓ budgets';
  RAISE NOTICE '  ✓ financial_accounts';
  RAISE NOTICE '  ✓ tax_rates';
  RAISE NOTICE '  ✓ payment_splits';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run ACCOUNTING_FUNCTIONS.sql';
  RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
