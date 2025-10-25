# 🚀 Quick Setup: Expenses Database

## Problem
Your app shows "💰 No expenses found" because the expenses table doesn't exist in Supabase yet.

## Solution - 3 Simple Steps

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your account
3. Select your **Roomio** project

### Step 2: Run SQL to Create Tables
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the SQL below
4. Click **"Run"** (or press Ctrl+Enter)

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to manage data
DROP POLICY IF EXISTS "Allow authenticated users to manage expenses" ON expenses;
CREATE POLICY "Allow authenticated users to manage expenses" ON expenses
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage vendors" ON vendors;
CREATE POLICY "Allow authenticated users to manage vendors" ON vendors
  FOR ALL TO authenticated USING (true);
```

### Step 3: Verify Tables Were Created
1. Click **"Table Editor"** in the left sidebar
2. You should now see:
   - ✅ **expenses** table
   - ✅ **vendors** table

## Step 4: Test Your App

1. Go back to your app at http://localhost:3003/expenses
2. Refresh the page (Ctrl+Shift+R)
3. Click **"+ Add Expense"**
4. Fill in the form:
   - **Expense Date**: Today's date
   - **Category**: Select any (e.g., "Utilities")
   - **Description**: "Test expense"
   - **Amount**: 1000
   - **Tax Amount**: 0
5. Click **"Save Expense"**

You should now see your expense in the table! 🎉

## What If It Still Doesn't Work?

### Check Browser Console
1. Press **F12** to open Developer Tools
2. Click **"Console"** tab
3. Look for any error messages
4. Common errors and solutions:

**Error: "relation 'expenses' does not exist"**
- Solution: The SQL didn't run. Go back to Step 2 and run it again.

**Error: "null value in column 'recorded_by'"**
- Solution: Make sure you're logged in to the app.

**Error: "new row violates check constraint"**
- Solution: Make sure you selected a valid expense category from the dropdown.

### Check Supabase Logs
1. In Supabase Dashboard, click **"Logs"**
2. Click **"Database"** logs
3. Look for any errors when you try to save an expense

## Quick Test Query

To check if the table exists and is empty, run this in SQL Editor:

```sql
SELECT COUNT(*) as expense_count FROM expenses;
```

- If it returns `0`, the table exists but is empty (this is normal for a new setup)
- If it returns an error, the table doesn't exist yet

## Next Steps

Once the table is created:
1. ✅ Add your first expense
2. ✅ Create some vendors (go to Vendors tab)
3. ✅ Link expenses to vendors
4. ✅ View your expense analytics

## Need More Help?

Check these files:
- `EXPENSE_TROUBLESHOOTING.md` - Detailed troubleshooting
- `VENDOR_SYSTEM_GUIDE.md` - How to use vendors
- `supabase/COMPLETE_ACCOUNTING_SETUP.sql` - Full accounting system setup

---

**Remember:** You only need to run the SQL setup **once**. After that, you can add expenses through the UI.
