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
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Order Details
                </DialogTitle>
                <button
                  type="button"
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div v-if="order" class="space-y-6">
                <!-- Basic info -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Order Number</p>
                    <p class="text-base font-medium text-gray-900">{{ order.order_number }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Status</p>
                    <p class="text-base font-medium" :class="getStatusClass(order.order_status)">
                      {{ formatStatus(order.order_status) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Type</p>
                    <p class="text-base font-medium text-gray-900">
                      {{ formatOrderType(order.order_type) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">When</p>
                    <p class="text-base font-medium text-gray-900">
                      {{ formatDateTime(order.order_time) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p class="text-base font-medium text-gray-900">
                      <span v-if="order.table_number">Table {{ order.table_number }}</span>
                      <span v-else-if="order.room_number">Room {{ order.room_number }}</span>
                      <span v-else>Takeaway / Other</span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Customer</p>
                    <p class="text-base font-medium text-gray-900">
                      <span v-if="order.guest">
                        {{ order.guest.first_name }} {{ order.guest.last_name }}
                      </span>
                      <span v-else>Walk-in Customer</span>
                    </p>
                  </div>
                </div>

                <!-- Items -->
                <div>
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Items</h4>
                  <div v-if="order.items && order.items.length" class="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    <div
                      v-for="item in order.items"
                      :key="item.id"
                      class="p-3 flex justify-between items-start gap-4"
                    >
                      <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{ item.menu_item?.name || 'Menu Item' }}
                        </p>
                        <p v-if="item.modifications" class="text-xs text-gray-500 mt-1">
                          {{ item.modifications }}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">
                          Status: {{ item.item_status || 'n/a' }}
                        </p>
                      </div>
                      <div class="text-right text-sm text-gray-900">
                        <div>{{ item.quantity }} × ₦{{ formatCurrency(item.unit_price) }}</div>
                        <div class="font-medium">₦{{ formatCurrency(item.total_price) }}</div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-sm text-gray-500">No items found on this order.</p>
                </div>

                <!-- Totals -->
                <div class="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1 text-sm text-gray-700">
                    <div class="flex justify-between">
                      <span>Subtotal</span>
                      <span>₦{{ formatCurrency(order.subtotal || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Tax</span>
                      <span>₦{{ formatCurrency(order.tax_amount || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Service Charge</span>
                      <span>₦{{ formatCurrency(order.service_charge || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Discount</span>
                      <span>-₦{{ formatCurrency(order.discount_amount || 0) }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col justify-between items-end">
                    <div>
                      <p class="text-sm text-gray-500">Total Amount</p>
                      <p class="text-xl font-semibold text-gray-900">₦{{ formatCurrency(order.total_amount || 0) }}</p>
                    </div>
                    <div class="mt-4">
                      <p class="text-xs text-gray-500">Payment Status</p>
                      <p class="text-sm font-medium text-gray-900">
                        {{ (order.payment_status || 'pending').toUpperCase() }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="order.special_instructions || order.customer_notes" class="border-t border-gray-200 pt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p v-if="order.special_instructions" class="text-sm text-gray-700 mb-1">
                    <span class="font-medium">Kitchen:</span>
                    {{ order.special_instructions }}
                  </p>
                  <p v-if="order.customer_notes" class="text-sm text-gray-700">
                    <span class="font-medium">Customer:</span>
                    {{ order.customer_notes }}
                  </p>
                </div>
              </div>

              <div v-else class="text-center py-10 text-sm text-gray-500">
                No order selected.
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                >
                  Close
                </button>
              </div>
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
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
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

const getStatusClass = (status) => {
  const classes = {
    pending: 'text-yellow-700',
    confirmed: 'text-blue-700',
    preparing: 'text-orange-700',
    ready: 'text-green-700',
    served: 'text-gray-700',
    completed: 'text-green-700',
    cancelled: 'text-red-700'
  }
  return classes[status] || 'text-gray-700'
}
</script>
