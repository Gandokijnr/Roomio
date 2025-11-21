<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-semibold text-neutral-900">
        Reports &amp; Analytics
      </h1>
      <p class="mt-1 text-sm text-neutral-600">
        View hotel performance metrics and reports
      </p>
    </div>

    <div class="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div class="card p-5 sm:p-6 text-center">
        <h3 class="text-base font-semibold text-neutral-900 mb-2">Revenue Report</h3>
        <div class="text-3xl font-bold text-primary-600 mb-1">
          ₦{{ reports.totalRevenue.toFixed(2) }}
        </div>
        <p class="text-xs text-neutral-600">Total revenue from bookings</p>
      </div>

      <div class="card p-5 sm:p-6 text-center">
        <h3 class="text-base font-semibold text-neutral-900 mb-2">Occupancy Rate</h3>
        <div class="text-3xl font-bold text-primary-600 mb-1">
          {{ reports.occupancyRate }}%
        </div>
        <p class="text-xs text-neutral-600">Average room occupancy</p>
      </div>

      <div class="card p-5 sm:p-6 text-center">
        <h3 class="text-base font-semibold text-neutral-900 mb-2">Total Bookings</h3>
        <div class="text-3xl font-bold text-primary-600 mb-1">
          {{ reports.totalBookings }}
        </div>
        <p class="text-xs text-neutral-600">Total reservations made</p>
      </div>

      <div class="card p-5 sm:p-6 text-center">
        <h3 class="text-base font-semibold text-neutral-900 mb-2">Avg. Stay Duration</h3>
        <div class="text-3xl font-bold text-primary-600 mb-1">
          {{ reports.avgStayDuration }} days
        </div>
        <p class="text-xs text-neutral-600">Average guest stay length</p>
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
