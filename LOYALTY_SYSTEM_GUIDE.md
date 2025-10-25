# Loyalty System Implementation Guide

## Overview

The loyalty system automatically:
- ✅ Awards points when guests check out
- ✅ Calculates points based on spending and tier
- ✅ Upgrades loyalty tiers automatically
- ✅ Tracks days remaining until checkout
- ✅ Records all transactions
- ✅ Sends email notifications

## Setup Instructions

### Step 1: Apply Database Functions

Run this in Supabase Dashboard > SQL Editor:

```bash
File: supabase/LOYALTY_SYSTEM_FUNCTIONS.sql
```

This creates:
- `calculate_loyalty_points()` - Calculate points based on spending
- `determine_loyalty_tier()` - Determine tier based on spending/stays
- `process_guest_checkout()` - Auto-award points on checkout
- `get_active_reservation_stats()` - Get real-time reservation stats
- `redeem_loyalty_points()` - Redeem points with validation
- `auto_process_checkout()` - Trigger function for automatic processing
- `guest_loyalty_stats` - View for dashboard statistics

### Step 2: Verify Tables Exist

Ensure these tables are in your database:
- ✓ `guests` (with loyalty columns)
- ✓ `loyalty_transactions`
- ✓ `reservations`

## How It Works

### Automatic Points Award

When a reservation status changes to `checked_out`:

1. **Trigger fires** (`trigger_auto_process_checkout`)
2. **Points calculated** based on:
   - Total amount spent
   - Current loyalty tier (multiplier)
   - Formula: `(amount / 1000) × tier_multiplier`
3. **Guest stats updated**:
   - `total_stays` +1
   - `total_spending` += amount
   - `loyalty_points` += calculated points
   - `last_visit_date` = now
4. **Tier evaluated** and upgraded if threshold met
5. **Transaction recorded** in `loyalty_transactions`
6. **Email sent** to guest with points earned

### Tier Thresholds

| Tier | Spending Required | Stays Required | Points Multiplier |
|------|------------------|----------------|-------------------|
| Bronze | ₦0 | 0 | 1.0x |
| Silver | ₦200,000 | 5 | 1.25x |
| Gold | ₦500,000 | 10 | 1.5x |
| Platinum | ₦1,000,000 | 20 | 2.0x |

### Points Calculation Examples

**Bronze Guest** (1x multiplier):
- Spends ₦50,000 → Earns 50 points
- Spends ₦150,000 → Earns 150 points

**Gold Guest** (1.5x multiplier):
- Spends ₦50,000 → Earns 75 points
- Spends ₦150,000 → Earns 225 points

**Platinum Guest** (2x multiplier):
- Spends ₦50,000 → Earns 100 points
- Spends ₦150,000 → Earns 300 points

## Usage in Code

### Get Active Reservation Stats

```typescript
const { getActiveReservationStats } = useLoyaltySystem()

const { stats, error } = await getActiveReservationStats(guestId)

// Returns:
// {
//   reservation_id: UUID,
//   room_number: "101",
//   check_in_date: "2025-10-20",
//   check_out_date: "2025-10-25",
//   days_remaining: 3,
//   total_days: 5,
//   current_spending: 250000,
//   estimated_points: 250
// }
```

### Manual Checkout Processing

```typescript
const { processCheckout } = useLoyaltySystem()

const { result, error } = await processCheckout(
  reservationId,
  guestId,
  totalAmount,
  checkInDate,
  checkOutDate
)

// Returns:
// {
//   points_awarded: 150,
//   new_tier: "silver",
//   total_points: 1250,
//   guest_total_spending: 350000
// }
```

### Redeem Points

```typescript
const { redeemPointsWithDB } = useLoyaltySystem()

const { result, error } = await redeemPointsWithDB(
  guestId,
  500,
  "Room upgrade discount"
)

// Returns:
// {
//   success: true,
//   new_balance: 750,
//   message: "Successfully redeemed 500 points. New balance: 750"
// }
```

### Calculate Days Remaining

```typescript
const { calculateDaysRemaining } = useLoyaltySystem()

const daysLeft = calculateDaysRemaining("2025-10-30")
// Returns: 5 (if today is Oct 25)
```

### Get Loyalty Stats

```typescript
const { getLoyaltyStats } = useLoyaltySystem()

const { stats, error } = await getLoyaltyStats(guestId)

// Returns:
// {
//   tier_progress_percentage: 65,
//   next_tier: "gold",
//   spending_to_next_tier: 150000,
//   active_reservations: 2,
//   lifetime_value: 350000,
//   avg_spending_per_stay: 70000
// }
```

## Display in UI

### Show Active Reservations with Days Remaining

