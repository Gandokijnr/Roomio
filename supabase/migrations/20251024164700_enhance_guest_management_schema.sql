-- Enhanced Guest Management Schema
-- This migration adds comprehensive guest management features

-- Enhance the existing guests table with additional fields
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS guest_id VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS id_type VARCHAR(50) CHECK (id_type IN ('passport', 'national_id', 'driver_license', 'other')),
ADD COLUMN IF NOT EXISTS id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS company VARCHAR(200),
ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS special_preferences TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_stays INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spending DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS corporate_id UUID REFERENCES corporate_accounts(id),
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create function to generate guest ID
CREATE OR REPLACE FUNCTION generate_guest_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.guest_id IS NULL THEN
    NEW.guest_id := 'GST-' || LPAD(nextval('guest_id_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for guest IDs
CREATE SEQUENCE IF NOT EXISTS guest_id_seq START 1;

-- Create trigger for auto-generating guest IDs
DROP TRIGGER IF EXISTS generate_guest_id_trigger ON guests;
CREATE TRIGGER generate_guest_id_trigger
  BEFORE INSERT ON guests
  FOR EACH ROW
  EXECUTE FUNCTION generate_guest_id();

-- Create corporate accounts table
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
  payment_terms INTEGER DEFAULT 30, -- days
  credit_limit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create guest feedback table
CREATE TABLE IF NOT EXISTS guest_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
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
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP
);

-- Create loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  points INTEGER NOT NULL,
  description TEXT,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Create guest communications table
CREATE TABLE IF NOT EXISTS guest_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  communication_type VARCHAR(20) CHECK (communication_type IN ('email', 'sms', 'call', 'in_person')),
  subject VARCHAR(255),
  message TEXT,
  direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create guest preferences table
CREATE TABLE IF NOT EXISTS guest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  preference_type VARCHAR(50) NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guest_id, preference_type)
);

-- Create guest documents table (for ID uploads)
CREATE TABLE IF NOT EXISTS guest_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create group bookings table
CREATE TABLE IF NOT EXISTS group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(200) NOT NULL,
  group_leader_id UUID NOT NULL REFERENCES guests(id),
  total_guests INTEGER NOT NULL,
  event_type VARCHAR(100),
  special_requirements TEXT,
  group_discount_percentage DECIMAL(5,2) DEFAULT 0,
  booking_date TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create group booking guests junction table
CREATE TABLE IF NOT EXISTS group_booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_booking_id UUID NOT NULL REFERENCES group_bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_booking_id, guest_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guests_guest_id ON guests(guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_corporate_id ON guests(corporate_id);
CREATE INDEX IF NOT EXISTS idx_guests_loyalty_tier ON guests(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_guest_id ON guest_feedback(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_rating ON guest_feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_guest_id ON loyalty_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_communications_guest_id ON guest_communications(guest_id);

-- Create function to update guest stats
CREATE OR REPLACE FUNCTION update_guest_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guest statistics when reservation status changes to checked_out
  IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    UPDATE guests 
    SET 
      total_stays = total_stays + 1,
      total_spending = total_spending + NEW.total_amount,
      last_visit_date = NEW.actual_check_out,
      updated_at = NOW()
    WHERE id = NEW.guest_id;
    
    -- Award loyalty points (1 point per ₦1000 spent)
    INSERT INTO loyalty_transactions (guest_id, transaction_type, points, description, reservation_id)
    VALUES (
      NEW.guest_id, 
      'earned', 
      FLOOR(NEW.total_amount / 1000)::INTEGER,
      'Points earned from stay',
      NEW.id
    );
    
    -- Update loyalty points total
    UPDATE guests 
    SET loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 1000)::INTEGER
    WHERE id = NEW.guest_id;
    
    -- Update loyalty tier based on total spending
    UPDATE guests 
    SET loyalty_tier = CASE 
      WHEN total_spending >= 1000000 THEN 'platinum'
      WHEN total_spending >= 500000 THEN 'gold'
      WHEN total_spending >= 200000 THEN 'silver'
      ELSE 'bronze'
    END
    WHERE id = NEW.guest_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating guest stats
DROP TRIGGER IF EXISTS update_guest_stats_trigger ON reservations;
CREATE TRIGGER update_guest_stats_trigger
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_stats();

-- Create function to update updated_at timestamp
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

-- Create RLS policies
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_booking_guests ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view corporate accounts" ON corporate_accounts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage corporate accounts" ON corporate_accounts
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view guest feedback" ON guest_feedback
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage guest feedback" ON guest_feedback
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view loyalty transactions" ON loyalty_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage loyalty transactions" ON loyalty_transactions
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view guest communications" ON guest_communications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage guest communications" ON guest_communications
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view guest preferences" ON guest_preferences
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage guest preferences" ON guest_preferences
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view guest documents" ON guest_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage guest documents" ON guest_documents
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view group bookings" ON group_bookings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage group bookings" ON group_bookings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view group booking guests" ON group_booking_guests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage group booking guests" ON group_booking_guests
  FOR ALL TO authenticated USING (true);
