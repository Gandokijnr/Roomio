<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Restaurant Menu</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage food and beverage items available for ordering
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-lg leading-6 font-medium text-gray-900">Menu Items</h2>
            <p class="mt-1 text-sm text-gray-500">
              Overview of all menu items used for restaurant and bar orders
            </p>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/restaurant"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              Restaurant Operations
            </NuxtLink>
            <input
              v-model="search"
              type="text"
              class="block w-full sm:w-64 border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 text-sm"
              placeholder="Search by name or description"
            />
            <button
              type="button"
              @click="openAddModal"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" v-if="filteredItems.length">
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                  <div class="text-xs text-gray-500">{{ item.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.category?.name || '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatItemType(item.item_type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{{ formatCurrency(item.base_price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ item.is_available ? 'Available' : 'Unavailable' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      @click="openEditModal(item)"
                      class="text-gray-600 hover:text-gray-900"
                      title="Edit item"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      @click="deleteItem(item)"
                      class="text-red-600 hover:text-red-800"
                      title="Delete item"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else class="bg-white">
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500">
                  No menu items found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Menu Item Modal -->
    <MenuItemModal
      v-if="showAddModal"
      :is-open="showAddModal"
      :categories="categories"
      @close="showAddModal = false"
      @saved="handleSaved"
    />

    <!-- Edit Menu Item Modal -->
    <MenuItemModal
      v-if="showEditModal"
      :is-open="showEditModal"
      :item="selectedItem"
      :categories="categories"
      @close="showEditModal = false"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
})

import MenuItemModal from '~/components/MenuItemModal.vue'
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const items = ref([])
const categories = ref([])
const search = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedItem = ref(null)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

const formatItemType = (type) => {
  const map = {
    food: 'Food',
    beverage: 'Beverage',
    combo: 'Combo'
  }
  return map[type] || type
}

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return items.value
  return items.value.filter((item) => {
    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.category?.name?.toLowerCase().includes(term)
    )
  })
})

const fetchMenuItems = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/menu-items')
    items.value = data || []
  } catch (error) {
    console.error('Error fetching menu items:', error)
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/restaurant/menu-categories')
    categories.value = data || []
  } catch (error) {
    console.error('Error fetching menu categories:', error)
  }
}

const openAddModal = () => {
  selectedItem.value = null
  showAddModal.value = true
}

const openEditModal = (item) => {
  selectedItem.value = item
  showEditModal.value = true
}

const handleSaved = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedItem.value = null
  fetchMenuItems()
}

const deleteItem = async (item) => {
  if (!confirm(`Delete menu item "${item.name}"? This cannot be undone.`)) return

  try {
    await $fetch(`/api/restaurant/menu-items/${item.id}`, {
      method: 'DELETE'
    })
    await fetchMenuItems()
  } catch (error) {
    console.error('Error deleting menu item:', error)
    alert('Failed to delete menu item. Please try again.')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchMenuItems(),
    fetchCategories()
  ])
})
</script>
