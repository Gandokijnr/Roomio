<template>
  <div class="min-h-screen bg-gray-50 page-header">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p class="mt-1 text-sm text-gray-500">
              Track and manage restaurant and bar inventory
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showAddItemModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </button>
            <button
              @click="showPurchaseOrderModal = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <ShoppingCartIcon class="h-4 w-4 mr-2" />
              Create Purchase Order
            </button>
            <button
              @click="navigateTo('/inventory/purchase-orders')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              View Purchase Orders
            </button>
            <button
              @click="navigateTo('/expenses/vendors')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              Manage Vendors
            </button>
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
                <CubeIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Items
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalItems }}
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

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-6 w-6 text-lg text-green-400">₦</div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    ₦{{ formatCurrency(stats.totalValue) }}
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
                    Pending Orders
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.pendingOrders }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search items..."
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select
              v-model="selectedCategory"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Stock Status</label>
            <select
              v-model="stockFilter"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
            >
              <option value="">All Items</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
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
    </div>

    <!-- Inventory Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Inventory Items
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            {{ filteredItems.length }} items found
          </p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ item.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ item.item_code }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getCategoryName(item.category_id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.current_stock }} {{ item.unit_of_measure }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.minimum_stock }} {{ item.unit_of_measure }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{{ formatCurrency(item.unit_cost) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{{ formatCurrency(item.current_stock * item.unit_cost) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStockStatusClass(item)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStockStatus(item) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="adjustStock(item)"
                      class="text-royal-gold-600 hover:text-royal-gold-900"
                      title="Adjust Stock"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="viewTransactions(item)"
                      class="text-blue-600 hover:text-blue-900"
                      title="View Transactions"
                    >
                      <ClockIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="editItem(item)"
                      class="text-gray-600 hover:text-gray-900"
                      title="Edit Item"
                    >
                      <CogIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ startIndex + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(endIndex, filteredItems.length) }}</span>
                of
                <span class="font-medium">{{ filteredItems.length }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-royal-gold-50 border-royal-gold-500 text-royal-gold-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <InventoryItemModal
      v-if="showAddItemModal"
      :is-open="showAddItemModal"
      :categories="categories"
      :suppliers="suppliers"
      @close="showAddItemModal = false"
      @saved="handleItemSaved"
    />

    <!-- Edit Item Modal -->
    <InventoryItemModal
      v-if="showEditItemModal"
      :is-open="showEditItemModal"
      :item="selectedItem"
      :categories="categories"
      :suppliers="suppliers"
      @close="showEditItemModal = false"
      @saved="handleItemSaved"
    />

    <!-- Stock Adjustment Modal -->
    <StockAdjustmentModal
      v-if="showStockAdjustmentModal"
      :is-open="showStockAdjustmentModal"
      :item="selectedItem"
      @close="showStockAdjustmentModal = false"
      @saved="handleStockAdjusted"
    />

    <!-- Purchase Order Modal -->
    <PurchaseOrderModal
      v-if="showPurchaseOrderModal"
      :is-open="showPurchaseOrderModal"
      :suppliers="suppliers"
      :inventory-items="inventoryItems"
      @close="showPurchaseOrderModal = false"
      @saved="handlePurchaseOrderCreated"
    />

    <!-- Transaction History Modal -->
    <TransactionHistoryModal
      v-if="showTransactionHistoryModal"
      :is-open="showTransactionHistoryModal"
      :item="selectedItem"
      @close="showTransactionHistoryModal = false"
    />
  </div>
</template>

<script setup>
import {
  PlusIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PencilIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Reactive data
const inventoryItems = ref([])
const categories = ref([])
const suppliers = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const stockFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Modal states
const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const showStockAdjustmentModal = ref(false)
const showPurchaseOrderModal = ref(false)
const showTransactionHistoryModal = ref(false)
const selectedItem = ref(null)

// Stats
const pendingOrdersCount = ref(0)

const stats = computed(() => {
  const totalItems = inventoryItems.value.length
  const lowStockItems = inventoryItems.value.filter(item => 
    item.current_stock <= item.minimum_stock
  ).length
  const totalValue = inventoryItems.value.reduce((sum, item) => 
    sum + (item.current_stock * item.unit_cost), 0
  )

  return {
    totalItems,
    lowStockItems,
    totalValue,
    pendingOrders: pendingOrdersCount.value
  }
})

// Filtered items
const filteredItems = computed(() => {
  let items = inventoryItems.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.item_code.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    items = items.filter(item => item.category_id === selectedCategory.value)
  }

  // Stock filter
  if (stockFilter.value) {
    items = items.filter(item => {
      switch (stockFilter.value) {
        case 'in_stock':
          return item.current_stock > item.minimum_stock
        case 'low_stock':
          return item.current_stock <= item.minimum_stock && item.current_stock > 0
        case 'out_of_stock':
          return item.current_stock === 0
        default:
          return true
      }
    })
  }

  return items
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedItems = computed(() => 
  filteredItems.value.slice(startIndex.value, endIndex.value)
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown'
}

const getStockStatus = (item) => {
  if (item.current_stock === 0) return 'Out of Stock'
  if (item.current_stock <= item.minimum_stock) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClass = (item) => {
  if (item.current_stock === 0) {
    return 'bg-red-100 text-red-800'
  }
  if (item.current_stock <= item.minimum_stock) {
    return 'bg-yellow-100 text-yellow-800'
  }
  return 'bg-green-100 text-green-800'
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  stockFilter.value = ''
  currentPage.value = 1
}

const adjustStock = (item) => {
  selectedItem.value = item
  showStockAdjustmentModal.value = true
}

const editItem = (item) => {
  selectedItem.value = item
  showEditItemModal.value = true
}

const viewTransactions = (item) => {
  selectedItem.value = item
  showTransactionHistoryModal.value = true
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

const handleItemSaved = () => {
  showAddItemModal.value = false
  showEditItemModal.value = false
  selectedItem.value = null
  fetchInventoryItems()
}

const handleStockAdjusted = () => {
  showStockAdjustmentModal.value = false
  selectedItem.value = null
  fetchInventoryItems()
}

const handlePurchaseOrderCreated = () => {
  showPurchaseOrderModal.value = false
  // Refresh pending orders count after creating a new purchase order
  fetchPendingOrders()
}

// API calls
const fetchInventoryItems = async () => {
  try {
    const { data } = await $fetch('/api/inventory/items')
    inventoryItems.value = data || []
  } catch (error) {
    console.error('Error fetching inventory items:', error)
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/inventory/categories')
    categories.value = data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchSuppliers = async () => {
  try {
    const { data } = await $fetch('/api/vendors')
    suppliers.value = data || []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const fetchPendingOrders = async () => {
  try {
    const { pendingCount } = await $fetch('/api/purchase-orders', {
      params: { scope: 'pending' }
    })
    pendingOrdersCount.value = pendingCount || 0
  } catch (error) {
    console.error('Error fetching pending purchase orders:', error)
  }
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchInventoryItems(),
    fetchCategories(),
    fetchSuppliers(),
    fetchPendingOrders()
  ])
})

// Watch for filter changes to reset pagination
watch([searchQuery, selectedCategory, stockFilter], () => {
  currentPage.value = 1
})
</script>
