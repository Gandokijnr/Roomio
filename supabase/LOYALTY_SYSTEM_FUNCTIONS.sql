-- =====================================================
-- LOYALTY SYSTEM - AUTOMATED POINTS & STATS
-- =====================================================

-- This script creates functions to automatically:
-- 1. Award loyalty points on checkout
-- 2. Update guest statistics
-- 3. Upgrade loyalty tiers
-- 4. Track stay duration and spending

-- =====================================================
-- 1. FUNCTION: Calculate Points Based on Spending
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_loyalty_points(
  p_amount DECIMAL,
  p_loyalty_tier VARCHAR DEFAULT 'bronze'
)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
  v_multiplier DECIMAL;
BEGIN
  -- Set multiplier based on tier
  v_multiplier := CASE p_loyalty_tier
    WHEN 'platinum' THEN 2.0  -- 2x points
    WHEN 'gold' THEN 1.5      -- 1.5x points
    WHEN 'silver' THEN 1.25   -- 1.25x points
    ELSE 1.0                  -- 1x points (bronze)
  END;
  
  -- Calculate points: 1 point per ₦1000 spent, with tier multiplier
  v_points := FLOOR((p_amount / 1000) * v_multiplier)::INTEGER;
  
  RETURN GREATEST(v_points, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNCTION: Determine Loyalty Tier Based on Spending
-- =====================================================

CREATE OR REPLACE FUNCTION determine_loyalty_tier(
  p_total_spending DECIMAL,
  p_total_stays INTEGER
)
RETURNS VARCHAR AS $$
BEGIN
  -- Tier thresholds (can be adjusted)
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

-- =====================================================
-- 3. FUNCTION: Process Checkout and Award Points
-- =====================================================

-- Drop existing function if it exists (to allow return type change)
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
  -- Get current guest data
  SELECT g.loyalty_tier, g.total_spending, g.total_stays, g.loyalty_points
  INTO v_current_tier, v_total_spending, v_total_stays, v_total_points
  FROM guests g
  WHERE g.id = p_guest_id;
  
  -- Calculate stay duration in days
  v_stay_duration := p_check_out_date - p_check_in_date;
  
  -- Calculate points to award
  v_points_awarded := calculate_loyalty_points(p_total_amount, v_current_tier);
  
  -- Update guest statistics
  UPDATE guests
  SET 
    total_stays = total_stays + 1,
    total_spending = total_spending + p_total_amount,
    loyalty_points = loyalty_points + v_points_awarded,
    last_visit_date = NOW(),
    updated_at = NOW()
  WHERE id = p_guest_id;
  
  -- Get updated values
  SELECT g.total_spending, g.total_stays, g.loyalty_points
  INTO v_total_spending, v_total_stays, v_total_points
  FROM guests g
  WHERE g.id = p_guest_id;
  
  -- Determine new tier
  v_new_tier := determine_loyalty_tier(v_total_spending, v_total_stays);
  
  -- Update tier if changed
  IF v_new_tier != v_current_tier THEN
    UPDATE guests
    SET loyalty_tier = v_new_tier,
        updated_at = NOW()
    WHERE id = p_guest_id;
  END IF;
  
  -- Record loyalty transaction
  INSERT INTO loyalty_transactions (
    guest_id,
    transaction_type,
    points,
    description,
    reservation_id,
    created_at
  ) VALUES (
    p_guest_id,
    'earned',
    v_points_awarded,
    FORMAT('Points earned from %s-day stay (₦%s spent)', v_stay_duration, p_total_amount),
    p_reservation_id,
    NOW()
  );
  
  -- Return results
  RETURN QUERY SELECT 
    v_points_awarded,
    v_new_tier,
    v_total_points,
    v_total_spending;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCTION: Calculate Days Until Checkout
-- =====================================================

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

-- =====================================================
-- 5. FUNCTION: Redeem Loyalty Points
-- =====================================================

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
  -- Get current points
  SELECT loyalty_points INTO v_current_points
  FROM guests
  WHERE id = p_guest_id;
  
  -- Check if guest has enough points
  IF v_current_points < p_points_to_redeem THEN
    RETURN QUERY SELECT 
      false,
      v_current_points,
      FORMAT('Insufficient points. Available: %s, Requested: %s', v_current_points, p_points_to_redeem);
    RETURN;
  END IF;
  
  -- Deduct points
  UPDATE guests
  SET loyalty_points = loyalty_points - p_points_to_redeem,
      updated_at = NOW()
  WHERE id = p_guest_id
  RETURNING loyalty_points INTO v_new_balance;
  
  -- Record transaction
  INSERT INTO loyalty_transactions (
    guest_id,
    transaction_type,
    points,
    description,
    created_at
  ) VALUES (
    p_guest_id,
    'redeemed',
    -p_points_to_redeem,
    p_description,
    NOW()
  );
  
  RETURN QUERY SELECT 
    true,
    v_new_balance,
    FORMAT('Successfully redeemed %s points. New balance: %s', p_points_to_redeem, v_new_balance);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGER: Auto-process checkout when status changes
-- =====================================================

CREATE OR REPLACE FUNCTION auto_process_checkout()
RETURNS TRIGGER AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Only process when status changes to 'checked_out'
  IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    -- Process checkout and award points
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_process_checkout ON reservations;

-- Create trigger on reservations table
CREATE TRIGGER trigger_auto_process_checkout
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_checkout();

-- =====================================================
-- 7. VIEW: Guest Loyalty Dashboard Stats
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
  -- Calculate tier progress
  CASE g.loyalty_tier
    WHEN 'bronze' THEN LEAST(100, (g.total_spending / 2000)::INTEGER)
    WHEN 'silver' THEN LEAST(100, ((g.total_spending - 200000) / 3000)::INTEGER)
    WHEN 'gold' THEN LEAST(100, ((g.total_spending - 500000) / 5000)::INTEGER)
    ELSE 100
  END as tier_progress_percentage,
  -- Next tier info
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
  -- Active reservations count
  (SELECT COUNT(*) 
   FROM reservations r 
   WHERE r.guest_id = g.id 
     AND r.status IN ('confirmed', 'checked_in')
     AND r.check_out_date >= CURRENT_DATE
  ) as active_reservations,
  -- Lifetime value
  g.total_spending as lifetime_value,
  -- Average spending per stay
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
  RAISE NOTICE '✓ Loyalty system functions created successfully!';
  RAISE NOTICE '✓ Auto-checkout trigger enabled';
  RAISE NOTICE '✓ Guest loyalty stats view created';
  RAISE NOTICE '';
  RAISE NOTICE 'Available functions:';
  RAISE NOTICE '  - calculate_loyalty_points(amount, tier)';
  RAISE NOTICE '  - determine_loyalty_tier(spending, stays)';
  RAISE NOTICE '  - process_guest_checkout(reservation_id, guest_id, amount, check_in, check_out)';
  RAISE NOTICE '  - get_active_reservation_stats(guest_id)';
  RAISE NOTICE '  - redeem_loyalty_points(guest_id, points, description)';
  RAISE NOTICE '';
  RAISE NOTICE 'Automatic features:';
  RAISE NOTICE '  - Points awarded automatically on checkout';
  RAISE NOTICE '  - Tier upgrades processed automatically';
  RAISE NOTICE '  - Transaction history recorded';
END $$;
