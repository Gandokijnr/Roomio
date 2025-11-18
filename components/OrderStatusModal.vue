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
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Update Order Status
                </DialogTitle>
                <button
                  type="button"
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div v-if="order" class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">Order</p>
                  <p class="text-base font-medium text-gray-900">
                    {{ order.order_number }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatOrderType(order.order_type) }} · {{ formatLocation(order) }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500 mb-1">Current Status</p>
                  <p class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusPillClass(order.order_status)">
                    {{ formatStatus(order.order_status) }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    v-model="newStatus"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                  >
                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <p class="text-xs text-gray-500">
                  Status changes will be reflected immediately in the restaurant operations dashboard.
                </p>
              </div>

              <div v-else class="text-center py-8 text-sm text-gray-500">
                No order selected.
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="!order || newStatus === order.order_status || loading"
                  @click="handleUpdate"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-royal-gold-600 border border-transparent rounded-md shadow-sm hover:bg-royal-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500 disabled:opacity-50"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                  <span v-else>Update Status</span>
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

const loading = ref(false)
const newStatus = ref('pending')

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'served', label: 'Served' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.order) {
      newStatus.value = props.order.order_status || 'pending'
    }
  }
)

const formatOrderType = (type) => {
  const types = {
    dine_in: 'Dine In',
    room_service: 'Room Service',
    takeaway: 'Takeaway',
    delivery: 'Delivery'
  }
  return types[type] || type
}

const formatLocation = (order) => {
  if (!order) return ''
  if (order.table_number) return `Table ${order.table_number}`
  if (order.room_number) return `Room ${order.room_number}`
  return 'Takeaway / Other'
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

const handleUpdate = async () => {
  if (!props.order) return
  if (newStatus.value === props.order.order_status) return

  loading.value = true
  try {
    await $fetch(`/api/restaurant/orders/${props.order.id}`, {
      method: 'PATCH',
      body: {
        order_status: newStatus.value
      }
    })

    emit('updated')
  } catch (error) {
    console.error('Error updating order status:', error)
    alert('Failed to update order status. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
