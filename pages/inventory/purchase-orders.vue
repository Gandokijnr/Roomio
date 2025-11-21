<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p class="mt-1 text-sm text-gray-500">
              View and manage inventory purchase orders
            </p>
          </div>
          <button
            @click="navigateTo('/inventory')"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500 w-full sm:w-auto"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="statusFilter"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="partial_received">Partially Received</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              v-model="supplierFilter"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            >
              <option value="">All Suppliers</option>
              <option
                v-for="supplier in suppliers"
                :key="supplier.id"
                :value="supplier.id"
              >
                {{ supplier.vendor_name }}
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Purchase Orders
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ purchaseOrders.length }} orders found
            </p>
          </div>
          <button
            @click="refresh"
            class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
          >
            Refresh
          </button>
        </div>

        <div v-if="loading" class="p-6 text-center text-sm text-gray-500">
          Loading purchase orders...
        </div>

        <div v-else-if="purchaseOrders.length === 0" class="p-6 text-center text-sm text-gray-500">
          No purchase orders found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Number
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in purchaseOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="font-medium">{{ order.po_number }}</div>
                  <div class="text-xs text-gray-500">{{ order.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.supplier?.vendor_name || 'Unknown' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(order.order_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(order.expected_delivery_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="statusClass(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ₦{{ formatCurrency(order.total_amount || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    v-if="canReceive(order)"
                    @click="receiveOrder(order)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                    :disabled="receivingId === order.id"
                  >
                    <span v-if="receivingId === order.id">Receiving...</span>
                    <span v-else>Receive Order</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { profile } = useAuth()

const purchaseOrders = ref([])
const suppliers = ref([])
const loading = ref(true)
const receivingId = ref(null)
const statusFilter = ref('')
const supplierFilter = ref('')

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date))
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const statusClass = (status) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sent':
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'partial_received':
      return 'bg-yellow-100 text-yellow-800'
    case 'received':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const canReceive = (order) => {
  return ['draft', 'sent', 'confirmed'].includes(order.status)
}

const clearFilters = () => {
  statusFilter.value = ''
  supplierFilter.value = ''
  fetchPurchaseOrders()
}

const fetchSuppliers = async () => {
  try {
    const { data } = await $fetch('/api/vendors')
    suppliers.value = data || []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const fetchPurchaseOrders = async () => {
  try {
    loading.value = true
    const { data } = await $fetch('/api/purchase-orders', {
      params: {
        status: statusFilter.value || undefined,
        supplier_id: supplierFilter.value || undefined
      }
    })
    purchaseOrders.value = data || []
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  fetchPurchaseOrders()
}

const receiveOrder = async (order) => {
  if (!profile.value?.id) {
    alert('Your user profile is not loaded. Please refresh the page and try again.')
    return
  }

  if (!confirm('Mark this purchase order as received and update inventory?')) {
    return
  }

  try {
    receivingId.value = order.id
    await $fetch(`/api/purchase-orders/${order.id}/approve`, {
      method: 'POST',
      body: {
        approver_id: profile.value.id
      }
    })

    await fetchPurchaseOrders()
  } catch (error) {
    console.error('Error receiving purchase order:', error)
    alert('Failed to receive purchase order. Please try again.')
  } finally {
    receivingId.value = null
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSuppliers(),
    fetchPurchaseOrders()
  ])
})
</script>
