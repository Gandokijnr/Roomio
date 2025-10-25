-- =====================================================
-- COMPLETE SETUP - ALL TABLES AND FUNCTIONS
-- =====================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This creates everything needed for the loyalty system

-- =====================================================
-- STEP 1: CREATE TABLES
-- =====================================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_guest_id ON loyalty_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_communications_guest_id ON guest_communications(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_communications_created_at ON guest_communications(created_at DESC);

-- Enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- =====================================================
-- STEP 2: CREATE FUNCTIONS
-- =====================================================

-- Function 1: Calculate Loyalty Points
CREATE OR REPLACE FUNCTION calculate_loyalty_points(
  p_amount DECIMAL,
  p_loyalty_tier VARCHAR DEFAULT 'bronze'
)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
  v_multiplier DECIMAL;
BEGIN
  v_multiplier := CASE p_loyalty_tier
    WHEN 'platinum' THEN 2.0
    WHEN 'gold' THEN 1.5
    WHEN 'silver' THEN 1.25
    ELSE 1.0
  END;
  
  v_points := FLOOR((p_amount / 1000) * v_multiplier)::INTEGER;
  RETURN GREATEST(v_points, 0);
END;
$$ LANGUAGE plpgsql;

-- Function 2: Determine Loyalty Tier
CREATE OR REPLACE FUNCTION determine_loyalty_tier(
  p_total_spending DECIMAL,
  p_total_stays INTEGER
)
RETURNS VARCHAR AS $$
BEGIN
  IF p_total_spending >= 1000000 OR p_total_stays >= 20 THEN
    RETURN 'platinum';
  ELSIF p_total_spending >= 500000 OR p_total_stays >= 10 THEN
    RETURN 'gold';
  ELSIF p_total_spending >= 200000 OR p_total_stays >= 5 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Process Guest Checkout
DROP FUNCTION IF EXISTS process_guest_checkout(UUID, UUID, NUMERIC, DATE, DATE);

CREATE OR REPLACE FUNCTION process_guest_checkout(
  p_reservation_id UUID,
  p_guest_id UUID,
  p_total_amount DECIMAL,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS TABLE(
  points_awarded INTEGER,
  new_tier VARCHAR,
  total_points INTEGER,
  guest_total_spending DECIMAL
) AS $$
DECLARE
  v_points_awarded INTEGER;
  v_current_tier VARCHAR;
  v_new_tier VARCHAR;
  v_total_spending DECIMAL;
  v_total_stays INTEGER;
  v_total_points INTEGER;
  v_stay_duration INTEGER;
BEGIN
  SELECT g.loyalty_tier, g.total_spending, g.total_stays, g.loyalty_points
  INTO v_current_tier, v_total_spending, v_total_stays, v_total_points
  FROM guests g
  WHERE g.id = p_guest_id;
  
  v_stay_duration := p_check_out_date - p_check_in_date;
  v_points_awarded := calculate_loyalty_points(p_total_amount, v_current_tier);
  
  UPDATE guests
  SET 
    total_stays = total_stays + 1,
    total_spending = total_spending + p_total_amount,
    loyalty_points = loyalty_points + v_points_awarded,
    last_visit_date = NOW(),
    updated_at = NOW()
  WHERE id = p_guest_id;
  
  SELECT g.total_spending, g.total_stays, g.loyalty_points
  INTO v_total_spending, v_total_stays, v_total_points
  FROM guests g
  WHERE g.id = p_guest_id;
  
  v_new_tier := determine_loyalty_tier(v_total_spending, v_total_stays);
  
  IF v_new_tier != v_current_tier THEN
    UPDATE guests
    SET loyalty_tier = v_new_tier, updated_at = NOW()
    WHERE id = p_guest_id;
  END IF;
  
  INSERT INTO loyalty_transactions (guest_id, transaction_type, points, description, reservation_id, created_at)
  VALUES (p_guest_id, 'earned', v_points_awarded, 
          FORMAT('Points earned from %s-day stay (₦%s spent)', v_stay_duration, p_total_amount),
          p_reservation_id, NOW());
  
  RETURN QUERY SELECT v_points_awarded, v_new_tier, v_total_points, v_total_spending;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Get Active Reservation Stats
CREATE OR REPLACE FUNCTION get_active_reservation_stats(p_guest_id UUID)
RETURNS TABLE(
  reservation_id UUID,
  room_number TEXT,
  check_in_date DATE,
  check_out_date DATE,
  days_remaining INTEGER,
  total_days INTEGER,
  current_spending DECIMAL,
  estimated_points INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    rm.room_number,
    r.check_in_date,
    r.check_out_date,
    (r.check_out_date - CURRENT_DATE)::INTEGER as days_remaining,
    (r.check_out_date - r.check_in_date)::INTEGER as total_days,
    r.total_amount,
    calculate_loyalty_points(r.total_amount, g.loyalty_tier) as estimated_points
  FROM reservations r
  JOIN guests g ON g.id = r.guest_id
  LEFT JOIN rooms rm ON rm.id = r.room_id
  WHERE r.guest_id = p_guest_id
    AND r.status IN ('confirmed', 'checked_in')
    AND r.check_out_date >= CURRENT_DATE
  ORDER BY r.check_out_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Redeem Loyalty Points
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_guest_id UUID,
  p_points_to_redeem INTEGER,
  p_description TEXT DEFAULT 'Points redeemed for discount'
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  message TEXT
) AS $$
DECLARE
  v_current_points INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT loyalty_points INTO v_current_points
  FROM guests
  WHERE id = p_guest_id;
  
  IF v_current_points < p_points_to_redeem THEN
    RETURN QUERY SELECT 
      false,
      v_current_points,
      FORMAT('Insufficient points. Available: %s, Requested: %s', v_current_points, p_points_to_redeem);
    RETURN;
  END IF;
  
  UPDATE guests
  SET loyalty_points = loyalty_points - p_points_to_redeem,
      updated_at = NOW()
  WHERE id = p_guest_id
  RETURNING loyalty_points INTO v_new_balance;
  
  INSERT INTO loyalty_transactions (guest_id, transaction_type, points, description, created_at)
  VALUES (p_guest_id, 'redeemed', -p_points_to_redeem, p_description, NOW());
  
  RETURN QUERY SELECT 
    true,
    v_new_balance,
    FORMAT('Successfully redeemed %s points. New balance: %s', p_points_to_redeem, v_new_balance);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: CREATE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_process_checkout()
RETURNS TRIGGER AS $$
DECLARE
  v_result RECORD;
BEGIN
  IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    SELECT * INTO v_result
    FROM process_guest_checkout(
      NEW.id,
      NEW.guest_id,
      NEW.total_amount,
      NEW.check_in_date,
      NEW.check_out_date
    );
    
    RAISE NOTICE 'Guest checkout processed: % points awarded, new tier: %', 
      v_result.points_awarded, v_result.new_tier;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_process_checkout ON reservations;

CREATE TRIGGER trigger_auto_process_checkout
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_checkout();

-- =====================================================
-- STEP 4: CREATE VIEW
-- =====================================================

CREATE OR REPLACE VIEW guest_loyalty_stats AS
SELECT 
  g.id,
  g.first_name,
  g.last_name,
  g.email,
  g.loyalty_tier,
  g.loyalty_points,
  g.total_stays,
  g.total_spending,
  g.last_visit_date,
  CASE g.loyalty_tier
    WHEN 'bronze' THEN LEAST(100, (g.total_spending / 2000)::INTEGER)
    WHEN 'silver' THEN LEAST(100, ((g.total_spending - 200000) / 3000)::INTEGER)
    WHEN 'gold' THEN LEAST(100, ((g.total_spending - 500000) / 5000)::INTEGER)
    ELSE 100
  END as tier_progress_percentage,
  CASE g.loyalty_tier
    WHEN 'bronze' THEN 'silver'
    WHEN 'silver' THEN 'gold'
    WHEN 'gold' THEN 'platinum'
    ELSE 'max'
  END as next_tier,
  CASE g.loyalty_tier
    WHEN 'bronze' THEN 200000 - g.total_spending
    WHEN 'silver' THEN 500000 - g.total_spending
    WHEN 'gold' THEN 1000000 - g.total_spending
    ELSE 0
  END as spending_to_next_tier,
  (SELECT COUNT(*) 
   FROM reservations r 
   WHERE r.guest_id = g.id 
     AND r.status IN ('confirmed', 'checked_in')
     AND r.check_out_date >= CURRENT_DATE
  ) as active_reservations,
  g.total_spending as lifetime_value,
  CASE WHEN g.total_stays > 0 
    THEN (g.total_spending / g.total_stays)::DECIMAL(10,2)
    ELSE 0 
  END as avg_spending_per_stay
FROM guests g;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPLETE SETUP SUCCESSFUL!';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✓ loyalty_transactions';
  RAISE NOTICE '  ✓ guest_communications';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  ✓ calculate_loyalty_points()';
  RAISE NOTICE '  ✓ determine_loyalty_tier()';
  RAISE NOTICE '  ✓ process_guest_checkout()';
  RAISE NOTICE '  ✓ get_active_reservation_stats()';
  RAISE NOTICE '  ✓ redeem_loyalty_points()';
  RAISE NOTICE '  ✓ auto_process_checkout()';
  RAISE NOTICE '';
  RAISE NOTICE 'Trigger Created:';
  RAISE NOTICE '  ✓ trigger_auto_process_checkout';
  RAISE NOTICE '';
  RAISE NOTICE 'View Created:';
  RAISE NOTICE '  ✓ guest_loyalty_stats';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE 'Your loyalty system is ready to use!';
  RAISE NOTICE 'Refresh your app at http://localhost:3001';
  RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
