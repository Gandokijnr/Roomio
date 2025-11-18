<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Bar Operations</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage bar orders, inventory, and beverage operations
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showNewOrderModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              New Bar Order
            </button>
            <NuxtLink
              to="/bar/menu"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <BeakerIcon class="h-4 w-4 mr-2" />
              Manage Drinks Menu
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
                <BeakerIcon class="h-6 w-6 text-purple-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Active Bar Orders
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
                <ClockIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Avg Service Time
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.avgServiceTime }}m
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
                    Bar Revenue Today
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
                <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Low Stock Items
                  </dt>
                  <dd class="text-lg font-medium text-red-600">
                    {{ stats.lowStockItems }}
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
          <button
            @click="showInventoryModal = true"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CubeIcon class="h-8 w-8 text-blue-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Bar Inventory</span>
          </button>
          
          <button
            @click="showDailySpecialsModal = true"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SparklesIcon class="h-8 w-8 text-yellow-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Daily Specials</span>
          </button>
          
          <NuxtLink
            to="/bar/reports"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon class="h-8 w-8 text-green-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Bar Reports</span>
          </NuxtLink>
          
          <button
            @click="showHappyHourModal = true"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClockIcon class="h-8 w-8 text-purple-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Happy Hour</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Popular Drinks Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Popular Drinks Today
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Most ordered beverages and their performance
          </p>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="drink in popularDrinks" :key="drink.id" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ drink.name }}</h4>
                  <p class="text-sm text-gray-500">{{ drink.category }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ drink.orders_today }} orders</p>
                  <p class="text-sm text-gray-500">₦{{ formatCurrency(drink.revenue_today) }}</p>
                </div>
              </div>
              <div class="mt-2">
                <div class="bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-royal-gold-600 h-2 rounded-full" 
                    :style="{ width: `${(drink.orders_today / Math.max(...popularDrinks.map(d => d.orders_today))) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Bar Orders -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Recent Bar Orders
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Latest beverage orders and their status
              </p>
            </div>
            <div class="flex space-x-2">
              <select
                v-model="statusFilter"
                class="border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
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
                  Location
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
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ getCustomerName(order) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center space-x-2">
                    <span>{{ getOrderLocation(order) }}</span>
                    <span
                      v-if="order.table_number && getTableStatus(order.table_number)"
                      :class="getTableStatusClass(getTableStatus(order.table_number))"
                      class="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full"
                    >
                      {{ formatTableStatus(getTableStatus(order.table_number)) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.items?.length || 0 }} drinks
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
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredOrders.length === 0" class="text-center py-12">
          <BeakerIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No bar orders found</h3>
          <p class="mt-1 text-sm text-gray-500">
            Get started by creating a new bar order.
          </p>
          <div class="mt-6">
            <button
              @click="showNewOrderModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              New Bar Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BarOrderModal
      v-if="showNewOrderModal"
      :is-open="showNewOrderModal"
      :menu-items="beverageItems"
      @close="showNewOrderModal = false"
      @saved="handleOrderSaved"
    />

    <BarInventoryModal
      v-if="showInventoryModal"
      :is-open="showInventoryModal"
      @close="showInventoryModal = false"
    />

    <DailySpecialsModal
      v-if="showDailySpecialsModal"
      :is-open="showDailySpecialsModal"
      :menu-items="beverageItems"
      @close="showDailySpecialsModal = false"
    />

    <HappyHourModal
      v-if="showHappyHourModal"
      :is-open="showHappyHourModal"
      @close="showHappyHourModal = false"
    />
  </div>
</template>

<script setup>
import {
  PlusIcon,
  BeakerIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  SparklesIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Reactive data
const orders = ref([])
const beverageItems = ref([])
const popularDrinks = ref([])
const tables = ref([])
const statusFilter = ref('')

// Modal states
const showNewOrderModal = ref(false)
const showInventoryModal = ref(false)
const showDailySpecialsModal = ref(false)
const showHappyHourModal = ref(false)

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
  
  // Mock data for now
  const avgServiceTime = 8
  const lowStockItems = 3

  return {
    activeOrders,
    avgServiceTime,
    todayRevenue,
    lowStockItems
  }
})

// Filtered orders
const filteredOrders = computed(() => {
  let filtered = orders.value.filter(order => 
    // Only show bar orders (beverages)
    order.order_type === 'bar' || order.items?.some(item => item.menu_item?.item_type === 'beverage')
  )

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.order_status === statusFilter.value)
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

const getOrderLocation = (order) => {
  if (order.table_number) return `Table ${order.table_number}`
  if (order.room_number) return `Room ${order.room_number}`
  return 'Bar Counter'
}

const getTableStatus = (tableNumber) => {
  if (!tableNumber) return null
  const table = tables.value.find((t) => t.table_number === tableNumber)
  return table?.status || null
}

const formatTableStatus = (status) => {
  if (!status) return ''
  const statuses = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    blocked: 'Blocked'
  }
  return statuses[status] || status
}

const getTableStatusClass = (status) => {
  const classes = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-gray-200 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const canUpdateStatus = (status) => {
  return ['pending', 'confirmed', 'preparing', 'ready'].includes(status)
}

const viewOrder = (order) => {
  // Implementation for viewing order details
  console.log('View order:', order)
}

const updateOrderStatus = (order) => {
  // Implementation for updating order status
  console.log('Update status for order:', order)
}

const handleOrderSaved = () => {
  showNewOrderModal.value = false
  fetchOrders()
}

// API calls
const fetchOrders = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/orders', {
      query: { order_type: 'bar' }
    })
    orders.value = data || []
  } catch (error) {
    console.error('Error fetching bar orders:', error)
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

const fetchBeverageItems = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/menu-items', {
      query: { item_type: 'beverage' }
    })
    beverageItems.value = data || []
  } catch (error) {
    console.error('Error fetching beverage items:', error)
  }
}

const fetchPopularDrinks = async () => {
  // Mock data for popular drinks
  popularDrinks.value = [
    { id: 1, name: 'Mojito', category: 'Cocktail', orders_today: 15, revenue_today: 22500 },
    { id: 2, name: 'Beer', category: 'Alcoholic', orders_today: 25, revenue_today: 12500 },
    { id: 3, name: 'Wine', category: 'Alcoholic', orders_today: 12, revenue_today: 36000 },
    { id: 4, name: 'Soft Drinks', category: 'Non-Alcoholic', orders_today: 30, revenue_today: 9000 },
    { id: 5, name: 'Coffee', category: 'Hot Beverage', orders_today: 20, revenue_today: 10000 },
    { id: 6, name: 'Fresh Juice', category: 'Non-Alcoholic', orders_today: 18, revenue_today: 13500 }
  ]
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchBeverageItems(),
    fetchPopularDrinks(),
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
