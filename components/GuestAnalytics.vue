<template>
  <div class="guest-analytics">
    <!-- Summary Cards -->
    <div class="analytics-grid">
      <div class="stat-card">
        <div class="stat-icon">🏨</div>
        <div class="stat-content">
          <div class="stat-label">Total Stays</div>
          <div class="stat-value">{{ analytics.totalStays }}</div>
          <div class="stat-trend" :class="{ positive: analytics.staysTrend > 0 }">
            {{ analytics.staysTrend > 0 ? '↑' : '↓' }} {{ Math.abs(analytics.staysTrend) }}% vs last period
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Total Spending</div>
          <div class="stat-value">₦{{ analytics.totalSpending.toLocaleString() }}</div>
          <div class="stat-trend" :class="{ positive: analytics.spendingTrend > 0 }">
            {{ analytics.spendingTrend > 0 ? '↑' : '↓' }} {{ Math.abs(analytics.spendingTrend) }}% vs last period
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">Average Stay Duration</div>
          <div class="stat-value">{{ analytics.avgStayDuration }} nights</div>
          <div class="stat-subtitle">Across all bookings</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-label">Average Rating</div>
          <div class="stat-value">{{ analytics.avgRating.toFixed(1) }}/5</div>
          <div class="stat-subtitle">Based on {{ analytics.totalReviews }} reviews</div>
        </div>
      </div>
    </div>

    <!-- Booking History Chart -->
    <div class="chart-section card">
      <h3>Booking History</h3>
      <div class="chart-container">
        <div v-if="bookingHistory.length === 0" class="empty-chart">
          <p>No booking history available</p>
        </div>
        <div v-else class="timeline">
          <div 
            v-for="(booking, index) in bookingHistory" 
            :key="booking.id"
            class="timeline-item"
          >
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ formatDate(booking.check_in_date) }}</span>
                <span class="timeline-badge" :class="getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
              <div class="timeline-body">
                <div class="booking-details">
                  <div class="detail-item">
                    <span class="detail-label">Room:</span>
                    <span class="detail-value">{{ booking.room?.room_number || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">{{ calculateNights(booking.check_in_date, booking.check_out_date) }} nights</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value">₦{{ booking.total_amount?.toLocaleString() || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Spending Analysis -->
    <div class="spending-section">
      <div class="card spending-chart">
        <h3>Spending Breakdown</h3>
        <div class="spending-bars">
          <div 
            v-for="category in spendingByCategory" 
            :key="category.name"
            class="spending-bar-item"
          >
            <div class="spending-bar-label">
              <span>{{ category.name }}</span>
              <span class="spending-bar-value">₦{{ category.amount.toLocaleString() }}</span>
            </div>
            <div class="spending-bar-track">
              <div 
                class="spending-bar-fill" 
                :style="{ width: `${(category.amount / analytics.totalSpending * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card preferences-section">
        <h3>Guest Preferences</h3>
        <div class="preferences-list">
          <div v-if="preferences.length === 0" class="empty-preferences">
            <p>No preferences recorded</p>
          </div>
          <div v-else>
            <div 
              v-for="pref in preferences" 
              :key="pref.id"
              class="preference-item"
            >
              <div class="preference-icon">🔖</div>
              <div class="preference-content">
                <div class="preference-type">{{ pref.preference_type }}</div>
                <div class="preference-value">{{ pref.preference_value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Feedback -->
    <div class="card feedback-section">
      <h3>Recent Feedback</h3>
      <div v-if="feedback.length === 0" class="empty-feedback">
        <p>No feedback available</p>
      </div>
      <div v-else class="feedback-list">
        <div 
          v-for="item in feedback" 
          :key="item.id"
          class="feedback-item"
        >
          <div class="feedback-header">
            <div class="feedback-rating">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= (item.overall_rating || 0) }">
                ⭐
              </span>
            </div>
            <span class="feedback-date">{{ formatDate(item.feedback_date) }}</span>
          </div>
          <p class="feedback-comment">{{ item.comments || 'No comments provided' }}</p>
          <div v-if="item.staff_response" class="feedback-response">
            <strong>Staff Response:</strong> {{ item.staff_response }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest, Reservation, GuestFeedback, GuestPreference } from '~/types/database'
import { format, differenceInDays } from 'date-fns'

const props = defineProps<{
  guestId: string
}>()

const { $supabase } = useNuxtApp()

const loading = ref(true)
const bookingHistory = ref<Reservation[]>([])
const feedback = ref<GuestFeedback[]>([])
const preferences = ref<GuestPreference[]>([])

// Analytics computed data
const analytics = computed(() => {
  const totalStays = bookingHistory.value.filter(b => b.status === 'checked_out').length
  const totalSpending = bookingHistory.value.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  
  const totalNights = bookingHistory.value.reduce((sum, b) => {
    return sum + calculateNights(b.check_in_date, b.check_out_date)
  }, 0)
  const avgStayDuration = totalStays > 0 ? Math.round(totalNights / totalStays) : 0

  const avgRating = feedback.value.length > 0
    ? feedback.value.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / feedback.value.length
    : 0

  // Calculate trends (simplified - comparing first half vs second half)
  const midpoint = Math.floor(bookingHistory.value.length / 2)
  const recentBookings = bookingHistory.value.slice(0, midpoint)
  const olderBookings = bookingHistory.value.slice(midpoint)
  
  const recentSpending = recentBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const olderSpending = olderBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  
  const spendingTrend = olderSpending > 0 
    ? Math.round(((recentSpending - olderSpending) / olderSpending) * 100)
    : 0

  const staysTrend = olderBookings.length > 0
    ? Math.round(((recentBookings.length - olderBookings.length) / olderBookings.length) * 100)
    : 0

  return {
    totalStays,
    totalSpending,
    avgStayDuration,
    avgRating,
    totalReviews: feedback.value.length,
    spendingTrend,
    staysTrend
  }
})

// Spending by category
const spendingByCategory = computed(() => {
  const categories = [
    { name: 'Room Charges', amount: 0 },
    { name: 'Services', amount: 0 },
    { name: 'Additional Charges', amount: 0 }
  ]

  bookingHistory.value.forEach(booking => {
    // Simplified - in real app, would break down by actual categories
    categories[0].amount += (booking.total_amount || 0) * 0.7
    categories[1].amount += (booking.total_amount || 0) * 0.2
    categories[2].amount += (booking.total_amount || 0) * 0.1
  })

  return categories.filter(c => c.amount > 0)
})

// Load guest analytics data
const loadAnalytics = async () => {
  try {
    loading.value = true

    // Load booking history
    const { data: bookings, error: bookingsError } = await $supabase
      .from('reservations')
      .select('*, room:rooms(*)')
      .eq('guest_id', props.guestId)
      .order('check_in_date', { ascending: false })

    if (bookingsError) throw bookingsError
    bookingHistory.value = bookings || []

    // Load feedback
    const { data: feedbackData, error: feedbackError } = await $supabase
      .from('guest_feedback')
      .select('*')
      .eq('guest_id', props.guestId)
      .order('feedback_date', { ascending: false })
      .limit(5)

    if (feedbackError) throw feedbackError
    feedback.value = feedbackData || []

    // Load preferences
    const { data: prefsData, error: prefsError } = await $supabase
      .from('guest_preferences')
      .select('*')
      .eq('guest_id', props.guestId)

    if (prefsError) throw prefsError
    preferences.value = prefsData || []

  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

const calculateNights = (checkIn: string, checkOut: string) => {
  return differenceInDays(new Date(checkOut), new Date(checkIn))
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'confirmed': 'status-confirmed',
    'checked_in': 'status-active',
    'checked_out': 'status-completed',
    'cancelled': 'status-cancelled',
    'no_show': 'status-cancelled'
  }
  return classes[status] || ''
}

// Load data on mount
onMounted(() => {
  loadAnalytics()
})

// Watch for guest ID changes
watch(() => props.guestId, () => {
  loadAnalytics()
})
</script>

<style scoped>
.guest-analytics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.75rem;
  color: #ef4444;
}

.stat-trend.positive {
  color: #10b981;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.chart-section {
  padding: 1.5rem;
}

.chart-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  width: 1rem;
  height: 1rem;
  background: #3b82f6;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #3b82f6;
}

.timeline-item:not(:last-child) .timeline-marker::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 1rem;
  width: 2px;
  height: calc(100% + 1rem);
  background: #e5e7eb;
  transform: translateX(-50%);
}

.timeline-content {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.timeline-date {
  font-weight: 600;
  color: #111827;
}

.timeline-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-completed {
  background: #e5e7eb;
  color: #374151;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.booking-details {
  display: flex;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.spending-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.spending-chart,
.preferences-section,
.feedback-section {
  padding: 1.5rem;
}

.spending-chart h3,
.preferences-section h3,
.feedback-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.spending-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spending-bar-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.spending-bar-value {
  font-weight: 600;
  color: #3b82f6;
}

.spending-bar-track {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.spending-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.3s ease;
}

.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preference-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.preference-icon {
  font-size: 1.25rem;
}

.preference-content {
  flex: 1;
}

.preference-type {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preference-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feedback-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.feedback-rating {
  display: flex;
  gap: 0.125rem;
}

.star {
  font-size: 0.875rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.feedback-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.feedback-comment {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.feedback-response {
  font-size: 0.813rem;
  color: #6b7280;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.empty-chart,
.empty-preferences,
.empty-feedback {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .spending-section {
    grid-template-columns: 1fr;
  }

  .booking-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
