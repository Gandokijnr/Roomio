<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">Reservations</h1>
        <p class="mt-1 text-sm text-neutral-600">Manage hotel bookings and reservations</p>
      </div>
      <button
        v-if="canManageReservations()"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        + New Reservation
      </button>
    </div>

    <div class="card mb-6 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex justify-center gap-2">
        <button
          @click="currentView = 'list'"
          :class="['btn', currentView === 'list' ? 'btn-primary' : 'btn-secondary']"
        >
          📋 List View
        </button>
        <button
          @click="currentView = 'calendar'"
          :class="['btn', currentView === 'calendar' ? 'btn-primary' : 'btn-secondary']"
        >
          📅 Calendar View
        </button>
      </div>
    </div>

    <div v-if="currentView === 'list'" class="card p-6 mb-6">
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Search</label>
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Reservation number, guest name..."
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Status</label>
          <select v-model="filters.status" class="input">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Check-in Date</label>
          <input
            v-model="filters.checkInDate"
            type="date"
            class="input"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">Loading reservations...</div>

    <!-- Calendar View -->
    <div v-else-if="currentView === 'calendar'">
      <CalendarView
        :reservations="reservations"
        @edit-reservation="editReservation"
        @date-selected="handleDateSelected"
      />
    </div>

    <!-- List View -->
    <div v-else-if="currentView === 'list' && filteredReservations.length === 0" class="card py-12 px-6 text-center">
      <div class="text-5xl mb-4">📅</div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-2">No reservations found</h3>
      <p class="text-sm text-neutral-600">Try adjusting your filters or create a new reservation</p>
    </div>

    <div v-else-if="currentView === 'list'" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Reservation #</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Guest</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Room</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Check-in</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Check-out</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Guests</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-100">
            <tr v-for="reservation in filteredReservations" :key="reservation.id" class="hover:bg-neutral-50">
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 whitespace-nowrap">{{ reservation.reservation_number }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <div class="text-sm font-medium text-neutral-900">
                    {{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}
                  </div>
                  <div class="text-xs text-neutral-500">{{ reservation.guest?.email }}</div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{{ reservation.room?.room_number }}</td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{{ formatDate(reservation.check_in_date) }}</td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{{ formatDate(reservation.check_out_date) }}</td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{{ reservation.number_of_guests }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 text-right whitespace-nowrap">₦{{ reservation.total_amount.toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span :class="['badge', `badge-${getStatusColor(reservation.status)}`]">
                  {{ reservation.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="viewReservation(reservation)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    v-if="reservation.status === 'confirmed'"
                    @click="openCheckInModal(reservation)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="Check In"
                  >
                    ✓
                  </button>
                  <button
                    v-if="reservation.status === 'checked_in'"
                    @click="openCheckOutModal(reservation)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="Check Out"
                  >
                    📤
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ReservationModal
      v-if="showCreateModal || showEditModal"
      :reservation="selectedReservation"
      @close="closeModals"
      @saved="handleReservationSaved"
    />

    <CheckInModal
      v-if="showCheckInModal"
      :reservation="selectedReservation!"
      @close="closeCheckInModal"
      @checked-in="handleCheckedIn"
    />

    <CheckOutModal
      v-if="showCheckOutModal"
      :reservation="selectedReservation!"
      @close="closeCheckOutModal"
      @checked-out="handleCheckedOut"
    />
  </div>
</template>

<script setup lang="ts">
import type { Reservation, ReservationStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { canManageReservations } = useAuth()

const loading = ref(true)
const reservations = ref<Reservation[]>([])
const currentView = ref<'list' | 'calendar'>('list')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showCheckInModal = ref(false)
const showCheckOutModal = ref(false)
const selectedReservation = ref<Reservation | null>(null)

const filters = ref({
  search: '',
  status: '' as ReservationStatus | '',
  checkInDate: '',
})

const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => {
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      const matchesSearch =
        reservation.reservation_number.toLowerCase().includes(search) ||
        `${reservation.guest?.first_name} ${reservation.guest?.last_name}`.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }

    if (filters.value.status && reservation.status !== filters.value.status) {
      return false
    }

    if (filters.value.checkInDate && reservation.check_in_date !== filters.value.checkInDate) {
      return false
    }

    return true
  })
})

const loadReservations = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('reservations')
      .select('*, guest:guests(*), room:rooms(*)')
      .order('check_in_date', { ascending: false })

    if (error) throw error
    reservations.value = data || []
  } catch (error) {
    console.error('Error loading reservations:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const getStatusColor = (status: ReservationStatus) => {
  const colors: Record<ReservationStatus, string> = {
    pending: 'warning',
    confirmed: 'primary',
    checked_in: 'success',
    checked_out: 'neutral',
    cancelled: 'error',
    no_show: 'error',
  }
  return colors[status] || 'neutral'
}

const viewReservation = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showEditModal.value = true
}

const openCheckInModal = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showCheckInModal.value = true
}

const closeCheckInModal = () => {
  showCheckInModal.value = false
  selectedReservation.value = null
}

const handleCheckedIn = () => {
  closeCheckInModal()
  loadReservations()
}

const openCheckOutModal = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showCheckOutModal.value = true
}

const closeCheckOutModal = () => {
  showCheckOutModal.value = false
  selectedReservation.value = null
}

const handleCheckedOut = () => {
  closeCheckOutModal()
  loadReservations()
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedReservation.value = null
}

const handleReservationSaved = () => {
  closeModals()
  loadReservations()
}

const editReservation = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showEditModal.value = true
}

const handleDateSelected = (date: Date) => {
  // Switch to list view and filter by selected date
  currentView.value = 'list'
  filters.value.checkInDate = date.toISOString().split('T')[0]
}

onMounted(() => {
  loadReservations()
})
</script>
