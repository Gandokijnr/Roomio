-- Quick Fix: Apply Missing Tables for Guest Management
-- Run this in Supabase Dashboard > SQL Editor

-- This script creates only the missing tables that are causing 404 errors
-- Tables: loyalty_transactions, guest_communications, and related guest enhancements

-- First, check if guests table exists and enhance it
DO $$ 
BEGIN
  -- Add new columns to guests table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'loyalty_tier') THEN
    ALTER TABLE guests ADD COLUMN loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'loyalty_points') THEN
    ALTER TABLE guests ADD COLUMN loyalty_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'total_stays') THEN
    ALTER TABLE guests ADD COLUMN total_stays INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'total_spending') THEN
    ALTER TABLE guests ADD COLUMN total_spending DECIMAL(12,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'marketing_consent') THEN
    ALTER TABLE guests ADD COLUMN marketing_consent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  points INTEGER NOT NULL,
  description TEXT,
  reservation_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Create guest_communications table
CREATE TABLE IF NOT EXISTS guest_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  communication_type VARCHAR(20) CHECK (communication_type IN ('email', 'sms', 'call', 'in_person')),
  subject VARCHAR(255),
  message TEXT,
  direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_guest_id ON loyalty_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_communications_guest_id ON guest_communications(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_communications_created_at ON guest_communications(created_at DESC);

-- Enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to view loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Allow authenticated users to view loyalty transactions" ON loyalty_transactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Allow authenticated users to manage loyalty transactions" ON loyalty_transactions
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to view guest communications" ON guest_communications;
CREATE POLICY "Allow authenticated users to view guest communications" ON guest_communications
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guest communications" ON guest_communications;
CREATE POLICY "Allow authenticated users to manage guest communications" ON guest_communications
  FOR ALL TO authenticated USING (true);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: loyalty_transactions, guest_communications';
  RAISE NOTICE 'Guest table enhanced with loyalty fields';
END $$;
