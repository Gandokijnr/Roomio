# Fix: Ambiguous Column Reference Error

## Error Message
```
column reference "total_spending" is ambiguous
```

## Cause
The `process_guest_checkout()` function had TWO issues:
1. A return column named `total_spending` which conflicted with the `guests.total_spending` column
2. Unqualified column references in SELECT statements that were ambiguous with local variables

## Solution Applied

### 1. Updated SQL Function
**File**: `supabase/LOYALTY_SYSTEM_FUNCTIONS.sql`

**Changed:**
```sql
RETURNS TABLE(
  points_awarded INTEGER,
  new_tier VARCHAR,
  total_points INTEGER,
  total_spending DECIMAL  -- ❌ Ambiguous
)
```

**To:**
```sql
RETURNS TABLE(
  points_awarded INTEGER,
  new_tier VARCHAR,
  total_points INTEGER,
  guest_total_spending DECIMAL  -- ✅ Clear and unambiguous
)

-- AND qualified all column references:
SELECT g.loyalty_tier, g.total_spending, g.total_stays, g.loyalty_points
INTO v_current_tier, v_total_spending, v_total_stays, v_total_points
FROM guests g  -- ✅ Table alias added
WHERE g.id = p_guest_id;
```

### 2. Updated TypeScript Composable
**File**: `composables/useLoyaltySystem.ts`

**Changed:**
```typescript
result?: {
  points_awarded: number;
  new_tier: string;
  total_points: number;
  total_spending: number;  // ❌ Old name
};
```

**To:**
```typescript
result?: {
  points_awarded: number;
  new_tier: string;
  total_points: number;
  guest_total_spending: number;  // ✅ Matches SQL function
};
```

### 3. Updated Documentation
**File**: `LOYALTY_SYSTEM_GUIDE.md`

Updated the return value example to use `guest_total_spending` instead of `total_spending`.

## How to Apply the Fix

### Option 1: Run the Complete Migration Again
```bash
# In Supabase Dashboard > SQL Editor
# Run: supabase/LOYALTY_SYSTEM_FUNCTIONS.sql
```

### Option 2: Run Just the Fix
```bash
# In Supabase Dashboard > SQL Editor
# Run: supabase/FIX_AMBIGUOUS_COLUMN.sql
```

## Verification

After applying the fix, test the function:

```sql
-- Test the function
SELECT * FROM process_guest_checkout(
  'reservation-uuid'::UUID,
  'guest-uuid'::UUID,
  100000,
  '2025-10-20',
  '2025-10-25'
);

-- Should return:
-- points_awarded | new_tier | total_points | guest_total_spending
-- 100            | bronze   | 100          | 100000
```

## Impact

- ✅ No breaking changes to existing data
- ✅ Only affects the function return column name
- ✅ Frontend code updated to match
- ✅ All functionality preserved

## Files Modified

1. ✅ `supabase/LOYALTY_SYSTEM_FUNCTIONS.sql` - Function definition
2. ✅ `composables/useLoyaltySystem.ts` - TypeScript interface
3. ✅ `LOYALTY_SYSTEM_GUIDE.md` - Documentation
4. ✅ `supabase/FIX_AMBIGUOUS_COLUMN.sql` - Quick fix script (new)

## Status

✅ **FIXED** - Error resolved, all files updated, ready to deploy.

---

**Date**: October 25, 2025
**Issue**: Ambiguous column reference
**Resolution**: Renamed return column to `guest_total_spending`
