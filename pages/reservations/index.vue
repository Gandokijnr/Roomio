<template>
  <div class="reservations-page">
    <div class="page-header">
      <div>
        <h1>Reservations</h1>
        <p>Manage hotel bookings and reservations</p>
      </div>
      <button
        v-if="canManageReservations()"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        + New Reservation
      </button>
    </div>

    <div class="filters-section card">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Search</label>
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Reservation number, guest name..."
          />
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" class="input">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Check-in Date</label>
          <input
            v-model="filters.checkInDate"
            type="date"
            class="input"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading reservations...</div>

    <div v-else-if="filteredReservations.length === 0" class="empty-state card">
      <div class="empty-icon">📅</div>
      <h3>No reservations found</h3>
      <p>Try adjusting your filters or create a new reservation</p>
    </div>

    <div v-else class="reservations-table card">
      <table>
        <thead>
          <tr>
            <th>Reservation #</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Guests</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in filteredReservations" :key="reservation.id">
            <td class="reservation-number">{{ reservation.reservation_number }}</td>
            <td>
              <div class="guest-info">
                <div class="guest-name">
                  {{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}
                </div>
                <div class="guest-email">{{ reservation.guest?.email }}</div>
              </div>
            </td>
            <td>{{ reservation.room?.room_number }}</td>
            <td>{{ formatDate(reservation.check_in_date) }}</td>
            <td>{{ formatDate(reservation.check_out_date) }}</td>
            <td>{{ reservation.number_of_guests }}</td>
            <td class="amount">${{ reservation.total_amount.toFixed(2) }}</td>
            <td>
              <span :class="['badge', `badge-${getStatusColor(reservation.status)}`]">
                {{ reservation.status.replace('_', ' ') }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button @click="viewReservation(reservation)" class="btn-icon" title="View">👁️</button>
                <button
                  v-if="reservation.status === 'confirmed'"
                  @click="checkIn(reservation)"
                  class="btn-icon"
                  title="Check In"
                >
                  ✓
                </button>
                <button
                  v-if="reservation.status === 'checked_in'"
                  @click="checkOut(reservation)"
                  class="btn-icon"
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

    <ReservationModal
      v-if="showCreateModal || showEditModal"
      :reservation="selectedReservation"
      @close="closeModals"
      @saved="handleReservationSaved"
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
const showCreateModal = ref(false)
const showEditModal = ref(false)
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

const checkIn = async (reservation: Reservation) => {
  if (!confirm(`Check in ${reservation.guest?.first_name} ${reservation.guest?.last_name}?`)) return

  try {
    const { error } = await $supabase
      .from('reservations')
      .update({
        status: 'checked_in',
        actual_check_in: new Date().toISOString()
      })
      .eq('id', reservation.id)

    if (error) throw error

    await $supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', reservation.room_id)

    await loadReservations()
  } catch (error) {
    console.error('Error checking in:', error)
  }
}

const checkOut = async (reservation: Reservation) => {
  if (!confirm(`Check out ${reservation.guest?.first_name} ${reservation.guest?.last_name}?`)) return

  try {
    const { error } = await $supabase
      .from('reservations')
      .update({
        status: 'checked_out',
        actual_check_out: new Date().toISOString()
      })
      .eq('id', reservation.id)

    if (error) throw error

    await $supabase
      .from('rooms')
      .update({ status: 'cleaning' })
      .eq('id', reservation.room_id)

    await loadReservations()
  } catch (error) {
    console.error('Error checking out:', error)
  }
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

onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
.reservations-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.filters-section {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--neutral-600);
}

.reservations-table {
  padding: 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--neutral-50);
  border-bottom: 2px solid var(--neutral-200);
}

th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  font-size: 0.813rem;
  color: var(--neutral-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid var(--neutral-200);
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: var(--neutral-50);
}

td {
  padding: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.reservation-number {
  font-weight: 600;
  color: var(--neutral-900);
}

.guest-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guest-name {
  font-weight: 500;
  color: var(--neutral-900);
}

.guest-email {
  font-size: 0.75rem;
  color: var(--neutral-500);
}

.amount {
  font-weight: 600;
  color: var(--neutral-900);
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--neutral-200);
  transform: scale(1.1);
}
</style>
