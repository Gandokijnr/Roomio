<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>Check-Out: {{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleCheckOut" class="modal-body">
        <div class="reservation-summary">
          <h3>Stay Summary</h3>
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
              <label>Actual Check-in:</label>
              <span>{{ reservation.actual_check_in ? formatDateTime(reservation.actual_check_in) : 'N/A' }}</span>
            </div>
            <div class="summary-item">
              <label>Total Nights:</label>
              <span>{{ totalNights }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Final Bill Summary</h3>
          <div class="bill-summary">
            <div class="bill-item">
              <span class="label">Room Charges:</span>
              <span class="amount">₦{{ reservation.total_amount.toFixed(2) }}</span>
            </div>
            <div class="bill-item">
              <span class="label">Additional Charges:</span>
              <span class="amount">₦{{ checkOutData.additional_charges.toFixed(2) }}</span>
            </div>
            <div class="bill-item total">
              <span class="label">Total Amount:</span>
              <span class="amount">₦{{ finalTotal.toFixed(2) }}</span>
            </div>
            <div class="bill-item">
              <span class="label">Total Paid:</span>
              <span class="amount">₦{{ totalPaid.toFixed(2) }}</span>
            </div>
            <div class="bill-item balance" :class="{ 'paid': finalBalance <= 0, 'due': finalBalance > 0 }">
              <span class="label">{{ finalBalance > 0 ? 'Balance Due:' : 'Overpaid:' }}</span>
              <span class="amount">₦{{ Math.abs(finalBalance).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Additional Charges</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="additional-charges">Additional Charges</label>
              <input
                id="additional-charges"
                v-model.number="checkOutData.additional_charges"
                type="number"
                step="0.01"
                class="input"
                :disabled="loading"
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label for="charges-description">Charges Description</label>
              <input
                id="charges-description"
                v-model="checkOutData.charges_description"
                type="text"
                class="input"
                :disabled="loading"
                placeholder="e.g., Mini-bar, Room service, Damages"
              />
            </div>
          </div>
        </div>

        <div v-if="finalBalance > 0" class="form-section">
          <h3>Final Payment</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="payment-method">Payment Method</label>
              <select
                id="payment-method"
                v-model="checkOutData.payment_method"
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
              <label for="final-payment">Payment Amount</label>
              <input
                id="final-payment"
                v-model.number="checkOutData.final_payment"
                type="number"
                step="0.01"
                class="input"
                :disabled="loading"
                :max="finalBalance"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Room Condition & Checkout</h3>
          <div class="form-group">
            <label for="room-condition">Room Condition</label>
            <select
              id="room-condition"
              v-model="checkOutData.room_condition"
              class="input"
              required
              :disabled="loading"
            >
              <option value="">Select condition</option>
              <option value="excellent">Excellent - No issues</option>
              <option value="good">Good - Minor cleaning needed</option>
              <option value="fair">Fair - Standard cleaning required</option>
              <option value="poor">Poor - Deep cleaning/maintenance needed</option>
              <option value="damaged">Damaged - Repairs required</option>
            </select>
          </div>

          <div class="form-group">
            <label for="checkout-notes">Check-out Notes</label>
            <textarea
              id="checkout-notes"
              v-model="checkOutData.notes"
              class="input"
              rows="3"
              :disabled="loading"
              placeholder="Any notes about the checkout process, room condition, or guest feedback..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="checkOutData.key_returned"
                :disabled="loading"
              />
              Room key returned by guest
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="checkOutData.generate_invoice"
                :disabled="loading"
              />
              Generate final invoice
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
            {{ loading ? 'Processing...' : 'Complete Check-Out' }}
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
  checkedOut: []
}>()

const { $supabase } = useNuxtApp()
const { user } = useAuth()

const loading = ref(false)
const error = ref('')

const checkOutData = ref({
  additional_charges: 0,
  charges_description: '',
  payment_method: '',
  final_payment: 0,
  room_condition: '',
  notes: '',
  key_returned: false,
  generate_invoice: true,
})

const totalNights = computed(() => {
  const checkIn = new Date(props.reservation.check_in_date)
  const checkOut = new Date(props.reservation.check_out_date)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const finalTotal = computed(() => {
  return props.reservation.total_amount + checkOutData.value.additional_charges
})

const totalPaid = computed(() => {
  return props.reservation.paid_amount + checkOutData.value.final_payment
})

const finalBalance = computed(() => {
  return finalTotal.value - totalPaid.value
})

const isFormValid = computed(() => {
  return checkOutData.value.room_condition
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const handleCheckOut = async () => {
  try {
    loading.value = true
    error.value = ''

    // Record additional charges if any
    if (checkOutData.value.additional_charges > 0) {
      const { error: chargesError } = await $supabase
        .from('payments')
        .insert({
          reservation_id: props.reservation.id,
          amount: checkOutData.value.additional_charges,
          payment_method: 'additional_charges',
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          notes: checkOutData.value.charges_description || 'Additional charges',
          processed_by: user.value.id,
        })

      if (chargesError) throw chargesError
    }

    // Record final payment if provided
    if (checkOutData.value.final_payment > 0 && checkOutData.value.payment_method) {
      const { error: paymentError } = await $supabase
        .from('payments')
        .insert({
          reservation_id: props.reservation.id,
          amount: checkOutData.value.final_payment,
          payment_method: checkOutData.value.payment_method,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          notes: 'Check-out payment',
          processed_by: user.value.id,
        })

      if (paymentError) throw paymentError
    }

    // Update reservation status and totals
    const { error: reservationError } = await $supabase
      .from('reservations')
      .update({
        status: 'checked_out',
        actual_check_out: new Date().toISOString(),
        total_amount: finalTotal.value,
        paid_amount: totalPaid.value
      })
      .eq('id', props.reservation.id)

    if (reservationError) throw reservationError

    // Update room status to needs cleaning
    const { error: roomError } = await $supabase
      .from('rooms')
      .update({ status: 'needs_cleaning' })
      .eq('id', props.reservation.room_id)

    if (roomError) throw roomError

    // Determine task type and priority based on room condition
    let taskType = 'cleaning'
    let priority = 'medium'
    let taskTitle = `Room Cleaning - ${props.reservation.room?.room_number}`
    
    if (checkOutData.value.room_condition === 'damaged' || checkOutData.value.room_condition === 'poor') {
      taskType = 'maintenance'
      priority = 'urgent'
      taskTitle = `Room Maintenance - ${props.reservation.room?.room_number}`
    } else if (checkOutData.value.room_condition === 'excellent') {
      priority = 'low'
    }

    // Create housekeeping task
    const { error: taskError } = await $supabase
      .from('housekeeping_tasks')
      .insert({
        room_id: props.reservation.room_id,
        task_type: taskType,
        priority: priority,
        status: 'pending',
        title: taskTitle,
        description: `Post-checkout ${taskType} required for room ${props.reservation.room?.room_number}. Room condition: ${checkOutData.value.room_condition}`,
        notes: checkOutData.value.notes,
        special_instructions: checkOutData.value.room_condition === 'damaged' ? 'Check for damages and report maintenance issues' : null,
        scheduled_date: new Date().toISOString(),
        created_by: user.value.id,
      })

    if (taskError) throw taskError

    // Generate invoice if requested
    if (checkOutData.value.generate_invoice) {
      const invoiceNumber = `INV-${Date.now()}`
      await $supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          reservation_id: props.reservation.id,
          guest_id: props.reservation.guest_id,
          issue_date: new Date().toISOString(),
          subtotal: finalTotal.value,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: finalTotal.value,
          status: totalPaid.value >= finalTotal.value ? 'paid' : 'sent',
          created_by: user.value.id,
        })
    }

    // Log the check-out activity
    await $supabase
      .from('activity_logs')
      .insert({
        user_id: user.value.id,
        action: 'check_out',
        entity_type: 'reservation',
        entity_id: props.reservation.id,
        metadata: {
          guest_name: `${props.reservation.guest?.first_name} ${props.reservation.guest?.last_name}`,
          room_number: props.reservation.room?.room_number,
          room_condition: checkOutData.value.room_condition,
          key_returned: checkOutData.value.key_returned,
          additional_charges: checkOutData.value.additional_charges,
          final_total: finalTotal.value,
          notes: checkOutData.value.notes
        }
      })

    emit('checkedOut')
  } catch (err: any) {
    console.error('Error during check-out:', err)
    error.value = err.message || 'Failed to complete check-out'
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

.bill-summary {
  background: var(--neutral-50);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.bill-item:last-child {
  margin-bottom: 0;
}

.bill-item.total {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--neutral-300);
  font-weight: 600;
  font-size: 1.125rem;
}

.bill-item.balance {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--neutral-200);
  font-weight: 600;
}

.bill-item.balance.due .amount {
  color: var(--error-600);
}

.bill-item.balance.paid .amount {
  color: var(--success-600);
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
