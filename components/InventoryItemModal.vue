<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="flex items-center justify-between mb-6">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      {{ isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item' }}
                    </DialogTitle>
                    <button
                      type="button"
                      @click="$emit('close')"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>

                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <!-- Basic Information -->
                    <div class="sm:col-span-2">
                      <h4 class="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Item Name *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Item Code</label>
                      <input
                        v-model="form.item_code"
                        type="text"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        v-model="form.description"
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Enter item description"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        v-model="form.category_id"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Category</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                          {{ category.name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Unit of Measure *</label>
                      <select
                        v-model="form.unit_of_measure"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Unit</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="l">Liter (l)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="pieces">Pieces</option>
                        <option value="bottles">Bottles</option>
                        <option value="cans">Cans</option>
                        <option value="packs">Packs</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>

                    <!-- Stock Information -->
                    <div class="sm:col-span-2 mt-6">
                      <h4 class="text-sm font-medium text-gray-900 mb-4">Stock Information</h4>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Current Stock</label>
                      <input
                        v-model.number="form.current_stock"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Minimum Stock *</label>
                      <input
                        v-model.number="form.minimum_stock"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Maximum Stock</label>
                      <input
                        v-model.number="form.maximum_stock"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Reorder Point</label>
                      <input
                        v-model.number="form.reorder_point"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Pricing Information -->
                    <div class="sm:col-span-2 mt-6">
                      <h4 class="text-sm font-medium text-gray-900 mb-4">Pricing Information</h4>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Unit Cost (₦)</label>
                      <input
                        v-model.number="form.unit_cost"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Last Purchase Price (₦)</label>
                      <input
                        v-model.number="form.last_purchase_price"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Supplier Information -->
                    <div class="sm:col-span-2 mt-6">
                      <h4 class="text-sm font-medium text-gray-900 mb-4">Supplier Information</h4>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Primary Supplier</label>
                      <select
                        v-model="form.primary_supplier_id"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Supplier</option>
                        <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                          {{ supplier.vendor_name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Supplier Item Code</label>
                      <input
                        v-model="form.supplier_item_code"
                        type="text"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Supplier's item code"
                      />
                    </div>

                    <!-- Storage Information -->
                    <div class="sm:col-span-2 mt-6">
                      <h4 class="text-sm font-medium text-gray-900 mb-4">Storage Information</h4>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Storage Location</label>
                      <input
                        v-model="form.storage_location"
                        type="text"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="e.g., Pantry A, Freezer 1"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Storage Temperature</label>
                      <select
                        v-model="form.storage_temperature"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Temperature</option>
                        <option value="ambient">Ambient</option>
                        <option value="refrigerated">Refrigerated</option>
                        <option value="frozen">Frozen</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Shelf Life (Days)</label>
                      <input
                        v-model.number="form.shelf_life_days"
                        type="number"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Number of days"
                      />
                    </div>

                    <div class="flex items-center">
                      <input
                        v-model="form.is_active"
                        type="checkbox"
                        class="h-4 w-4 text-royal-gold-600 focus:ring-royal-gold-500 border-gray-300 rounded"
                      />
                      <label class="ml-2 block text-sm text-gray-900">
                        Active Item
                      </label>
                    </div>
                  </div>
                </div>

                <div class="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-royal-gold-600 border border-transparent rounded-md shadow-sm hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500 disabled:opacity-50"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                    <span v-else>
                      {{ isEdit ? 'Update Item' : 'Add Item' }}
                    </span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  suppliers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const isEdit = computed(() => !!props.item)

const form = ref({
  name: '',
  item_code: '',
  description: '',
  category_id: '',
  unit_of_measure: '',
  current_stock: 0,
  minimum_stock: 0,
  maximum_stock: null,
  reorder_point: null,
  unit_cost: 0,
  last_purchase_price: null,
  primary_supplier_id: '',
  supplier_item_code: '',
  storage_location: '',
  storage_temperature: '',
  shelf_life_days: null,
  is_active: true
})

// Initialize form with item data if editing
watch(() => props.item, (newItem) => {
  if (newItem) {
    Object.keys(form.value).forEach(key => {
      if (newItem[key] !== undefined) {
        form.value[key] = newItem[key]
      }
    })
  }
}, { immediate: true })

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen && !props.item) {
    Object.keys(form.value).forEach(key => {
      if (typeof form.value[key] === 'boolean') {
        form.value[key] = key === 'is_active'
      } else if (typeof form.value[key] === 'number') {
        form.value[key] = 0
      } else {
        form.value[key] = ''
      }
    })
  }
})

const handleSubmit = async () => {
  loading.value = true
  
  try {
    const url = isEdit.value ? `/api/inventory/items/${props.item.id}` : '/api/inventory/items'
    const method = isEdit.value ? 'PATCH' : 'POST'
    
    const { data } = await $fetch(url, {
      method,
      body: form.value
    })
    
    emit('saved', data)
  } catch (error) {
    console.error('Error saving inventory item:', error)
    // You might want to show a toast notification here
  } finally {
    loading.value = false
  }
}
</script>
