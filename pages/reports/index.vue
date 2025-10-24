<template>
  <div class="reports-page">
    <div class="page-header">
      <h1>Reports & Analytics</h1>
      <p>View hotel performance metrics and reports</p>
    </div>

    <div class="reports-grid">
      <div class="report-card card">
        <h3>Revenue Report</h3>
        <div class="report-value">₦{{ reports.totalRevenue.toFixed(2) }}</div>
        <p>Total revenue from bookings</p>
      </div>

      <div class="report-card card">
        <h3>Occupancy Rate</h3>
        <div class="report-value">{{ reports.occupancyRate }}%</div>
        <p>Average room occupancy</p>
      </div>

      <div class="report-card card">
        <h3>Total Bookings</h3>
        <div class="report-value">{{ reports.totalBookings }}</div>
        <p>Total reservations made</p>
      </div>

      <div class="report-card card">
        <h3>Avg. Stay Duration</h3>
        <div class="report-value">{{ reports.avgStayDuration }} days</div>
        <p>Average guest stay length</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const reports = ref({
  totalRevenue: 0,
  occupancyRate: 0,
  totalBookings: 0,
  avgStayDuration: 0,
})

const loadReports = async () => {
  try {
    const { data: reservationsData } = await $supabase
      .from('reservations')
      .select('total_amount, check_in_date, check_out_date')
      .in('status', ['confirmed', 'checked_in', 'checked_out'])

    if (reservationsData) {
      reports.value.totalRevenue = reservationsData.reduce((sum, r) => sum + r.total_amount, 0)
      reports.value.totalBookings = reservationsData.length

      const durations = reservationsData.map(r => {
        const checkIn = new Date(r.check_in_date)
        const checkOut = new Date(r.check_out_date)
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      })

      if (durations.length > 0) {
        reports.value.avgStayDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      }
    }

    const { data: roomsData } = await $supabase
      .from('rooms')
      .select('status')
      .eq('is_active', true)

    if (roomsData && roomsData.length > 0) {
      const occupied = roomsData.filter(r => r.status === 'occupied').length
      reports.value.occupancyRate = Math.round((occupied / roomsData.length) * 100)
    }
  } catch (error) {
    console.error('Error loading reports:', error)
  }
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-page {
  max-width: 1400px;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: 2rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.page-header p {
  color: var(--neutral-600);
  font-size: 0.938rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.report-card {
  padding: var(--spacing-xl);
  text-align: center;
}

.report-card h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
}

.report-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-600);
  margin-bottom: var(--spacing-sm);
}

.report-card p {
  color: var(--neutral-600);
  font-size: 0.875rem;
}
</style>
