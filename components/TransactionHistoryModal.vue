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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Transaction History - {{ item?.name }}
                </DialogTitle>
                <button
                  type="button"
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {{ error }}
              </div>

              <div class="border rounded-lg overflow-hidden">
                <div class="px-4 py-2 bg-gray-50 flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    Showing latest transactions for this item
                  </div>
                  <button
                    type="button"
                    @click="loadTransactions"
                    class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
                  >
                    <svg
                      v-if="loading"
                      class="animate-spin -ml-1 mr-1 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span v-else class="mr-1">Refresh</span>
                  </button>
                </div>

                <div class="max-h-96 overflow-y-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Before</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock After</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="!loading && transactions.length === 0">
                        <td colspan="6" class="px-4 py-4 text-center text-sm text-gray-500">
                          No transactions found for this item yet.
                        </td>
                      </tr>
                      <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {{ formatDateTime(tx.created_at) }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm">
                          <span :class="getTypeClass(tx.transaction_type)" class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
                            {{ formatType(tx.transaction_type) }}
                          </span>
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-right text-sm" :class="tx.quantity >= 0 ? 'text-green-700' : 'text-red-700'">
                          {{ tx.quantity >= 0 ? '+' : '' }}{{ tx.quantity }} {{ item?.unit_of_measure }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-700">
                          {{ tx.stock_before }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-700">
                          {{ tx.stock_after }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {{ tx.notes || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div v-if="loading" class="py-6 text-center text-sm text-gray-500">
                    Loading transactions...
                  </div>
                </div>
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
  item: {
    type: Object,
    required: true
  }
})

const loading = ref(false)
const error = ref('')
const transactions = ref([])

const loadTransactions = async () => {
  if (!props.item?.id) return

  loading.value = true
  error.value = ''

  try {
    const { data } = await $fetch('/api/inventory/transactions', {
      query: {
        inventory_item_id: props.item.id,
        limit: 50
      }
    })

    transactions.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error loading inventory transactions:', err)
    error.value = 'Failed to load transactions. Please try again.'
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadTransactions()
  }
})

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatType = (type) => {
  const map = {
    purchase: 'Purchase',
    usage: 'Usage',
    adjustment: 'Adjustment',
    waste: 'Waste / Spoilage',
    transfer: 'Transfer',
    return: 'Return'
  }
  return map[type] || type
}

const getTypeClass = (type) => {
  const map = {
    purchase: 'bg-green-100 text-green-800',
    usage: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-purple-100 text-purple-800',
    waste: 'bg-red-100 text-red-800',
    transfer: 'bg-yellow-100 text-yellow-800',
    return: 'bg-gray-100 text-gray-800'
  }
  return map[type] || 'bg-gray-100 text-gray-800'
}
</script>
