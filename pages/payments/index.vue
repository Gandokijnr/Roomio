<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Payments
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          Track and manage payment transactions
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <NuxtLink
          to="/expenses"
          class="btn btn-secondary px-4 py-2 w-full sm:w-auto"
        >
          Manage Expenses
        </NuxtLink>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary px-4 py-2 w-full sm:w-auto"
        >
          + Record Payment
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mb-6 p-4 sm:p-6">
      <h3 class="text-base font-semibold text-neutral-900 mb-3">Quick Actions</h3>
      <div class="grid gap-3 sm:gap-4 md:grid-cols-3">
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-3 p-4 sm:p-5 rounded-md border-2 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-primary-500 transition transform hover:-translate-y-0.5 hover:shadow-md text-left w-full"
        >
          <span class="text-2xl flex-shrink-0">💳</span>
          <div>
            <strong class="block text-sm font-semibold text-neutral-900 mb-1">
              Record Guest Payment
            </strong>
            <p class="text-xs text-neutral-600">
              Payment from reservation
            </p>
          </div>
        </button>
        <NuxtLink
          to="/expenses"
          class="flex items-center gap-3 p-4 sm:p-5 rounded-md border-2 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-primary-500 transition transform hover:-translate-y-0.5 hover:shadow-md text-left w-full"
        >
          <span class="text-2xl flex-shrink-0">📝</span>
          <div>
            <strong class="block text-sm font-semibold text-neutral-900 mb-1">
              Record Expense
            </strong>
            <p class="text-xs text-neutral-600">
              Business expense or bill
            </p>
          </div>
        </NuxtLink>
        <NuxtLink
          to="/invoices"
          class="flex items-center gap-3 p-4 sm:p-5 rounded-md border-2 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-primary-500 transition transform hover:-translate-y-0.5 hover:shadow-md text-left w-full"
        >
          <span class="text-2xl flex-shrink-0">🧾</span>
          <div>
            <strong class="block text-sm font-semibold text-neutral-900 mb-1">
              Create Invoice
            </strong>
            <p class="text-xs text-neutral-600">
              Generate guest invoice
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">
      Loading payments...
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Reservation #
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Guest
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Amount
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Method
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-100">
            <tr
              v-for="payment in payments"
              :key="payment.id"
              class="hover:bg-neutral-50"
            >
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ formatDate(payment.payment_date) }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ payment.reservation?.reservation_number }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700">
                {{ payment.reservation?.guest?.first_name }}
                {{ payment.reservation?.guest?.last_name }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 text-right whitespace-nowrap">
                ₦{{ payment.amount.toFixed(2) }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ payment.payment_method }}
              </td>
              <td class="px-4 py-3">
                <span :class="['badge', `badge-${getStatusColor(payment.payment_status)}`]">
                  {{ payment.payment_status }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ payment.transaction_id || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
