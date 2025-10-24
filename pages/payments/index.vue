<template>
  <div class="payments-page">
    <div class="page-header">
      <div>
        <h1>Payments</h1>
        <p>Track and manage payment transactions</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Record Payment
      </button>
    </div>

    <div v-if="loading" class="loading">Loading payments...</div>

    <div v-else class="payments-table card">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reservation #</th>
            <th>Guest</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>{{ formatDate(payment.payment_date) }}</td>
            <td>{{ payment.reservation?.reservation_number }}</td>
            <td>{{ payment.reservation?.guest?.first_name }} {{ payment.reservation?.guest?.last_name }}</td>
            <td class="amount">₦{{ payment.amount.toFixed(2) }}</td>
            <td>{{ payment.payment_method }}</td>
            <td>
              <span :class="['badge', `badge-${getStatusColor(payment.payment_status)}`]">
                {{ payment.payment_status }}
              </span>
            </td>
            <td>{{ payment.transaction_id || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaymentModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Payment, PaymentStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const payments = ref<Payment[]>([])
const showCreateModal = ref(false)

const loadPayments = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('payments')
      .select('*, reservation:reservations(*, guest:guests(*))')
      .order('payment_date', { ascending: false })

    if (error) throw error
    payments.value = data || []
  } catch (error) {
    console.error('Error loading payments:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const getStatusColor = (status: PaymentStatus) => {
  const colors: Record<PaymentStatus, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'error',
    refunded: 'neutral',
  }
  return colors[status] || 'neutral'
}

const handlePaymentSaved = () => {
  showCreateModal.value = false
  loadPayments()
}

onMounted(() => {
  loadPayments()
})
</script>

<style scoped>
.payments-page {
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

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.payments-table {
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
}

tbody tr {
  border-bottom: 1px solid var(--neutral-200);
}

tbody tr:hover {
  background: var(--neutral-50);
}

td {
  padding: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.amount {
  font-weight: 600;
  color: var(--neutral-900);
}
</style>
