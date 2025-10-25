-- =====================================================
-- ACCOUNTING & FINANCE MANAGEMENT SCHEMA
-- =====================================================
-- Complete database schema for hotel accounting system

-- =====================================================
-- 1. PAYMENT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_reference VARCHAR(50) UNIQUE NOT NULL,
  
  -- Related entities
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  invoice_id UUID,
  
  -- Transaction details
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'deposit')),
  payment_method VARCHAR(30) CHECK (payment_method IN (
    'cash', 'card', 'bank_transfer', 'pos', 'mobile_money', 
    'paystack', 'stripe', 'flutterwave', 'check', 'other'
  )),
  
  -- Amounts
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  amount_in_base_currency DECIMAL(12,2),
  
  -- Payment status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  
  -- Payment gateway details
  gateway_reference VARCHAR(100),
  gateway_response JSONB,
  
  -- Additional info
  description TEXT,
  payment_category VARCHAR(50) CHECK (payment_category IN (
    'room_rental', 'food_beverage', 'spa', 'gym', 'laundry', 
    'transportation', 'event_hall', 'bar', 'minibar', 'other'
  )),
  
  -- Metadata
  processed_by UUID,
  processed_at TIMESTAMP,
  notes TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. INVOICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Related entities
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2),
  
  -- Currency
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'
  )),
  
  -- Additional info
  payment_terms TEXT,
  notes TEXT,
  internal_notes TEXT,
  
  -- Branding
  template_id UUID,
  
  -- Metadata
  issued_by UUID,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. INVOICE LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Item details
  item_type VARCHAR(50) CHECK (item_type IN (
    'room', 'food', 'beverage', 'service', 'product', 'fee', 'tax', 'discount'
  )),
  description TEXT NOT NULL,
  
  -- Pricing
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  
  -- Reference
  reference_id UUID, -- Links to room, menu item, service, etc.
  
  -- Dates (for room charges)
  service_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. EXPENSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Expense details
  expense_date DATE DEFAULT CURRENT_DATE,
  expense_category VARCHAR(50) CHECK (expense_category IN (
    'salaries', 'utilities', 'maintenance', 'supplies', 'marketing',
    'rent', 'insurance', 'taxes', 'equipment', 'food_supplies',
    'cleaning_supplies', 'transportation', 'professional_fees', 'other'
  )),
  
  -- Vendor
  vendor_id UUID,
  
  -- Amounts
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Payment
  payment_method VARCHAR(30),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'partial', 'paid', 'overdue'
  )),
  payment_date DATE,
  
  -- Documentation
  receipt_number VARCHAR(100),
  invoice_reference VARCHAR(100),
  description TEXT NOT NULL,
  notes TEXT,
  
  -- Attachments
  attachments JSONB,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  )),
  next_occurrence DATE,
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  
  -- Metadata
  recorded_by UUID NOT NULL,
  department VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. VENDORS/SUPPLIERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Basic info
  vendor_name VARCHAR(200) NOT NULL,
  vendor_type VARCHAR(50) CHECK (vendor_type IN (
    'food_supplier', 'beverage_supplier', 'maintenance', 'utilities',
    'cleaning_supplies', 'equipment', 'professional_service', 'other'
  )),
  
  -- Contact
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  
  -- Business details
  tax_id VARCHAR(50),
  registration_number VARCHAR(50),
  
  -- Payment terms
  payment_terms TEXT,
  credit_limit DECIMAL(12,2),
  
  -- Banking
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(200),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Metadata
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. BUDGET PLANNING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Period
  budget_year INTEGER NOT NULL,
  budget_month INTEGER CHECK (budget_month >= 1 AND budget_month <= 12),
  budget_quarter INTEGER CHECK (budget_quarter >= 1 AND budget_quarter <= 4),
  
  -- Category
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  
  -- Amounts
  budgeted_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  variance DECIMAL(12,2),
  variance_percentage DECIMAL(5,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'revised')),
  
  -- Metadata
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(budget_year, budget_month, category, subcategory)
);

-- =====================================================
-- 7. FINANCIAL ACCOUNTS TABLE (Chart of Accounts)
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  
  -- Account classification
  account_type VARCHAR(30) CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'expense'
  )),
  account_category VARCHAR(50),
  
  -- Hierarchy
  parent_account_id UUID REFERENCES financial_accounts(id),
  
  -- Balance
  current_balance DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. TAX CONFIGURATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_name VARCHAR(100) NOT NULL,
  tax_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Rate
  tax_rate DECIMAL(5,2) NOT NULL,
  
  -- Applicability
  applies_to VARCHAR(20) CHECK (applies_to IN ('rooms', 'food', 'services', 'all')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  -- Metadata
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. PAYMENT SPLITS TABLE (for split payments)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  
  -- Split details
  payment_method VARCHAR(30) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  
  -- Gateway details (if applicable)
  gateway_reference VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reservation ON payment_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_guest ON payment_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_category ON payment_transactions(payment_category);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_reservation ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_guest ON invoices(guest_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(payment_status);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_year_month ON budgets(budget_year, budget_month);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- =====================================================
-- ROW LEVEL SECURITY
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

-- Policies (Allow authenticated users - refine based on roles)
CREATE POLICY "Allow authenticated access to payment_transactions" ON payment_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to invoices" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to invoice_line_items" ON invoice_line_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to expenses" ON expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to vendors" ON vendors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to budgets" ON budgets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to financial_accounts" ON financial_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to tax_rates" ON tax_rates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to payment_splits" ON payment_splits FOR ALL TO authenticated USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ACCOUNTING SCHEMA CREATED SUCCESSFULLY!';
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
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  ✓ Multi-payment method support';
  RAISE NOTICE '  ✓ Split payment capability';
  RAISE NOTICE '  ✓ Invoice management';
  RAISE NOTICE '  ✓ Expense tracking';
  RAISE NOTICE '  ✓ Vendor management';
  RAISE NOTICE '  ✓ Budget planning';
  RAISE NOTICE '  ✓ Tax configuration';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
