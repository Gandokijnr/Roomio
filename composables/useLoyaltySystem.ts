import type { Guest, LoyaltyTransaction, GuestFeedback } from '~/types/database'

export const useLoyaltySystem = () => {
  const { $supabase } = useNuxtApp()
  const { sendTierUpgrade, sendLoyaltyUpdate } = useEmailNotifications()

  // Tier thresholds in Naira
  const TIER_THRESHOLDS = {
    bronze: 0,
    silver: 200000, // ₦200,000
    gold: 500000,   // ₦500,000
    platinum: 1000000 // ₦1,000,000
  }

  // Points earning rules
  const POINTS_RULES = {
    staySpending: 0.001, // 1 point per ₦1,000 spent
    feedback: 100,       // 100 points for giving feedback
    referral: 500,       // 500 points for successful referral
    birthdayBonus: 200   // 200 points on birthday
  }

  // Redemption rates
  const REDEMPTION_RATES = {
    roomDiscount: 1,    // ₦1 discount per point
    roomUpgrade: 5000,  // 5,000 points for room upgrade
    freeNight: 10000    // 10,000 points for free night
  }

  const calculateTier = (totalSpending: number): string => {
    if (totalSpending >= TIER_THRESHOLDS.platinum) return 'platinum'
    if (totalSpending >= TIER_THRESHOLDS.gold) return 'gold'
    if (totalSpending >= TIER_THRESHOLDS.silver) return 'silver'
    return 'bronze'
  }

  const calculateNextTier = (currentTier: string, totalSpending: number): {
    nextTier: string | null;
    remainingAmount: number;
    progress: number;
  } => {
    const tierLevels = ['bronze', 'silver', 'gold', 'platinum']
    const currentIndex = tierLevels.indexOf(currentTier.toLowerCase())
    
    if (currentIndex === tierLevels.length - 1) {
      return { nextTier: null, remainingAmount: 0, progress: 100 }
    }

    const nextTier = tierLevels[currentIndex + 1]
    const nextTierThreshold = TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS]
    const currentTierThreshold = TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS]
    const remainingAmount = Math.max(0, nextTierThreshold - totalSpending)
    const progress = Math.min(100, ((totalSpending - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100)

    return { nextTier, remainingAmount, progress }
  }

  const awardPoints = async (
    guestId: string,
    points: number,
    reason: string,
    transactionType: 'earned' | 'adjusted' = 'earned',
    metadata: Record<string, any> = {}
  ): Promise<{ transaction?: LoyaltyTransaction; error?: string }> => {
    try {
      // Get current guest info
      const { data: guest, error: guestError } = await $supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single()

      if (guestError) throw guestError

      // Create loyalty transaction
      const { data: transaction, error: transError } = await $supabase
        .from('loyalty_transactions')
        .insert([{
          guest_id: guestId,
          transaction_type: transactionType,
          points,
          description: reason,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (transError) throw transError

      // Update guest's loyalty points
      const { error: updateError } = await $supabase
        .from('guests')
        .update({
          loyalty_points: (guest.loyalty_points || 0) + points,
          updated_at: new Date().toISOString()
        })
        .eq('id', guestId)

      if (updateError) throw updateError

      // Send email notification
      if (guest.email) {
        await sendLoyaltyUpdate(
          guest,
          guest.email,
          {
            type: transactionType,
            points,
            description: reason
          }
        )
      }

      return { transaction }
    } catch (error: any) {
      console.error('Failed to award points:', error)
      return { error: error.message || 'Failed to award points' }
    }
  }

  const redeemPoints = async (
    guestId: string,
    points: number,
    reason: string,
    metadata: Record<string, any> = {}
  ): Promise<{ transaction?: LoyaltyTransaction; error?: string }> => {
    try {
      // Get current guest info
      const { data: guest, error: guestError } = await $supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single()

      if (guestError) throw guestError

      // Check if guest has enough points
      if (!guest.loyalty_points || guest.loyalty_points < points) {
        throw new Error('Insufficient loyalty points')
      }

      // Create redemption transaction
      const { data: transaction, error: transError } = await $supabase
        .from('loyalty_transactions')
        .insert([{
          guest_id: guestId,
          transaction_type: 'redeemed',
          points: -points,
          description: reason,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (transError) throw transError

      // Update guest's loyalty points
      const { error: updateError } = await $supabase
        .from('guests')
        .update({
          loyalty_points: guest.loyalty_points - points,
          updated_at: new Date().toISOString()
        })
        .eq('id', guestId)

      if (updateError) throw updateError

      // Send email notification
      if (guest.email) {
        await sendLoyaltyUpdate(
          guest,
          guest.email,
          {
            type: 'redeemed',
            points,
            description: reason
          }
        )
      }

      return { transaction }
    } catch (error: any) {
      console.error('Failed to redeem points:', error)
      return { error: error.message || 'Failed to redeem points' }
    }
  }

  const checkAndUpdateTier = async (guestId: string): Promise<{
    updated?: boolean;
    oldTier?: string;
    newTier?: string;
    error?: string;
  }> => {
    try {
      // Get current guest info
      const { data: guest, error: guestError } = await $supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single()

      if (guestError) throw guestError

      const currentTier = guest.loyalty_tier || 'bronze'
      const newTier = calculateTier(guest.total_spending || 0)

      if (newTier !== currentTier) {
        // Update guest's tier
        const { error: updateError } = await $supabase
          .from('guests')
          .update({
            loyalty_tier: newTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', guestId)

        if (updateError) throw updateError

        // Send tier upgrade email
        if (guest.email) {
          await sendTierUpgrade(
            guest,
            guest.email,
            {
              oldTier: currentTier,
              newTier
            }
          )
        }

        return {
          updated: true,
          oldTier: currentTier,
          newTier
        }
      }

      return { updated: false }
    } catch (error: any) {
      console.error('Failed to check and update tier:', error)
      return { error: error.message || 'Failed to check and update tier' }
    }
  }

  const getLoyaltyHistory = async (guestId: string): Promise<{
    transactions?: LoyaltyTransaction[];
    summary?: {
      totalPoints: number;
      pointsEarned: number;
      pointsRedeemed: number;
      lastTransaction: LoyaltyTransaction | null;
    };
    error?: string;
  }> => {
    try {
      const { data: transactions, error } = await $supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const summary = transactions && transactions.length > 0 ? {
        totalPoints: transactions.reduce((sum, t) => sum + (t.points || 0), 0),
        pointsEarned: transactions
          .filter(t => t.transaction_type === 'earned')
          .reduce((sum, t) => sum + (t.points || 0), 0),
        pointsRedeemed: Math.abs(transactions
          .filter(t => t.transaction_type === 'redeemed')
          .reduce((sum, t) => sum + (t.points || 0), 0)),
        lastTransaction: transactions[0]
      } : {
        totalPoints: 0,
        pointsEarned: 0,
        pointsRedeemed: 0,
        lastTransaction: null
      }

      return { transactions, summary }
    } catch (error: any) {
      console.error('Failed to get loyalty history:', error)
      return { error: error.message || 'Failed to get loyalty history' }
    }
  }

  const awardFeedbackPoints = async (feedback: GuestFeedback): Promise<{ error?: string }> => {
    try {
      // Award points for giving feedback
      await awardPoints(
        feedback.guest_id,
        POINTS_RULES.feedback,
        'Points awarded for providing feedback',
        'earned',
        { feedback_id: feedback.id }
      )

      return {}
    } catch (error: any) {
      console.error('Failed to award feedback points:', error)
      return { error: error.message || 'Failed to award feedback points' }
    }
  }

  const checkForBirthdayBonus = async (guest: Guest): Promise<{ error?: string }> => {
    if (!guest.date_of_birth) return {}

    try {
      const today = new Date()
      const birthday = new Date(guest.date_of_birth)

      if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
        // Award birthday bonus points
        await awardPoints(
          guest.id,
          POINTS_RULES.birthdayBonus,
          'Birthday bonus points',
          'earned',
          { type: 'birthday_bonus', year: today.getFullYear() }
        )
      }

      return {}
    } catch (error: any) {
      console.error('Failed to check birthday bonus:', error)
      return { error: error.message || 'Failed to check birthday bonus' }
    }
  }

  const getActiveReservationStats = async (guestId: string): Promise<{
    stats?: Array<{
      reservation_id: string;
      room_number: string;
      check_in_date: string;
      check_out_date: string;
      days_remaining: number;
      total_days: number;
      current_spending: number;
      estimated_points: number;
    }>;
    error?: string;
  }> => {
    try {
      const { data, error } = await $supabase
        .rpc('get_active_reservation_stats', { p_guest_id: guestId })

      if (error) throw error

      return { stats: data || [] }
    } catch (error: any) {
      console.error('Failed to get active reservation stats:', error)
      return { error: error.message || 'Failed to get active reservation stats' }
    }
  }

  const processCheckout = async (
    reservationId: string,
    guestId: string,
    totalAmount: number,
    checkInDate: string,
    checkOutDate: string
  ): Promise<{
    result?: {
      points_awarded: number;
      new_tier: string;
      total_points: number;
      guest_total_spending: number;
    };
    error?: string;
  }> => {
    try {
      const { data, error } = await $supabase
        .rpc('process_guest_checkout', {
          p_reservation_id: reservationId,
          p_guest_id: guestId,
          p_total_amount: totalAmount,
          p_check_in_date: checkInDate,
          p_check_out_date: checkOutDate
        })

      if (error) throw error

      // Get guest info for email
      const { data: guest } = await $supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single()

      // Send notification if tier changed
      if (guest && data && data[0]) {
        const result = data[0]
        const currentTier = guest.loyalty_tier

        if (result.new_tier !== currentTier && guest.email) {
          await sendTierUpgrade(guest, guest.email, {
            oldTier: currentTier,
            newTier: result.new_tier
          })
        }

        // Send loyalty update
        if (guest.email) {
          await sendLoyaltyUpdate(guest, guest.email, {
            type: 'earned',
            points: result.points_awarded,
            description: `Points earned from checkout`
          })
        }
      }

      return { result: data?.[0] }
    } catch (error: any) {
      console.error('Failed to process checkout:', error)
      return { error: error.message || 'Failed to process checkout' }
    }
  }

  const redeemPointsWithDB = async (
    guestId: string,
    pointsToRedeem: number,
    description: string = 'Points redeemed for discount'
  ): Promise<{
    result?: {
      success: boolean;
      new_balance: number;
      message: string;
    };
    error?: string;
  }> => {
    try {
      const { data, error } = await $supabase
        .rpc('redeem_loyalty_points', {
          p_guest_id: guestId,
          p_points_to_redeem: pointsToRedeem,
          p_description: description
        })

      if (error) throw error

      return { result: data?.[0] }
    } catch (error: any) {
      console.error('Failed to redeem points:', error)
      return { error: error.message || 'Failed to redeem points' }
    }
  }

  const calculateDaysRemaining = (checkOutDate: string): number => {
    const today = new Date()
    const checkout = new Date(checkOutDate)
    const diffTime = checkout.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getLoyaltyStats = async (guestId: string): Promise<{
    stats?: {
      tier_progress_percentage: number;
      next_tier: string;
      spending_to_next_tier: number;
      active_reservations: number;
      lifetime_value: number;
      avg_spending_per_stay: number;
    };
    error?: string;
  }> => {
    try {
      const { data, error } = await $supabase
        .from('guest_loyalty_stats')
        .select('*')
        .eq('id', guestId)
        .single()

      if (error) throw error

      return { stats: data }
    } catch (error: any) {
      console.error('Failed to get loyalty stats:', error)
      return { error: error.message || 'Failed to get loyalty stats' }
    }
  }

  return {
    TIER_THRESHOLDS,
    POINTS_RULES,
    REDEMPTION_RATES,
    calculateTier,
    calculateNextTier,
    awardPoints,
    redeemPoints,
    checkAndUpdateTier,
    getLoyaltyHistory,
    awardFeedbackPoints,
    checkForBirthdayBonus,
    getActiveReservationStats,
    processCheckout,
    redeemPointsWithDB,
    calculateDaysRemaining,
    getLoyaltyStats
  }
}