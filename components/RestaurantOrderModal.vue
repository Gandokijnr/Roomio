<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <!-- Overlay -->
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

      <!-- Panel -->
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
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
            >
              <form @submit.prevent="handleSubmit">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    New Restaurant Order
                  </DialogTitle>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <!-- Order Type & Location -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Order Type *
                    </label>
                    <select
                      v-model="form.order_type"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                    >
                      <option value="dine_in">Dine In</option>
                      <option value="room_service">Room Service</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>

                  <div v-if="form.order_type === 'dine_in'">
                    <label class="block text-sm font-medium text-gray-700">
                      Table *
                    </label>
                    <select
                      v-model="form.table_id"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                    >
                      <option value="">Select Table</option>
                      <option
                        v-for="t in tables"
                        :key="t.id"
                        :value="t.id"
                      >
                        Table {{ t.table_number }}
                        ({{ t.seating_capacity || 0 }} seats · {{ t.status }})
                      </option>
                    </select>
                  </div>

                  <div v-else-if="form.order_type === 'room_service'">
                    <label class="block text-sm font-medium text-gray-700">
                      Room Number *
                    </label>
                    <input
                      v-model="form.room_number"
                      type="text"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      placeholder="e.g. 204"
                    />
                  </div>

                  <div v-else>
                    <label class="block text-sm font-medium text-gray-700">
                      Reference / Label
                    </label>
                    <input
                      v-model="form.customer_notes"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      placeholder="Customer name or reference (optional)"
                    />
                  </div>
                </div>

                <!-- Items Section -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-medium text-gray-900">
                      Order Items
                    </h4>
                    <button
                      type="button"
                      @click="addItem"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-royal-gold-700 bg-royal-gold-100 hover:bg-royal-gold-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                    >
                      <PlusIcon class="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div class="space-y-4" v-if="form.items.length > 0">
                    <div
                      v-for="(item, index) in form.items"
                      :key="index"
                      class="border border-gray-200 rounded-lg p-4"
                    >
                      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div class="sm:col-span-2">
                          <label class="block text-sm font-medium text-gray-700">
                            Menu Item *
                          </label>
                          <select
                            v-model="item.menu_item_id"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                            @change="updateItemFromMenu(index)"
                          >
                            <option value="">Select Menu Item</option>
                            <option
                              v-for="mi in menuItems"
                              :key="mi.id"
                              :value="mi.id"
                            >
                              {{ mi.name }} - ₦{{ formatCurrency(mi.base_price) }}
                            </option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700">
                            Quantity *
                          </label>
                          <input
                            v-model.number="item.quantity"
                            type="number"
                            min="1"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700">
                            Unit Price (₦) *
                          </label>
                          <input
                            v-model.number="item.unit_price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700">
                          Modifications / Notes
                        </label>
                        <input
                          v-model="item.modifications"
                          type="text"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                          placeholder="e.g. No pepper, extra cheese..."
                        />
                      </div>

                      <div class="flex items-center justify-between mt-3">
                        <p class="text-sm text-gray-600">
                          Line total:
                          <span class="font-medium">
                            ₦{{ formatCurrency(itemLineTotal(item)) }}
                          </span>
                        </p>
                        <button
                          type="button"
                          @click="removeItem(index)"
                          class="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <TrashIcon class="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <ClipboardDocumentListIcon class="mx-auto h-10 w-10 text-gray-400" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No items added</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Get started by adding your first item.
                    </p>
                    <div class="mt-4">
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

                <!-- Summary & Charges -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Special Instructions (Kitchen)
                    </label>
                    <textarea
                      v-model="form.special_instructions"
                      rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      placeholder="e.g. Serve all mains together, birthday plate, etc."
                    />
                  </div>

                  <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₦{{ formatCurrency(orderSubtotal) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <label class="mr-2">Tax (₦):</label>
                      <input
                        v-model.number="form.tax_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-32 border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <label class="mr-2">Service Charge (₦):</label>
                      <input
                        v-model.number="form.service_charge"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-32 border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <label class="mr-2">Discount (₦):</label>
                      <input
                        v-model.number="form.discount_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-32 border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>
                    <div class="flex justify-between text-base font-medium border-t border-gray-200 pt-2 mt-1">
                      <span>Total:</span>
                      <span>₦{{ formatCurrency(orderTotal) }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">
                        Payment Method (optional)
                      </label>
                      <select
                        v-model="form.payment_method"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="room_charge">Room Charge</option>
                        <option value="transfer">Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
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
                      <svg
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                    <span v-else>Create Order</span>
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
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  menuItems: {
    type: Array,
    default: () => []
  },
  tables: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)

const form = ref({
  order_type: 'dine_in',
  table_id: '',
  room_number: '',
  special_instructions: '',
  customer_notes: '',
  tax_amount: 0,
  service_charge: 0,
  discount_amount: 0,
  payment_method: '',
  items: []
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

const itemLineTotal = (item) => {
  return (item.quantity || 0) * (item.unit_price || 0)
}

const orderSubtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + itemLineTotal(item), 0)
})

const orderTotal = computed(() => {
  return (
    orderSubtotal.value +
    (form.value.tax_amount || 0) +
    (form.value.service_charge || 0) -
    (form.value.discount_amount || 0)
  )
})

const addItem = () => {
  form.value.items.push({
    menu_item_id: '',
    quantity: 1,
    unit_price: 0,
    modifications: ''
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const updateItemFromMenu = (index) => {
  const item = form.value.items[index]
  const mi = props.menuItems.find((m) => m.id === item.menu_item_id)
  if (mi) {
    item.unit_price = mi.base_price || 0
  }
}

// Reset form when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      form.value = {
        order_type: 'dine_in',
        table_id: '',
        room_number: '',
        special_instructions: '',
        customer_notes: '',
        tax_amount: 0,
        service_charge: 0,
        discount_amount: 0,
        payment_method: '',
        items: []
      }
      // Pre-add one item for convenience
      addItem()
    }
  }
)

const handleSubmit = async () => {
  if (form.value.items.length === 0) {
    alert('Please add at least one item to the order')
    return
  }

  // Basic validation based on order_type
  if (form.value.order_type === 'dine_in' && !form.value.table_id) {
    alert('Please select a table for dine-in orders')
    return
  }
  if (form.value.order_type === 'room_service' && !form.value.room_number) {
    alert('Please enter a room number for room service orders')
    return
  }

  const selectedTable =
    form.value.order_type === 'dine_in'
      ? props.tables.find((t) => t.id === form.value.table_id)
      : null

  const payload = {
    order_type: form.value.order_type,
    table_number: selectedTable ? selectedTable.table_number : null,
    room_number: form.value.room_number || null,
    special_instructions: form.value.special_instructions || null,
    customer_notes: form.value.customer_notes || null,
    tax_amount: form.value.tax_amount || 0,
    service_charge: form.value.service_charge || 0,
    discount_amount: form.value.discount_amount || 0,
    payment_method: form.value.payment_method || null,
    // Items expected by /api/restaurant/orders.post.ts
    items: form.value.items.map((item) => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      modifications: item.modifications || null
    })),
    // Required by handler (it will recompute internally but field must exist)
    total_amount: orderTotal.value
  }

  loading.value = true
  try {
    const { data } = await $fetch('/api/restaurant/orders', {
      method: 'POST',
      body: payload
    })

    emit('saved', data)
  } catch (error) {
    console.error('Error creating restaurant order:', error)
    alert('Failed to create order. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
