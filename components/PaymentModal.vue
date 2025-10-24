<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>Record Payment</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Reservation *</label>
            <select v-model="formData.reservation_id" class="input" required :disabled="loading">
              <option value="">Select reservation</option>
              <option v-for="reservation in reservations" :key="reservation.id" :value="reservation.id">
                {{ reservation.reservation_number }} - {{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Amount *</label>
            <input v-model.number="formData.amount" type="number" step="0.01" class="input" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Payment Method *</label>
            <select v-model="formData.payment_method" class="input" required :disabled="loading">
              <option value="">Select method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Transaction ID</label>
            <input v-model="formData.transaction_id" type="text" class="input" :disabled="loading" />
          </div>

          <div class="form-group full-width">
            <label>Notes</label>
            <textarea v-model="formData.notes" class="input" rows="3" :disabled="loading"></textarea>
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Record Payment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reservation } from '~/types/database'

const emit = defineEmits<{ close: [], saved: [] }>()

const { $supabase } = useNuxtApp()
const { user } = useAuth()

const loading = ref(false)
const error = ref('')
const reservations = ref<Reservation[]>([])

const formData = ref({
  reservation_id: '',
  amount: 0,
  payment_method: '',
  transaction_id: '',
  notes: '',
})

const loadReservations = async () => {
  const { data } = await $supabase
    .from('reservations')
    .select('*, guest:guests(*)')
    .in('status', ['confirmed', 'checked_in'])
    .order('check_in_date', { ascending: false })

  reservations.value = data || []
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    const { error: insertError } = await $supabase
      .from('payments')
      .insert([{
        ...formData.value,
        payment_status: 'completed',
        processed_by: user.value.id,
      }])

    if (insertError) throw insertError

    const { data: reservationData } = await $supabase
      .from('reservations')
      .select('paid_amount')
      .eq('id', formData.value.reservation_id)
      .single()

    if (reservationData) {
      await $supabase
        .from('reservations')
        .update({ paid_amount: reservationData.paid_amount + formData.value.amount })
        .eq('id', formData.value.reservation_id)
    }

    emit('saved')
  } catch (err: any) {
    error.value = err.message || 'Failed to record payment'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReservations()
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
  max-width: 600px;
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
