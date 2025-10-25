import type { Reservation, ActivityLog, Guest, Payment, GuestFeedback } from '~/types/database'

export const useGuestHistory = () => {
  const { $supabase } = useNuxtApp()

  const getGuestStayHistory = async (guestId: string): Promise<{
    history?: {
      stays: Reservation[];
      totalSpent: number;
      averageStayDuration: number;
      preferredRoomTypes: { type: string; count: number }[];
      seasonalPreferences: { month: number; count: number }[];
    };
    error?: string;
  }> => {
    try {
      // Get all stays
      const { data: stays, error: staysError } = await $supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(
            room_number,
            room_type:room_types(
              name,
              base_price
            )
          ),
          payments:payments(*)
        `)
        .eq('guest_id', guestId)
        .order('check_in_date', { ascending: false })

      if (staysError) throw staysError

      // Calculate stay metrics
      const history = {
        stays: stays || [],
        totalSpent: 0,
        averageStayDuration: 0,
        preferredRoomTypes: [] as { type: string; count: number }[],
        seasonalPreferences: Array(12).fill(0).map((_, i) => ({ month: i, count: 0 }))
      }

      if (stays && stays.length > 0) {
        // Calculate total spent
        history.totalSpent = stays.reduce((total, stay) => total + (stay.total_amount || 0), 0)

        // Calculate average stay duration
        const totalDays = stays.reduce((total, stay) => {
          const checkIn = new Date(stay.check_in_date)
          const checkOut = new Date(stay.check_out_date)
          const days = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          return total + days
        }, 0)
        history.averageStayDuration = totalDays / stays.length

        // Calculate room type preferences
        const roomTypes = stays.reduce((acc: { [key: string]: number }, stay) => {
          const room = Array.isArray(stay.room) ? stay.room[0] : stay.room
          const roomType = Array.isArray(room?.room_type) ? room.room_type[0] : room?.room_type
          const typeName = roomType?.name || 'Unknown'
          acc[typeName] = (acc[typeName] || 0) + 1
          return acc
        }, {})
        history.preferredRoomTypes = Object.entries(roomTypes)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)

        // Calculate seasonal preferences
        stays.forEach(stay => {
          const checkIn = new Date(stay.check_in_date)
          const month = checkIn.getMonth()
          history.seasonalPreferences[month].count++
        })
      }

      return { history }
    } catch (error: any) {
      console.error('Failed to get guest stay history:', error)
      return { error: error.message || 'Failed to get guest stay history' }
    }
  }

  const getGuestActivityLog = async (guestId: string): Promise<{
    activities?: ActivityLog[];
    error?: string;
  }> => {
    try {
      const { data: activities, error } = await $supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'guest')
        .eq('entity_id', guestId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { activities }
    } catch (error: any) {
      console.error('Failed to get guest activity log:', error)
      return { error: error.message || 'Failed to get guest activity log' }
    }
  }

  const getGuestPaymentHistory = async (guestId: string): Promise<{
    payments?: Payment[];
    summary?: {
      totalPaid: number;
      preferredPaymentMethod: string;
      lastPayment: Payment | null;
    };
    error?: string;
  }> => {
    try {
      const { data: payments, error } = await $supabase
        .from('payments')
        .select(`
          *,
          reservation:reservations!inner(guest_id)
        `)
        .eq('reservation.guest_id', guestId)
        .order('payment_date', { ascending: false })

      if (error) throw error

      const summary = payments && payments.length > 0 ? {
        totalPaid: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        preferredPaymentMethod: findPreferredPaymentMethod(payments),
        lastPayment: payments[0]
      } : {
        totalPaid: 0,
        preferredPaymentMethod: 'N/A',
        lastPayment: null
      }

      return { payments, summary }
    } catch (error: any) {
      console.error('Failed to get guest payment history:', error)
      return { error: error.message || 'Failed to get guest payment history' }
    }
  }

  const getGuestFeedbackHistory = async (guestId: string): Promise<{
    feedback?: GuestFeedback[];
    summary?: {
      averageRating: number;
      totalFeedbacks: number;
      sentimentDistribution: { positive: number; neutral: number; negative: number };
    };
    error?: string;
  }> => {
    try {
      const { data: feedback, error } = await $supabase
        .from('guest_feedback')
        .select('*')
        .eq('guest_id', guestId)
        .order('feedback_date', { ascending: false })

      if (error) throw error

      const summary = feedback && feedback.length > 0 ? {
        averageRating: calculateAverageRating(feedback),
        totalFeedbacks: feedback.length,
        sentimentDistribution: calculateSentimentDistribution(feedback)
      } : {
        averageRating: 0,
        totalFeedbacks: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }
      }

      return { feedback, summary }
    } catch (error: any) {
      console.error('Failed to get guest feedback history:', error)
      return { error: error.message || 'Failed to get guest feedback history' }
    }
  }

  // Utility functions
  const findPreferredPaymentMethod = (payments: Payment[]): string => {
    const methods = payments.reduce((acc: { [key: string]: number }, payment) => {
      const method = payment.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {})

    return Object.entries(methods)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
  }

  const calculateAverageRating = (feedback: GuestFeedback[]): number => {
    const totalRating = feedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0)
    return totalRating / feedback.length
  }

  const calculateSentimentDistribution = (feedback: GuestFeedback[]) => {
    return feedback.reduce((acc: { positive: number; neutral: number; negative: number }, f) => {
      const rating = f.overall_rating || 0
      if (rating >= 4) acc.positive++
      else if (rating >= 3) acc.neutral++
      else acc.negative++
      return acc
    }, { positive: 0, neutral: 0, negative: 0 })
  }

  const logGuestActivity = async (
    guestId: string,
    action: string,
    userId: string,
    metadata: Record<string, any> = {}
  ): Promise<{ activity?: ActivityLog; error?: string }> => {
    try {
      const { data: activity, error } = await $supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action,
          entity_type: 'guest',
          entity_id: guestId,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return { activity }
    } catch (error: any) {
      console.error('Failed to log guest activity:', error)
      return { error: error.message || 'Failed to log guest activity' }
    }
  }

  const getGuestPreferenceHistory = async (guestId: string): Promise<{
    preferences?: {
      roomTypes: { type: string; count: number }[];
      specialRequests: { request: string; count: number }[];
      amenities: { amenity: string; count: number }[];
    };
    error?: string;
  }> => {
    try {
      // Get all reservations with room and special requests
      const { data: reservations, error: resError } = await $supabase
        .from('reservations')
        .select(`
          special_requests,
          room:rooms(
            room_type:room_types(name, amenities)
          )
        `)
        .eq('guest_id', guestId)

      if (resError) throw resError

      // Get guest preferences
      const { data: preferences, error: prefError } = await $supabase
        .from('guest_preferences')
        .select('*')
        .eq('guest_id', guestId)

      if (prefError) throw prefError

      // Analyze preferences
      const roomTypes: { [key: string]: number } = {}
      const specialRequests: { [key: string]: number } = {}
      const amenities: { [key: string]: number } = {}

      reservations?.forEach(reservation => {
        // Room type preferences
        const room = Array.isArray(reservation.room) ? reservation.room[0] : reservation.room
        const roomType = room?.room_type?.[0]?.name
        if (roomType) {
          roomTypes[roomType] = (roomTypes[roomType] || 0) + 1
        }

        // Special requests
        if (reservation.special_requests) {
          const requests = reservation.special_requests.split(',').map((r: string) => r.trim())
          requests.forEach((request: string) => {
            specialRequests[request] = (specialRequests[request] || 0) + 1
          })
        }

        // Amenity preferences
        const roomAmenities = room?.room_type?.[0]?.amenities || []
        roomAmenities.forEach((amenity: string) => {
          amenities[amenity] = (amenities[amenity] || 0) + 1
        })
      })

      const result = {
        roomTypes: Object.entries(roomTypes)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        specialRequests: Object.entries(specialRequests)
          .map(([request, count]) => ({ request, count }))
          .sort((a, b) => b.count - a.count),
        amenities: Object.entries(amenities)
          .map(([amenity, count]) => ({ amenity, count }))
          .sort((a, b) => b.count - a.count)
      }

      return { preferences: result }
    } catch (error: any) {
      console.error('Failed to get guest preference history:', error)
      return { error: error.message || 'Failed to get guest preference history' }
    }
  }

  return {
    getGuestStayHistory,
    getGuestActivityLog,
    getGuestPaymentHistory,
    getGuestFeedbackHistory,
    getGuestPreferenceHistory,
    logGuestActivity
  }
}