# Expense Tracking Troubleshooting Guide

## Issues Fixed in Code ✅

### 1. **Data Fetching Issue** (FIXED)
**Problem:** The `loadExpenses()` function was fetching data twice and discarding the first result.

**Solution:** Refactored to fetch data once with all filters applied:
- Removed duplicate query
- Applied category and payment status filters properly
- Included vendor details in single query

### 2. **Summary Calculations** (FIXED)
**Problem:** Summary cards showing incorrect totals because filters weren't applied correctly.

**Solution:** Now the summary computed property correctly calculates from the filtered expenses array.

## Database Setup Required ⚠️

The expenses might not be saving because the **expenses table doesn't exist** in your Supabase database yet.

### Check if Tables Exist

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor**
3. Look for these tables:
   - `expenses`
   - `vendors`
   - `payment_transactions`
   - `invoices`

### If Tables Don't Exist - Run This SQL

Go to **SQL Editor** in Supabase and run the complete accounting setup:

```sql
-- Copy the contents from:
supabase/COMPLETE_ACCOUNTING_SETUP.sql
```

Or manually run this minimal setup for expenses:

```sql
-- Create expenses table
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

-- Create vendors table
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
  account_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow authenticated users to manage expenses" ON expenses;
CREATE POLICY "Allow authenticated users to manage expenses" ON expenses
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage vendors" ON vendors;
CREATE POLICY "Allow authenticated users to manage vendors" ON vendors
  FOR ALL TO authenticated USING (true);
```

## Testing Steps

After running the SQL:

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Open browser console** (F12)
3. **Try to add an expense**
4. **Check console for errors**

### Expected Console Output (Success)
```
Saving expense data: {expense_date: "2025-10-25", ...}
Create expense result: {data: {...}}
Loaded expenses: 1
```

### If You See Errors

**Error: "relation 'expenses' does not exist"**
- Solution: Run the SQL above in Supabase

**Error: "new row violates check constraint"**
- Solution: Make sure expense_category matches one of the allowed values

**Error: "null value in column 'recorded_by'"**
- Solution: Make sure you're logged in (check authentication)

## Quick Test Query

Run this in Supabase SQL Editor to check if table exists:

```sql
SELECT COUNT(*) FROM expenses;
```

If it returns a number (even 0), the table exists.
If it says "relation does not exist", you need to create the table.

## Summary Calculations

The summary cards now correctly calculate:
- **Total Expenses**: Sum of all `total_amount` in filtered results
- **Unpaid**: Sum of expenses where `payment_status` is 'unpaid' or 'partial'
- **Paid**: Sum of expenses where `payment_status` is 'paid'
- **Count**: Number of expenses in filtered results

All calculations are reactive and update when filters change.
