<template>
  <div class="invoices-page">
    <div class="page-header">
      <div>
        <h1>Invoices</h1>
        <p>Manage billing and invoices</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading invoices...</div>

    <div v-else-if="invoices.length === 0" class="empty-state card">
      <div class="empty-icon">📄</div>
      <h3>No invoices found</h3>
    </div>

    <div v-else class="invoices-table card">
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Guest</th>
            <th>Issue Date</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td class="invoice-number">{{ invoice.invoice_number }}</td>
            <td>{{ invoice.guest?.first_name }} {{ invoice.guest?.last_name }}</td>
            <td>{{ formatDate(invoice.issue_date) }}</td>
            <td class="amount">₦{{ invoice.total_amount.toFixed(2) }}</td>
            <td>
              <span :class="['badge', `badge-${getStatusColor(invoice.status)}`]">
                {{ invoice.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Invoice, InvoiceStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const invoices = ref<Invoice[]>([])

const loadInvoices = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('invoices')
      .select('*, guest:guests(*)')
      .order('issue_date', { ascending: false })

    if (error) throw error
    invoices.value = data || []
  } catch (error) {
    console.error('Error loading invoices:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const getStatusColor = (status: InvoiceStatus) => {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'neutral',
    sent: 'primary',
    paid: 'success',
    overdue: 'error',
    cancelled: 'neutral',
  }
  return colors[status] || 'neutral'
}

onMounted(() => {
  loadInvoices()
})
</script>

<style scoped>
.invoices-page {
  max-width: 1400px;
}

.page-header {
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

.loading, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.invoices-table {
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

.invoice-number {
  font-weight: 600;
  color: var(--neutral-900);
}

.amount {
  font-weight: 600;
  color: var(--neutral-900);
}
</style>
