<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 sm:px-6 py-4 sm:py-8"
    @click.self="$emit('close')"
  >
    <div
      class="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 transform transition-all sm:rounded-xl"
    >
      <div class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-200">
        <h2 class="text-lg font-semibold text-neutral-900 sm:text-xl">
          {{ reservation ? 'View Reservation' : 'New Reservation' }}
        </h2>
        <button
          @click="$emit('close')"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 text-xl leading-none hover:bg-neutral-200 transition"
        >
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 py-4 sm:px-6 sm:py-5">
        <div class="grid gap-4 md:grid-cols-2 mb-6">
          <div class="flex flex-col gap-2">
            <label for="guest" class="text-sm font-medium text-neutral-700">Guest *</label>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
              <select
                id="guest"
                v-model="formData.guest_id"
                class="input flex-1"
                required
                :disabled="loading || !!reservation"
              >
                <option value="">Select guest</option>
                <option v-for="guest in guests" :key="guest.id" :value="guest.id">
                  {{ guest.first_name }} {{ guest.last_name }} {{ guest.email ? `(${guest.email})` : '' }}
                </option>
              </select>
              <button
                v-if="!reservation"
                type="button"
                @click="showGuestModal = true"
                class="btn btn-secondary btn-sm w-full sm:w-auto"
                :disabled="loading"
              >
                + New Guest
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="room" class="text-sm font-medium text-neutral-700">Room *</label>
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
                Room {{ room.room_number }} - ₦{{ room.price_per_night }}/night
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label for="check-in" class="text-sm font-medium text-neutral-700">Check-in Date *</label>
            <input
              id="check-in"
              v-model="formData.check_in_date"
              type="date"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="check-out" class="text-sm font-medium text-neutral-700">Check-out Date *</label>
            <input
              id="check-out"
              v-model="formData.check_out_date"
              type="date"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="adults" class="text-sm font-medium text-neutral-700">Adults *</label>
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

          <div class="flex flex-col gap-2">
            <label for="children" class="text-sm font-medium text-neutral-700">Children</label>
            <input
              id="children"
              v-model.number="formData.number_of_children"
              type="number"
              min="0"
              class="input"
              :disabled="loading || !!reservation"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="total-amount" class="text-sm font-medium text-neutral-700">Total Amount *</label>
            <input
              id="total-amount"
              v-model.number="formData.total_amount"
              type="number"
              step="0.01"
              class="input"
              required
              :disabled="loading || !!reservation"
            />
            <div
              v-if="!reservation && selectedRoom && numberOfNights > 0"
              class="mt-1 text-xs text-neutral-600"
            >
              {{ numberOfNights }} night{{ numberOfNights !== 1 ? 's' : '' }} × ₦{{ selectedRoom.price_per_night }} = ₦{{ calculatedAmount }}
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="booking-source" class="text-sm font-medium text-neutral-700">Booking Source *</label>
            <select
              id="booking-source"
              v-model="formData.booking_source"
              class="input"
              required
              :disabled="loading || !!reservation"
            >
              <option value="Direct">Direct Booking</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Website">Hotel Website</option>
              <option value="Phone">Phone Booking</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Expedia">Expedia</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Agoda">Agoda</option>
              <option value="Corporate">Corporate Booking</option>
              <option value="Travel Agent">Travel Agent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="special-requests" class="text-sm font-medium text-neutral-700">Special Requests</label>
            <textarea
              id="special-requests"
              v-model="formData.special_requests"
              class="input resize-y"
              rows="3"
              placeholder="Any special requests..."
              :disabled="loading || !!reservation"
            ></textarea>
          </div>
        </div>

        <div v-if="error" class="mb-4 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
          {{ error }}
        </div>

        <div class="flex justify-end gap-2 pt-4 mt-2 border-t border-neutral-200">
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

    <!-- Guest Modal -->
    <GuestModal
      v-if="showGuestModal"
      @close="showGuestModal = false"
      @saved="handleGuestSaved"
    />
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
const showGuestModal = ref(false)

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

