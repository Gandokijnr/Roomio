-- =====================================================
-- COMPLETE DATABASE MIGRATION
-- Run this ENTIRE script in Supabase Dashboard SQL Editor
-- =====================================================

-- This script creates ALL required tables from scratch
-- Safe to run on a fresh database

-- =====================================================
-- 1. CREATE BASE GUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  nationality VARCHAR(100),
  id_type VARCHAR(50) CHECK (id_type IN ('passport', 'national_id', 'driver_license', 'other')),
  id_number VARCHAR(100),
  emergency_contact VARCHAR(20),
  occupation VARCHAR(100),
  company VARCHAR(200),
  preferred_payment_method VARCHAR(50),
  special_preferences TEXT,
  notes TEXT,
  vip_status BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  
  -- Loyalty fields
  loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  loyalty_points INTEGER DEFAULT 0,
  total_stays INTEGER DEFAULT 0,
  total_spending DECIMAL(12,2) DEFAULT 0,
  last_visit_date TIMESTAMP,
  
  -- Corporate fields
  is_corporate BOOLEAN DEFAULT false,
  corporate_id UUID,
  
  -- Preferences
  marketing_consent BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE LOYALTY TRANSACTIONS TABLE
-- =====================================================

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

-- =====================================================
-- 3. CREATE GUEST COMMUNICATIONS TABLE
-- =====================================================

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

-- =====================================================
-- 4. CREATE CORPORATE ACCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  company_address TEXT,
  tax_id VARCHAR(50),
  contact_person VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  billing_preference VARCHAR(50) DEFAULT 'consolidated' CHECK (billing_preference IN ('consolidated', 'individual')),
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for corporate_id in guests table
ALTER TABLE guests 
DROP CONSTRAINT IF EXISTS guests_corporate_id_fkey;

ALTER TABLE guests 
ADD CONSTRAINT guests_corporate_id_fkey 
FOREIGN KEY (corporate_id) REFERENCES corporate_accounts(id);

-- =====================================================
-- 5. CREATE GUEST FEEDBACK TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS guest_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id UUID,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  comments TEXT,
  would_recommend BOOLEAN,
  feedback_date TIMESTAMP DEFAULT NOW(),
  response_required BOOLEAN DEFAULT false,
  staff_response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP
);

-- =====================================================
-- 6. CREATE GUEST PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS guest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  preference_type VARCHAR(50) NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guest_id, preference_type)
);

-- =====================================================
-- 7. CREATE GUEST DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS guest_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. CREATE GROUP BOOKINGS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(200) NOT NULL,
  group_leader_id UUID NOT NULL REFERENCES guests(id),
  total_guests INTEGER NOT NULL,
  event_type VARCHAR(100),
  special_requirements TEXT,
  group_discount_percentage DECIMAL(5,2) DEFAULT 0,
  booking_date TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_booking_id UUID NOT NULL REFERENCES group_bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_booking_id, guest_id)
);

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_corporate_id ON guests(corporate_id);
CREATE INDEX IF NOT EXISTS idx_guests_loyalty_tier ON guests(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_guest_id ON guest_feedback(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_rating ON guest_feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_guest_id ON loyalty_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_communications_guest_id ON guest_communications(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_communications_created_at ON guest_communications(created_at DESC);

-- =====================================================
-- 10. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_booking_guests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. CREATE RLS POLICIES
-- =====================================================

-- Guests policies
DROP POLICY IF EXISTS "Allow authenticated users to view guests" ON guests;
CREATE POLICY "Allow authenticated users to view guests" ON guests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guests" ON guests;
CREATE POLICY "Allow authenticated users to manage guests" ON guests
  FOR ALL TO authenticated USING (true);

-- Corporate accounts policies
DROP POLICY IF EXISTS "Allow authenticated users to view corporate accounts" ON corporate_accounts;
CREATE POLICY "Allow authenticated users to view corporate accounts" ON corporate_accounts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage corporate accounts" ON corporate_accounts;
CREATE POLICY "Allow authenticated users to manage corporate accounts" ON corporate_accounts
  FOR ALL TO authenticated USING (true);

-- Guest feedback policies
DROP POLICY IF EXISTS "Allow authenticated users to view guest feedback" ON guest_feedback;
CREATE POLICY "Allow authenticated users to view guest feedback" ON guest_feedback
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guest feedback" ON guest_feedback;
CREATE POLICY "Allow authenticated users to manage guest feedback" ON guest_feedback
  FOR ALL TO authenticated USING (true);

-- Loyalty transactions policies
DROP POLICY IF EXISTS "Allow authenticated users to view loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Allow authenticated users to view loyalty transactions" ON loyalty_transactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Allow authenticated users to manage loyalty transactions" ON loyalty_transactions
  FOR ALL TO authenticated USING (true);

-- Guest communications policies
DROP POLICY IF EXISTS "Allow authenticated users to view guest communications" ON guest_communications;
CREATE POLICY "Allow authenticated users to view guest communications" ON guest_communications
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guest communications" ON guest_communications;
CREATE POLICY "Allow authenticated users to manage guest communications" ON guest_communications
  FOR ALL TO authenticated USING (true);

-- Guest preferences policies
DROP POLICY IF EXISTS "Allow authenticated users to view guest preferences" ON guest_preferences;
CREATE POLICY "Allow authenticated users to view guest preferences" ON guest_preferences
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guest preferences" ON guest_preferences;
CREATE POLICY "Allow authenticated users to manage guest preferences" ON guest_preferences
  FOR ALL TO authenticated USING (true);

-- Guest documents policies
DROP POLICY IF EXISTS "Allow authenticated users to view guest documents" ON guest_documents;
CREATE POLICY "Allow authenticated users to view guest documents" ON guest_documents
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guest documents" ON guest_documents;
CREATE POLICY "Allow authenticated users to manage guest documents" ON guest_documents
  FOR ALL TO authenticated USING (true);

-- Group bookings policies
DROP POLICY IF EXISTS "Allow authenticated users to view group bookings" ON group_bookings;
CREATE POLICY "Allow authenticated users to view group bookings" ON group_bookings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage group bookings" ON group_bookings;
CREATE POLICY "Allow authenticated users to manage group bookings" ON group_bookings
  FOR ALL TO authenticated USING (true);

-- Group booking guests policies
DROP POLICY IF EXISTS "Allow authenticated users to view group booking guests" ON group_booking_guests;
CREATE POLICY "Allow authenticated users to view group booking guests" ON group_booking_guests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage group booking guests" ON group_booking_guests;
CREATE POLICY "Allow authenticated users to manage group booking guests" ON group_booking_guests
  FOR ALL TO authenticated USING (true);

-- =====================================================
-- 12. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_corporate_accounts_updated_at ON corporate_accounts;
CREATE TRIGGER update_corporate_accounts_updated_at
  BEFORE UPDATE ON corporate_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✓ Migration completed successfully!';
  RAISE NOTICE '✓ Created tables: guests, loyalty_transactions, guest_communications';
  RAISE NOTICE '✓ Created tables: corporate_accounts, guest_feedback, guest_preferences';
  RAISE NOTICE '✓ Created tables: guest_documents, group_bookings, group_booking_guests';
  RAISE NOTICE '✓ Created indexes for performance';
  RAISE NOTICE '✓ Enabled RLS and created policies';
  RAISE NOTICE '✓ Created helper functions and triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify tables in Table Editor';
  RAISE NOTICE '2. Refresh your application at http://localhost:3001';
  RAISE NOTICE '3. Test guest creation and management';
END $$;
