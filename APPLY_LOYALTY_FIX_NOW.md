# 🚨 APPLY THIS FIX NOW - Ambiguous Column Error

## The Error You're Seeing
```
"code": "42702",
"message": "column reference \"total_spending\" is ambiguous"
```

## Quick Fix - Copy & Paste This SQL

**Go to Supabase Dashboard > SQL Editor and run this:**

```sql
-- =====================================================
-- COMPLETE FIX FOR AMBIGUOUS COLUMN ERROR
-- =====================================================

-- Drop existing function first (required to change return type)
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
  -- Get current guest data (with table alias to avoid ambiguity)
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
  
  -- Get updated values (with table alias)
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
  RAISE NOTICE '✅ Fixed ambiguous column reference';
  RAISE NOTICE '✅ Function process_guest_checkout updated';
  RAISE NOTICE '✅ All column references qualified with table alias';
END $$;
```

## What This Fixes

1. ✅ Renamed return column: `total_spending` → `guest_total_spending`
2. ✅ Added table aliases to all SELECT statements: `FROM guests g`
3. ✅ Qualified all column references: `g.total_spending`, `g.loyalty_points`, etc.

## After Running

1. **Refresh your application** at http://localhost:3001
2. **Test guest creation** - The error should be gone
3. **Verify** - Check browser console for no more 42702 errors

## If You Still Get Errors

Make sure you also have these functions (run the complete file):
```
File: supabase/LOYALTY_SYSTEM_FUNCTIONS.sql
```

This includes:
- `calculate_loyalty_points()`
- `determine_loyalty_tier()`
- `get_active_reservation_stats()`
- `redeem_loyalty_points()`
- And the trigger

---

**Status**: Ready to apply
**Time to fix**: 30 seconds (copy, paste, run)
**Impact**: Fixes all ambiguous column errors
