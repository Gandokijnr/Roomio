<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>{{ reservation ? 'View Reservation' : 'New Reservation' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label for="guest">Guest *</label>
            <select
              id="guest"
              v-model="formData.guest_id"
              class="input"
              required
              :disabled="loading || !!reservation"
            >
              <option value="">Select guest</option>
              <option v-for="guest in guests" :key="guest.id" :value="guest.id">
                {{ guest.first_name }} {{ guest.last_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="room">Room *</label>
            <select
              id="room"
              v-model="formData.room_id"
              class="input"
              required
              :disabled="loading || !!reservation"
            >
              <option value="">Select room</option>
              <option
                v-for="room in availableRooms"
                :key="room.id"
                :value="room.id"
              >
                Room {{ room.room_number }} - ${{ room.price_per_night }}/night
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="check-in">Check-in Date *</label>
            <input
              id="check-in"
              v-model="formData.check_in_date"
              type="date"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group">
            <label for="check-out">Check-out Date *</label>
            <input
              id="check-out"
              v-model="formData.check_out_date"
              type="date"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group">
            <label for="adults">Adults *</label>
            <input
              id="adults"
              v-model.number="formData.number_of_adults"
              type="number"
              min="1"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group">
            <label for="children">Children</label>
            <input
              id="children"
              v-model.number="formData.number_of_children"
              type="number"
              min="0"
              class="input"
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group">
            <label for="total-amount">Total Amount *</label>
            <input
              id="total-amount"
              v-model.number="formData.total_amount"
              type="number"
              step="0.01"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group">
            <label for="booking-source">Booking Source</label>
            <input
              id="booking-source"
              v-model="formData.booking_source"
              type="text"
              class="input"
              placeholder="Direct"
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="form-group full-width">
            <label for="special-requests">Special Requests</label>
            <textarea
              id="special-requests"
              v-model="formData.special_requests"
              class="input"
              rows="3"
              placeholder="Any special requests..."
              :disabled="loading || !!reservation"
            ></textarea>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
            Close
          </button>
          <button
            v-if="!reservation"
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Creating...' : 'Create Reservation' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reservation, Room, Guest } from '~/types/database'

const props = defineProps<{
  reservation?: Reservation | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { $supabase } = useNuxtApp()
const { user } = useAuth()

const loading = ref(false)
const error = ref('')
const guests = ref<Guest[]>([])
const availableRooms = ref<Room[]>([])

const generateReservationNumber = () => {
  const prefix = 'RES'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${prefix}${timestamp}${random}`
}

const formData = ref({
  guest_id: props.reservation?.guest_id || '',
  room_id: props.reservation?.room_id || '',
  check_in_date: props.reservation?.check_in_date || '',
  check_out_date: props.reservation?.check_out_date || '',
  number_of_adults: props.reservation?.number_of_adults || 1,
  number_of_children: props.reservation?.number_of_children || 0,
  total_amount: props.reservation?.total_amount || 0,
  booking_source: props.reservation?.booking_source || 'Direct',
  special_requests: props.reservation?.special_requests || '',
})

const loadGuests = async () => {
  try {
    const { data, error } = await $supabase
      .from('guests')
      .select('*')
      .order('last_name')

    if (error) throw error
    guests.value = data || []
  } catch (err) {
    console.error('Error loading guests:', err)
  }
}

const loadAvailableRooms = async () => {
  try {
    const { data, error } = await $supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .eq('is_active', true)
      .order('room_number')

    if (error) throw error
    availableRooms.value = data || []
  } catch (err) {
    console.error('Error loading rooms:', err)
  }
}

const handleSubmit = async () => {
  if (props.reservation) return

  try {
    loading.value = true
    error.value = ''

    const reservationData = {
      ...formData.value,
      reservation_number: generateReservationNumber(),
      number_of_guests: formData.value.number_of_adults + formData.value.number_of_children,
      status: 'confirmed',
      paid_amount: 0,
      created_by: user.value.id,
    }

    const { error: insertError } = await $supabase
      .from('reservations')
      .insert([reservationData])

    if (insertError) throw insertError

    await $supabase
      .from('rooms')
      .update({ status: 'reserved' })
      .eq('id', formData.value.room_id)

    emit('saved')
  } catch (err: any) {
    console.error('Error creating reservation:', err)
    error.value = err.message || 'Failed to create reservation'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGuests()
  if (!props.reservation) {
    loadAvailableRooms()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--neutral-900);
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--neutral-100);
  color: var(--neutral-700);
  font-size: 1.5rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--neutral-200);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

textarea.input {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  padding: var(--spacing-md);
  background: var(--error-50);
  color: var(--error-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
}
</style>