```vue
<template>
  <div v-for="stat in activeStats" :key="stat.reservation_id">
    <div class="reservation-card">
      <h4>Room {{ stat.room_number }}</h4>
      <p>{{ stat.days_remaining }} days remaining</p>
      <p>Estimated points: {{ stat.estimated_points }}</p>
      <div class="progress-bar">
        <div :style="{ width: progressPercent(stat) + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getActiveReservationStats } = useLoyaltySystem()
const activeStats = ref([])

onMounted(async () => {
  const { stats } = await getActiveReservationStats(guestId)
  activeStats.value = stats || []
})

const progressPercent = (stat) => {
  const elapsed = stat.total_days - stat.days_remaining
  return (elapsed / stat.total_days) * 100
}
</script>
```

### Show Loyalty Progress

```vue
<template>
  <div class="loyalty-stats">
    <div class="tier-badge">{{ stats.loyalty_tier }}</div>
    <div class="progress">
      <div class="bar" :style="{ width: stats.tier_progress_percentage + '%' }"></div>
    </div>
    <p>₦{{ stats.spending_to_next_tier.toLocaleString() }} to {{ stats.next_tier }}</p>
    <p>{{ stats.loyalty_points }} points available</p>
  </div>
</template>

<script setup>
const { getLoyaltyStats } = useLoyaltySystem()
const stats = ref({})

onMounted(async () => {
  const { stats: data } = await getLoyaltyStats(guestId)
  stats.value = data
})
</script>
```

## Testing

### Test Automatic Checkout

1. Create a reservation with status `checked_in`
2. Update reservation status to `checked_out`
3. Check `loyalty_transactions` table for new entry
4. Verify guest's `loyalty_points` increased
5. Check if tier was upgraded

### Test Points Calculation

```sql
-- Test bronze tier (1x multiplier)
SELECT calculate_loyalty_points(100000, 'bronze');
-- Expected: 100 points

-- Test platinum tier (2x multiplier)
SELECT calculate_loyalty_points(100000, 'platinum');
-- Expected: 200 points
```

### Test Tier Determination

```sql
SELECT determine_loyalty_tier(250000, 6);
-- Expected: 'silver'

SELECT determine_loyalty_tier(600000, 12);
-- Expected: 'gold'
```

## Monitoring

### View All Loyalty Stats

```sql
SELECT * FROM guest_loyalty_stats
ORDER BY lifetime_value DESC
LIMIT 10;
```

### Recent Transactions

```sql
SELECT 
  g.first_name,
  g.last_name,
  lt.transaction_type,
  lt.points,
  lt.description,
  lt.created_at
FROM loyalty_transactions lt
JOIN guests g ON g.id = lt.guest_id
ORDER BY lt.created_at DESC
LIMIT 20;
```

### Tier Distribution

```sql
SELECT 
  loyalty_tier,
  COUNT(*) as guest_count,
  SUM(loyalty_points) as total_points,
  AVG(total_spending) as avg_spending
FROM guests
GROUP BY loyalty_tier
ORDER BY 
  CASE loyalty_tier
    WHEN 'platinum' THEN 4
    WHEN 'gold' THEN 3
    WHEN 'silver' THEN 2
    ELSE 1
  END DESC;
```

## Troubleshooting

### Points Not Awarded on Checkout

**Check:**
1. Trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_process_checkout';`
2. Reservation status changed to `checked_out`
3. Guest ID is valid
4. Total amount is > 0

### Tier Not Upgrading

**Check:**
1. Guest's `total_spending` meets threshold
2. Run manually: `SELECT determine_loyalty_tier(total_spending, total_stays) FROM guests WHERE id = 'guest_id';`
3. Update manually if needed: `UPDATE guests SET loyalty_tier = 'gold' WHERE id = 'guest_id';`

### Days Remaining Incorrect

**Check:**
1. `check_out_date` is in the future
2. Date format is correct (YYYY-MM-DD)
3. Timezone settings

## Best Practices

1. **Always use database functions** for points/tier calculations
2. **Let triggers handle** automatic checkout processing
3. **Validate points** before redemption
4. **Log all transactions** for audit trail
5. **Send email notifications** for tier upgrades
6. **Display real-time stats** in guest dashboard
7. **Show progress bars** for tier advancement
8. **Highlight days remaining** for active stays

## Next Steps

1. ✅ Run `LOYALTY_SYSTEM_FUNCTIONS.sql` in Supabase
2. ✅ Test automatic checkout with sample reservation
3. ✅ Integrate stats display in guest dashboard
4. ✅ Add points redemption UI
5. ✅ Configure email templates
6. ✅ Train staff on loyalty features

---

**Last Updated**: October 25, 2025
**Version**: 1.0.0
**Status**: Ready for Production
