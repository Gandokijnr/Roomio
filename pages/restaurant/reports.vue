<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Restaurant Reports</h1>
            <p class="mt-1 text-sm text-gray-500">
              Analytics and insights for restaurant operations
            </p>
          </div>
          <div class="flex space-x-3">
            <select
              v-model="selectedPeriod"
              class="border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              @click="exportReport"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-6 w-6 text-green-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    ₦{{ formatCurrency(metrics.totalRevenue) }}
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex items-center text-sm">
                <span :class="metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ metrics.revenueGrowth >= 0 ? '+' : '' }}{{ metrics.revenueGrowth }}%
                </span>
                <span class="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClipboardDocumentListIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ metrics.totalOrders }}
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex items-center text-sm">
                <span :class="metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ metrics.ordersGrowth >= 0 ? '+' : '' }}{{ metrics.ordersGrowth }}%
                </span>
                <span class="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CalculatorIcon class="h-6 w-6 text-purple-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Average Order Value
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    ₦{{ formatCurrency(metrics.averageOrderValue) }}
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex items-center text-sm">
                <span :class="metrics.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ metrics.aovGrowth >= 0 ? '+' : '' }}{{ metrics.aovGrowth }}%
                </span>
                <span class="text-gray-500 ml-1">vs previous period</span>
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
                    Avg Preparation Time
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ metrics.avgPrepTime }}m
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex items-center text-sm">
                <span :class="metrics.prepTimeChange <= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ metrics.prepTimeChange <= 0 ? '' : '+' }}{{ metrics.prepTimeChange }}m
                </span>
                <span class="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Revenue Chart -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div class="text-center">
              <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400" />
              <p class="mt-2 text-sm text-gray-500">Revenue chart would be displayed here</p>
              <p class="text-xs text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        <!-- Popular Items Chart -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Top Selling Items</h3>
          <div class="space-y-3">
            <div v-for="item in topSellingItems" :key="item.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-royal-gold-100 rounded-full flex items-center justify-center text-xs font-medium text-royal-gold-800">
                  {{ item.rank }}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.category }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ item.quantity_sold }}</p>
                <p class="text-xs text-gray-500">₦{{ formatCurrency(item.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Order Status Breakdown -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <div class="space-y-3">
            <div v-for="status in orderStatusBreakdown" :key="status.status" class="flex items-center justify-between">
              <div class="flex items-center">
                <div :class="getStatusColor(status.status)" class="w-3 h-3 rounded-full mr-3"></div>
                <span class="text-sm text-gray-700 capitalize">{{ status.status.replace('_', ' ') }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-900">{{ status.count }}</span>
                <span class="text-xs text-gray-500 ml-1">({{ status.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Peak Hours -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Peak Hours</h3>
          <div class="space-y-3">
            <div v-for="hour in peakHours" :key="hour.hour" class="flex items-center justify-between">
              <span class="text-sm text-gray-700">{{ hour.hour }}:00</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    class="bg-royal-gold-600 h-2 rounded-full" 
                    :style="{ width: `${(hour.orders / Math.max(...peakHours.map(h => h.orders))) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ hour.orders }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Satisfaction -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Customer Satisfaction</h3>
          <div class="text-center mb-4">
            <div class="text-3xl font-bold text-royal-gold-600">{{ metrics.averageRating }}</div>
            <div class="text-sm text-gray-500">Average Rating</div>
            <div class="flex justify-center mt-2">
              <div class="flex space-x-1">
                <StarIcon 
                  v-for="i in 5" 
                  :key="i" 
                  :class="i <= Math.floor(metrics.averageRating) ? 'text-yellow-400' : 'text-gray-300'" 
                  class="h-5 w-5 fill-current" 
                />
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div v-for="rating in ratingBreakdown" :key="rating.stars" class="flex items-center">
              <span class="text-xs text-gray-600 w-8">{{ rating.stars }}★</span>
              <div class="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-yellow-400 h-2 rounded-full" 
                  :style="{ width: `${rating.percentage}%` }"
                ></div>
              </div>
              <span class="text-xs text-gray-600 w-8">{{ rating.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory Alerts -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Inventory Alerts
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Items requiring attention
          </p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="alert in inventoryAlerts" :key="alert.id" class="border border-red-200 rounded-lg p-4 bg-red-50">
              <div class="flex items-center">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
                <h4 class="text-sm font-medium text-red-800">{{ alert.item_name }}</h4>
              </div>
              <p class="text-sm text-red-700 mt-1">
                Current stock: {{ alert.current_stock }} {{ alert.unit }}
              </p>
              <p class="text-xs text-red-600 mt-1">
                Minimum required: {{ alert.minimum_stock }} {{ alert.unit }}
              </p>
            </div>
          </div>
          
          <div v-if="inventoryAlerts.length === 0" class="text-center py-8">
            <CheckCircleIcon class="mx-auto h-12 w-12 text-green-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">All inventory levels are healthy</h3>
            <p class="mt-1 text-sm text-gray-500">No items require immediate attention.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Reactive data
const selectedPeriod = ref('today')
const metrics = ref({
  totalRevenue: 450000,
  revenueGrowth: 12.5,
  totalOrders: 156,
  ordersGrowth: 8.3,
  averageOrderValue: 2885,
  aovGrowth: 4.2,
  avgPrepTime: 18,
  prepTimeChange: -2,
  averageRating: 4.3
})

const topSellingItems = ref([
  { id: 1, rank: 1, name: 'Jollof Rice & Chicken', category: 'Main Course', quantity_sold: 45, revenue: 67500 },
  { id: 2, rank: 2, name: 'Fried Rice Special', category: 'Main Course', quantity_sold: 38, revenue: 57000 },
  { id: 3, rank: 3, name: 'Pepper Soup', category: 'Soup', quantity_sold: 32, revenue: 32000 },
  { id: 4, rank: 4, name: 'Grilled Fish', category: 'Seafood', quantity_sold: 28, revenue: 42000 },
  { id: 5, rank: 5, name: 'Suya Platter', category: 'Appetizer', quantity_sold: 25, revenue: 25000 }
])

const orderStatusBreakdown = ref([
  { status: 'completed', count: 120, percentage: 77 },
  { status: 'pending', count: 15, percentage: 10 },
  { status: 'preparing', count: 12, percentage: 8 },
  { status: 'cancelled', count: 9, percentage: 5 }
])

const peakHours = ref([
  { hour: 12, orders: 25 },
  { hour: 13, orders: 32 },
  { hour: 14, orders: 18 },
  { hour: 18, orders: 28 },
  { hour: 19, orders: 35 },
  { hour: 20, orders: 22 },
  { hour: 21, orders: 15 }
])

const ratingBreakdown = ref([
  { stars: 5, count: 89, percentage: 68 },
  { stars: 4, count: 28, percentage: 21 },
  { stars: 3, count: 10, percentage: 8 },
  { stars: 2, count: 3, percentage: 2 },
  { stars: 1, count: 1, percentage: 1 }
])

const inventoryAlerts = ref([
  { id: 1, item_name: 'Rice (Long Grain)', current_stock: 5, minimum_stock: 20, unit: 'kg' },
  { id: 2, item_name: 'Chicken (Whole)', current_stock: 3, minimum_stock: 10, unit: 'pieces' },
  { id: 3, item_name: 'Palm Oil', current_stock: 2, minimum_stock: 5, unit: 'liters' }
])

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-green-400',
    pending: 'bg-yellow-400',
    preparing: 'bg-blue-400',
    cancelled: 'bg-red-400'
  }
  return colors[status] || 'bg-gray-400'
}

const exportReport = () => {
  // Implementation for exporting reports
  console.log('Exporting report for period:', selectedPeriod.value)
}

// Watch for period changes to update data
watch(selectedPeriod, (newPeriod) => {
  console.log('Period changed to:', newPeriod)
  // Here you would fetch new data based on the selected period
})
</script>