// Computed properties for automatic calculations
const selectedRoom = computed(() => {
  return availableRooms.value.find(room => room.id === formData.value.room_id)
})

const numberOfNights = computed(() => {
  if (!formData.value.check_in_date || !formData.value.check_out_date) return 0
  const checkIn = new Date(formData.value.check_in_date)
  const checkOut = new Date(formData.value.check_out_date)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

const calculatedAmount = computed(() => {
  if (!selectedRoom.value || numberOfNights.value <= 0) return 0
  return selectedRoom.value.price_per_night * numberOfNights.value
})

// Watch for changes to automatically update total amount
watch([() => formData.value.room_id, () => formData.value.check_in_date, () => formData.value.check_out_date], () => {
  if (!props.reservation && calculatedAmount.value > 0) {
    formData.value.total_amount = calculatedAmount.value
  }
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
    console.log('Loading available rooms...')
    
    // First get all active rooms
    const { data: allRooms, error: roomsError } = await $supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('room_number')

    console.log('All rooms from database:', allRooms)
    console.log('Rooms error:', roomsError)

    if (roomsError) throw roomsError

    if (!formData.value.check_in_date || !formData.value.check_out_date) {
      // If no dates selected, show rooms that could potentially be available
      // (exclude only maintenance and out_of_order)
      availableRooms.value = allRooms?.filter(room => 
        room.status !== 'maintenance' && room.status !== 'out_of_order'
      ) || []
      console.log('No dates selected, showing potentially available rooms:', availableRooms.value.length)
      return
    }

    // Check for conflicting reservations in the date range
    const { data: conflictingReservations, error: reservationsError } = await $supabase
      .from('reservations')
      .select('room_id')
      .in('status', ['confirmed', 'checked_in'])
      .or(`and(check_in_date.lte.${formData.value.check_out_date},check_out_date.gte.${formData.value.check_in_date})`)

    console.log('Conflicting reservations:', conflictingReservations)

    if (reservationsError) throw reservationsError

    const occupiedRoomIds = new Set(conflictingReservations?.map(r => r.room_id) || [])
    
    // Filter out rooms that are occupied during the requested period
    // Allow rooms that are currently occupied but will be free during the requested dates
    availableRooms.value = allRooms?.filter(room => {
      // Exclude rooms that are permanently unavailable
      if (room.status === 'maintenance' || room.status === 'out_of_order') {
        return false
      }
      
      // Exclude rooms that have conflicting reservations
      if (occupiedRoomIds.has(room.id)) {
        return false
      }
      
      // Include all other rooms (available, cleaning, occupied but free during dates)
      return true
    }) || []

    console.log('Final available rooms:', availableRooms.value.length)

  } catch (err) {
    console.error('Error loading available rooms:', err)
  }
}

// Watch for date changes to update available rooms
watch([() => formData.value.check_in_date, () => formData.value.check_out_date], () => {
  if (!props.reservation) {
    loadAvailableRooms()
  }
})

const handleGuestSaved = async (guestId: string) => {
  showGuestModal.value = false
  await loadGuests()
  formData.value.guest_id = guestId
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

    const { data: newReservation, error: insertError } = await $supabase
      .from('reservations')
      .insert([reservationData])
      .select('*, guest:guests(*), room:rooms(*)')
      .single()

    if (insertError) throw insertError

    await $supabase
      .from('rooms')
      .update({ status: 'reserved' })
      .eq('id', formData.value.room_id)

    // Send booking confirmation email
    const { sendBookingConfirmation } = useEmailNotifications()
    const selectedGuest = guests.value.find(g => g.id === formData.value.guest_id)
    
    if (selectedGuest?.email && newReservation) {
      try {
        const emailResult = await sendBookingConfirmation(newReservation, selectedGuest.email)
        if (emailResult.success) {
          console.log('Booking confirmation email sent successfully')
        } else {
          console.warn('Failed to send booking confirmation email:', emailResult.error)
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError)
        // Don't fail the reservation creation if email fails
      }
    }

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
