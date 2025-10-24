<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>Check-In: {{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleCheckIn" class="modal-body">
        <div class="reservation-summary">
          <h3>Reservation Details</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <label>Reservation Number:</label>
              <span>{{ reservation.reservation_number }}</span>
            </div>
            <div class="summary-item">
              <label>Room:</label>
              <span>{{ reservation.room?.room_number }}</span>
            </div>
            <div class="summary-item">
              <label>Check-in Date:</label>
              <span>{{ formatDate(reservation.check_in_date) }}</span>
            </div>
            <div class="summary-item">
              <label>Check-out Date:</label>
              <span>{{ formatDate(reservation.check_out_date) }}</span>
            </div>
            <div class="summary-item">
              <label>Guests:</label>
              <span>{{ reservation.number_of_adults }} Adults, {{ reservation.number_of_children }} Children</span>
            </div>
            <div class="summary-item">
              <label>Total Amount:</label>
              <span>₦{{ reservation.total_amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Guest Identification</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="id-type">ID Type *</label>
              <select
                id="id-type"
                v-model="checkInData.id_type"
                class="input"
                required
                :disabled="loading"
              >
                <option value="">Select ID Type</option>
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="driver_license">Driver's License</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="id-number">ID Number *</label>
              <input
                id="id-number"
                v-model="checkInData.id_number"
                type="text"
                class="input"
                required
                :disabled="loading"
                placeholder="Enter ID number"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                id="phone"
                v-model="checkInData.phone"
                type="tel"
                class="input"
                :disabled="loading"
                placeholder="Guest phone number"
              />
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <input
                id="address"
                v-model="checkInData.address"
                type="text"
                class="input"
                :disabled="loading"
                placeholder="Guest address"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Payment Verification</h3>
          <div class="payment-status">
            <div class="payment-info">
              <span class="label">Total Amount:</span>
              <span class="amount">₦{{ reservation.total_amount.toFixed(2) }}</span>
            </div>
            <div class="payment-info">
              <span class="label">Paid Amount:</span>
              <span class="amount">₦{{ reservation.paid_amount.toFixed(2) }}</span>
            </div>
            <div class="payment-info">
              <span class="label">Balance Due:</span>
              <span class="amount balance" :class="{ 'paid': balanceDue <= 0 }">
                ₦{{ balanceDue.toFixed(2) }}
              </span>
            </div>
          </div>

          <div v-if="balanceDue > 0" class="payment-required">
            <div class="form-group">
              <label for="payment-method">Payment Method</label>
              <select
                id="payment-method"
                v-model="checkInData.payment_method"
                class="input"
                :disabled="loading"
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>

            <div class="form-group">
              <label for="payment-amount">Payment Amount</label>
              <input
                id="payment-amount"
                v-model.number="checkInData.payment_amount"
                type="number"
                step="0.01"
                class="input"
                :disabled="loading"
                :max="balanceDue"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Additional Information</h3>
          <div class="form-group">
            <label for="notes">Check-in Notes</label>
            <textarea
              id="notes"
              v-model="checkInData.notes"
              class="input"
              rows="3"
              :disabled="loading"
              placeholder="Any additional notes for this check-in..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="checkInData.key_issued"
                :disabled="loading"
              />
              Room key issued to guest
            </label>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
          >
            {{ loading ? 'Processing...' : 'Complete Check-In' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reservation } from '~/types/database'

const props = defineProps<{
  reservation: Reservation
}>()

const emit = defineEmits<{
  close: []
  checkedIn: []
}>()

const { $supabase } = useNuxtApp()
const { user } = useAuth()

const loading = ref(false)
const error = ref('')

const checkInData = ref({
  id_type: props.reservation.guest?.id_type || '',
  id_number: props.reservation.guest?.id_number || '',
  phone: props.reservation.guest?.phone || '',
  address: props.reservation.guest?.address || '',
  payment_method: '',
  payment_amount: 0,
  notes: '',
  key_issued: false,
})

const balanceDue = computed(() => {
  return Math.max(0, props.reservation.total_amount - props.reservation.paid_amount)
})

const isFormValid = computed(() => {
  return checkInData.value.id_type && checkInData.value.id_number
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const handleCheckIn = async () => {
  try {
    loading.value = true
    error.value = ''

    // Update guest information
    const { error: guestError } = await $supabase
      .from('guests')
      .update({
        id_type: checkInData.value.id_type,
        id_number: checkInData.value.id_number,
        phone: checkInData.value.phone || null,
        address: checkInData.value.address || null,
      })
      .eq('id', props.reservation.guest_id)

    if (guestError) throw guestError

    // Record payment if amount provided
    if (checkInData.value.payment_amount > 0 && checkInData.value.payment_method) {
      const { error: paymentError } = await $supabase
        .from('payments')
        .insert({
          reservation_id: props.reservation.id,
          amount: checkInData.value.payment_amount,
          payment_method: checkInData.value.payment_method,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          notes: 'Check-in payment',
          processed_by: user.value.id,
        })

      if (paymentError) throw paymentError

      // Update reservation paid amount
      const newPaidAmount = props.reservation.paid_amount + checkInData.value.payment_amount
      await $supabase
        .from('reservations')
        .update({ paid_amount: newPaidAmount })
        .eq('id', props.reservation.id)
    }

    // Update reservation status to checked-in
    const { error: reservationError } = await $supabase
      .from('reservations')
      .update({
        status: 'checked_in',
        actual_check_in: new Date().toISOString()
      })
      .eq('id', props.reservation.id)

    if (reservationError) throw reservationError

    // Update room status to occupied
    const { error: roomError } = await $supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', props.reservation.room_id)

    if (roomError) throw roomError

    // Log the check-in activity
    await $supabase
      .from('activity_logs')
      .insert({
        user_id: user.value.id,
        action: 'check_in',
        entity_type: 'reservation',
        entity_id: props.reservation.id,
        metadata: {
          guest_name: `${props.reservation.guest?.first_name} ${props.reservation.guest?.last_name}`,
          room_number: props.reservation.room?.room_number,
          id_verified: true,
          key_issued: checkInData.value.key_issued,
          notes: checkInData.value.notes
        }
      })

    emit('checkedIn')
  } catch (err: any) {
    console.error('Error during check-in:', err)
    error.value = err.message || 'Failed to complete check-in'
  } finally {
    loading.value = false
  }
}
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
  max-width: 800px;
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

.form-section {
  margin-bottom: var(--spacing-xl);
}

.form-section h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.reservation-summary {
  background: var(--neutral-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item label {
  font-weight: 500;
  color: var(--neutral-700);
}

.summary-item span {
  font-weight: 600;
  color: var(--neutral-900);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--neutral-700);
  cursor: pointer;
}

.payment-status {
  background: var(--neutral-50);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.payment-info:last-child {
  margin-bottom: 0;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--neutral-200);
}

.payment-info .label {
  font-weight: 500;
  color: var(--neutral-700);
}

.payment-info .amount {
  font-weight: 600;
  color: var(--neutral-900);
}

.payment-info .balance {
  color: var(--error-600);
}

.payment-info .balance.paid {
  color: var(--success-600);
}

.payment-required {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
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

textarea.input {
  resize: vertical;
  font-family: inherit;
}
</style>
