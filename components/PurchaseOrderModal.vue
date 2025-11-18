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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="flex items-center justify-between mb-6">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      Create Purchase Order
                    </DialogTitle>
                    <button
                      type="button"
                      @click="$emit('close')"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>

                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                    <!-- Supplier Selection -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Supplier *</label>
                      <select
                        v-model="form.supplier_id"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Supplier</option>
                        <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                          {{ supplier.vendor_name }}
                        </option>
                      </select>
                    </div>

                    <!-- Expected Delivery Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
                      <input
                        v-model="form.expected_delivery_date"
                        type="date"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <!-- Items Section -->
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-sm font-medium text-gray-900">Order Items</h4>
                      <button
                        type="button"
                        @click="addItem"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-royal-gold-700 bg-royal-gold-100 hover:bg-royal-gold-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                      >
                        <PlusIcon class="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>

                    <div class="space-y-4">
                      <div v-for="(item, index) in form.items" :key="index" class="border border-gray-200 rounded-lg p-4">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
                          <div class="sm:col-span-2">
                            <label class="block text-sm font-medium text-gray-700">Item *</label>
                            <select
                              v-model="item.inventory_item_id"
                              required
                              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                              @change="updateItemDetails(index)"
                            >
                              <option value="">Select Item</option>
                              <option v-for="invItem in inventoryItems" :key="invItem.id" :value="invItem.id">
                                {{ invItem.name }} ({{ invItem.item_code }})
                              </option>
                            </select>
                          </div>

                          <div>
                            <label class="block text-sm font-medium text-gray-700">Quantity *</label>
                            <input
                              v-model.number="item.quantity_ordered"
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                              @input="calculateItemTotal(index)"
                            />
                            <p class="text-xs text-gray-500 mt-1">{{ getItemUnit(item.inventory_item_id) }}</p>
                          </div>

                          <div>
                            <label class="block text-sm font-medium text-gray-700">Unit Price (₦) *</label>
                            <input
                              v-model.number="item.unit_price"
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                              @input="calculateItemTotal(index)"
                            />
                          </div>
                        </div>

                        <div class="flex items-center justify-between mt-4">
                          <div class="text-sm text-gray-600">
                            Total: ₦{{ formatCurrency(item.total_price || 0) }}
                          </div>
                          <button
                            type="button"
                            @click="removeItem(index)"
                            class="text-red-600 hover:text-red-800 text-sm"
                          >
                            <TrashIcon class="h-4 w-4" />
                          </button>
                        </div>

                        <div class="mt-3">
                          <label class="block text-sm font-medium text-gray-700">Notes</label>
                          <input
                            v-model="item.notes"
                            type="text"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                            placeholder="Optional notes for this item"
                          />
                        </div>
                      </div>
                    </div>

                    <div v-if="form.items.length === 0" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ShoppingCartIcon class="mx-auto h-12 w-12 text-gray-400" />
                      <h3 class="mt-2 text-sm font-medium text-gray-900">No items added</h3>
                      <p class="mt-1 text-sm text-gray-500">Get started by adding your first item.</p>
                      <div class="mt-6">
                        <button
                          type="button"
                          @click="addItem"
                          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-gold-600 hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                        >
                          <PlusIcon class="h-4 w-4 mr-2" />
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Order Summary -->
                  <div v-if="form.items.length > 0" class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Order Summary</h4>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₦{{ formatCurrency(orderSubtotal) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Tax:</span>
                        <span>₦{{ formatCurrency(form.tax_amount) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Shipping:</span>
                        <span>₦{{ formatCurrency(form.shipping_cost) }}</span>
                      </div>
                      <div class="flex justify-between font-medium text-base border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span>₦{{ formatCurrency(orderTotal) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Details -->
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Tax Amount (₦)</label>
                      <input
                        v-model.number="form.tax_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        @input="calculateTotal"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Shipping Cost (₦)</label>
                      <input
                        v-model.number="form.shipping_cost"
                        type="number"
                        step="0.01"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        @input="calculateTotal"
                      />
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      v-model="form.notes"
                      rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      placeholder="Additional notes or special instructions..."
                    />
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
                    :disabled="loading || form.items.length === 0"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-royal-gold-600 border border-transparent rounded-md shadow-sm hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500 disabled:opacity-50"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                    <span v-else>
                      Create Purchase Order
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
import { XMarkIcon, PlusIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  suppliers: {
    type: Array,
    default: () => []
  },
  inventoryItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const { profile } = useAuth()

const loading = ref(false)

const form = ref({
  supplier_id: '',
  expected_delivery_date: '',
  tax_amount: 0,
  shipping_cost: 0,
  notes: '',
  items: []
})

const orderSubtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.total_price || 0), 0)
})

const orderTotal = computed(() => {
  return orderSubtotal.value + (form.value.tax_amount || 0) + (form.value.shipping_cost || 0)
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const addItem = () => {
  form.value.items.push({
    inventory_item_id: '',
    quantity_ordered: 1,
    unit_price: 0,
    total_price: 0,
    notes: ''
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
  calculateTotal()
}

const updateItemDetails = (index) => {
  const item = form.value.items[index]
  const inventoryItem = props.inventoryItems.find(inv => inv.id === item.inventory_item_id)
  
  if (inventoryItem) {
    item.unit_price = inventoryItem.unit_cost || 0
    calculateItemTotal(index)
  }
}

const calculateItemTotal = (index) => {
  const item = form.value.items[index]
  item.total_price = (item.quantity_ordered || 0) * (item.unit_price || 0)
  calculateTotal()
}

const calculateTotal = () => {
  // This will trigger the computed properties to recalculate
}

const getItemUnit = (inventoryItemId) => {
  const item = props.inventoryItems.find(inv => inv.id === inventoryItemId)
  return item ? item.unit_of_measure : ''
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    form.value = {
      supplier_id: '',
      expected_delivery_date: '',
      tax_amount: 0,
      shipping_cost: 0,
      notes: '',
      items: []
    }
  }
})

const handleSubmit = async () => {
  if (form.value.items.length === 0) {
    alert('Please add at least one item to the purchase order')
    return
  }

  if (!profile.value?.id) {
    alert('Your user profile is not loaded. Please refresh the page and try again.')
    return
  }

  loading.value = true
  
  try {
    const orderData = {
      ...form.value,
      subtotal: orderSubtotal.value,
      total_amount: orderTotal.value,
      status: 'draft',
      created_by: profile.value.id
    }
    
    const { data } = await $fetch('/api/purchase-orders', {
      method: 'POST',
      body: orderData
    })
    
    emit('saved', data)
  } catch (error) {
    console.error('Error creating purchase order:', error)
    alert('Failed to create purchase order. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
