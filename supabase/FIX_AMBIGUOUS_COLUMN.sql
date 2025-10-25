-- =====================================================
-- FIX: Ambiguous Column Reference
-- =====================================================
-- This fixes the "column reference 'total_spending' is ambiguous" error
-- by renaming the return column in process_guest_checkout function

-- Drop existing function first (required to change return type)
DROP FUNCTION IF EXISTS process_guest_checkout(UUID, UUID, NUMERIC, DATE, DATE);

-- Recreate the function with fixed column name
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
  guest_total_spending DECIMAL  -- Changed from 'total_spending' to avoid ambiguity
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

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✓ Fixed ambiguous column reference';
  RAISE NOTICE '✓ Function process_guest_checkout updated';
  RAISE NOTICE '✓ Return column renamed: total_spending → guest_total_spending';
END $$;
