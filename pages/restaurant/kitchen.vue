<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center space-x-2">
            <FireIcon class="h-7 w-7 text-red-500" />
            <h1 class="text-2xl font-semibold text-gray-900">Kitchen Display</h1>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            Live view of active restaurant orders for the kitchen team
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            @click="refreshOrders"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Refresh
          </button>
          <NuxtLink
            to="/restaurant"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
          >
            Back to Restaurant
          </NuxtLink>
        </div>
      </div>

      <!-- Info bar -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center space-x-4 text-sm text-gray-600">
          <div class="flex items-center space-x-1">
            <span class="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>Pending</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
            <span>Served</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Preparing</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ready</span>
          </div>
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <ClockIcon class="h-4 w-4 mr-1" />
          Auto-refreshing every 30 seconds
        </div>
      </div>

      <!-- Kitchen board -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="column in statusColumns"
          :key="column.value"
          class="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <!-- Column header -->
          <div class="px-4 py-3 flex items-center justify-between" :class="column.headerBg">
            <div class="flex items-center space-x-2">
              <span :class="['inline-block w-2 h-2 rounded-full', column.dotBg]"></span>
              <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {{ column.label }}
              </h2>
            </div>
            <span class="text-xs font-medium text-gray-700 bg-white rounded-full px-2 py-0.5">
              {{ ordersByStatus[column.value]?.length || 0 }}
            </span>
          </div>

          <!-- Orders list -->
          <div class="flex-1 overflow-y-auto max-h-[70vh] divide-y divide-gray-200">
            <div
              v-for="order in ordersByStatus[column.value]"
              :key="order.id"
              class="px-3 py-3 space-y-2 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ order.order_number }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ getLocation(order) }} · {{ formatOrderType(order.order_type) }}
                  </p>
                </div>
                <div class="text-right text-xs text-gray-500">
                  <p>{{ formatTime(order.order_time) }}</p>
                  <p class="text-[11px] text-gray-400">{{ formatSince(order.order_time) }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-gray-600 mt-1">
                <div>
                  <p>
                    {{ order.items?.length || 0 }} items · ₦{{ formatCurrency(order.total_amount || 0) }}
                  </p>
                  <p class="text-[11px] text-gray-500" v-if="order.special_instructions">
                    {{ order.special_instructions }}
                  </p>
                </div>
                <div>
                  <span :class="getStatusPillClass(order.order_status)" class="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full">
                    {{ formatStatus(order.order_status) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="!ordersByStatus[column.value] || ordersByStatus[column.value].length === 0" class="px-4 py-6 text-center text-xs text-gray-500">
              <p>No orders in this stage.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state for all -->
      <div v-if="totalActiveOrders === 0" class="mt-10 text-center">
        <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No active kitchen orders</h3>
        <p class="mt-1 text-sm text-gray-500">
          New orders will appear here automatically as they are created.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FireIcon, ClockIcon, ClipboardDocumentListIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
})

// Reactive state
const orders = ref([])

// Status columns used in the board
const statusColumns = [
  {
    value: 'pending',
    label: 'Pending',
    headerBg: 'bg-yellow-50',
    dotBg: 'bg-yellow-400'
  },
  {
    value: 'served',
    label: 'Served',
    headerBg: 'bg-gray-50',
    dotBg: 'bg-gray-400'
  },
  {
    value: 'preparing',
    label: 'Preparing',
    headerBg: 'bg-orange-50',
    dotBg: 'bg-orange-400'
  },
  {
    value: 'ready',
    label: 'Ready',
    headerBg: 'bg-emerald-50',
    dotBg: 'bg-emerald-400'
  }
]

const activeStatuses = statusColumns.map((c) => c.value)

// Group active orders by status
const ordersByStatus = computed(() => {
  const buckets = {
    pending: [],
    served: [],
    preparing: [],
    ready: []
  }

  for (const order of orders.value) {
    if (activeStatuses.includes(order.order_status)) {
      buckets[order.order_status].push(order)
    }
  }

  // Sort each bucket by order time (oldest first)
  for (const key of Object.keys(buckets)) {
    buckets[key].sort((a, b) => new Date(a.order_time) - new Date(b.order_time))
  }

  return buckets
})

const totalActiveOrders = computed(() => {
  return activeStatuses.reduce((sum, status) => sum + (ordersByStatus.value[status]?.length || 0), 0)
})

// Helpers aligned with restaurant/index.vue
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const formatOrderType = (type) => {
  const types = {
    dine_in: 'Dine In',
    room_service: 'Room Service',
    takeaway: 'Takeaway',
    delivery: 'Delivery'
  }
  return types[type] || type
}

const formatStatus = (status) => {
  const statuses = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return statuses[status] || status
}

const getStatusPillClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatSince = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes <= 0) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  return `${hours}h ${minutes}m ago`
}

const getLocation = (order) => {
  if (!order) return ''
  if (order.table_number) return `Table ${order.table_number}`
  if (order.room_number) return `Room ${order.room_number}`
  return 'Takeaway'
}

// API calls
const fetchOrders = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/orders')
    orders.value = data || []
  } catch (error) {
    console.error('Error fetching kitchen orders:', error)
  }
}

const refreshOrders = () => {
  fetchOrders()
}

// Initialization and auto-refresh
let refreshInterval

onMounted(async () => {
  await fetchOrders()
  refreshInterval = setInterval(fetchOrders, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
