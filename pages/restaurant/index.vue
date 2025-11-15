<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Restaurant Operations</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage orders, menu, and restaurant operations
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showNewOrderModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              New Order
            </button>
            <NuxtLink
              to="/restaurant/menu"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <BookOpenIcon class="h-4 w-4 mr-2" />
              Manage Menu
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClipboardDocumentListIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Active Orders
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.activeOrders }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-6 w-6 text-yellow-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Avg Prep Time
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.avgPrepTime }}m
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-6 w-6 text-green-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Today's Revenue
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    ₦{{ formatCurrency(stats.todayRevenue) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-6 w-6 text-purple-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Orders Today
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.ordersToday }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <NuxtLink
            to="/restaurant/tables"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TableCellsIcon class="h-8 w-8 text-royal-gold-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Table Management</span>
          </NuxtLink>
          
          <NuxtLink
            to="/restaurant/kitchen"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FireIcon class="h-8 w-8 text-red-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Kitchen Display</span>
          </NuxtLink>
          
          <NuxtLink
            to="/inventory"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CubeIcon class="h-8 w-8 text-blue-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Inventory</span>
          </NuxtLink>
          
          <NuxtLink
            to="/restaurant/reports"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentChartBarIcon class="h-8 w-8 text-green-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Reports</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Recent Orders
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Latest restaurant orders and their status
              </p>
            </div>
            <div class="flex space-x-2">
              <select
                v-model="statusFilter"
                class="border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
              </select>
              <select
                v-model="typeFilter"
                class="border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="dine_in">Dine In</option>
                <option value="room_service">Room Service</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ order.order_number }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.table_number ? `Table ${order.table_number}` : order.room_number ? `Room ${order.room_number}` : 'Takeaway' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ getCustomerName(order) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getOrderTypeClass(order.order_type)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatOrderType(order.order_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.items?.length || 0 }} items
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{{ formatCurrency(order.total_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(order.order_status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(order.order_status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatTime(order.order_time) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="viewOrder(order)"
                      class="text-royal-gold-600 hover:text-royal-gold-900"
                      title="View Order"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="canUpdateStatus(order.order_status)"
                      @click="updateOrderStatus(order)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Update Status"
                    >
                      <ArrowPathIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="order.order_status === 'pending'"
                      @click="cancelOrder(order)"
                      class="text-red-600 hover:text-red-900"
                      title="Cancel Order"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredOrders.length === 0" class="text-center py-12">
          <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p class="mt-1 text-sm text-gray-500">
            Get started by creating a new order.
          </p>
          <div class="mt-6">
            <button
              @click="showNewOrderModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Order Modal -->
    <RestaurantOrderModal
      v-if="showNewOrderModal"
      :is-open="showNewOrderModal"
      :menu-items="menuItems"
      :tables="tables"
      @close="showNewOrderModal = false"
      @saved="handleOrderSaved"
    />

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="showOrderDetailsModal"
      :is-open="showOrderDetailsModal"
      :order="selectedOrder"
      @close="showOrderDetailsModal = false"
      @updated="handleOrderUpdated"
    />

    <!-- Status Update Modal -->
    <OrderStatusModal
      v-if="showStatusModal"
      :is-open="showStatusModal"
      :order="selectedOrder"
      @close="showStatusModal = false"
      @updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup>
import {
  PlusIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TableCellsIcon,
  FireIcon,
  CubeIcon,
  DocumentChartBarIcon,
  EyeIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
})

// Reactive data
const orders = ref([])
const menuItems = ref([])
const tables = ref([])
const statusFilter = ref('')
const typeFilter = ref('')

// Modal states
const showNewOrderModal = ref(false)
const showOrderDetailsModal = ref(false)
const showStatusModal = ref(false)
const selectedOrder = ref(null)

// Stats
const stats = computed(() => {
  const activeOrders = orders.value.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.order_status)
  ).length

  const todayOrders = orders.value.filter(order => {
    const orderDate = new Date(order.order_time)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
  
  // Calculate average prep time (mock data for now)
  const avgPrepTime = 25

  return {
    activeOrders,
    avgPrepTime,
    todayRevenue,
    ordersToday: todayOrders.length
  }
})

// Filtered orders
const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.order_status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(order => order.order_type === typeFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.order_time) - new Date(a.order_time))
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return statuses[status] || status
}

const getOrderTypeClass = (type) => {
  const classes = {
    dine_in: 'bg-blue-100 text-blue-800',
    room_service: 'bg-purple-100 text-purple-800',
    takeaway: 'bg-green-100 text-green-800',
    delivery: 'bg-yellow-100 text-yellow-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getCustomerName = (order) => {
  if (order.guest?.first_name && order.guest?.last_name) {
    return `${order.guest.first_name} ${order.guest.last_name}`
  }
  return 'Walk-in Customer'
}

const canUpdateStatus = (status) => {
  return ['pending', 'confirmed', 'preparing', 'ready'].includes(status)
}

const viewOrder = (order) => {
  selectedOrder.value = order
  showOrderDetailsModal.value = true
}

const updateOrderStatus = (order) => {
  selectedOrder.value = order
  showStatusModal.value = true
}

const cancelOrder = async (order) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    try {
      await $fetch(`/api/restaurant/orders/${order.id}`, {
        method: 'PATCH',
        body: { order_status: 'cancelled' }
      })
      await fetchOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }
}

const handleOrderSaved = () => {
  showNewOrderModal.value = false
  fetchOrders()
}

const handleOrderUpdated = () => {
  showOrderDetailsModal.value = false
  showStatusModal.value = false
  selectedOrder.value = null
  fetchOrders()
}

// API calls
const fetchOrders = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/orders')
    orders.value = data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

const fetchMenuItems = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/menu-items')
    menuItems.value = data || []
  } catch (error) {
    console.error('Error fetching menu items:', error)
  }
}

const fetchTables = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/tables')
    tables.value = data || []
  } catch (error) {
    console.error('Error fetching tables:', error)
  }
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchMenuItems(),
    fetchTables()
  ])
})

// Auto-refresh orders every 30 seconds
let refreshInterval
onMounted(() => {
  refreshInterval = setInterval(fetchOrders, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
