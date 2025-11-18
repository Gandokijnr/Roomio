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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="flex items-center justify-between mb-6">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      Adjust Stock - {{ item?.name }}
                    </DialogTitle>
                    <button
                      type="button"
                      @click="$emit('close')"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>

                  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-700">Current Stock:</span>
                        <span class="ml-2 text-gray-900">{{ item?.current_stock }} {{ item?.unit_of_measure }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Minimum Stock:</span>
                        <span class="ml-2 text-gray-900">{{ item?.minimum_stock }} {{ item?.unit_of_measure }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Adjustment Type *</label>
                      <select
                        v-model="form.transaction_type"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="adjustment">Stock Adjustment</option>
                        <option value="waste">Waste/Spoilage</option>
                        <option value="return">Return to Supplier</option>
                        <option value="transfer">Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Adjustment Quantity *</label>
                      <div class="mt-1 relative rounded-md shadow-sm">
                        <input
                          v-model.number="form.quantity"
                          type="number"
                          step="0.01"
                          required
                          class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm pr-12"
                          placeholder="0.00"
                        />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">{{ item?.unit_of_measure }}</span>
                        </div>
                      </div>
                      <p class="mt-1 text-xs text-gray-500">
                        Use positive numbers to add stock, negative numbers to reduce stock
                      </p>
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
                      <label class="block text-sm font-medium text-gray-700">Reason/Notes</label>
                      <textarea
                        v-model="form.notes"
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Enter reason for adjustment..."
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Batch Number</label>
                      <input
                        v-model="form.batch_number"
                        type="text"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Optional batch number"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input
                        v-model="form.expiry_date"
                        type="date"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <!-- Preview of changes -->
                  <div v-if="form.quantity" class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 class="text-sm font-medium text-blue-900 mb-2">Preview Changes</h4>
                    <div class="text-sm text-blue-800">
                      <div class="flex justify-between">
                        <span>Current Stock:</span>
                        <span>{{ item?.current_stock }} {{ item?.unit_of_measure }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Adjustment:</span>
                        <span :class="form.quantity >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ form.quantity >= 0 ? '+' : '' }}{{ form.quantity }} {{ item?.unit_of_measure }}
                        </span>
                      </div>
                      <div class="flex justify-between font-medium border-t border-blue-200 pt-2 mt-2">
                        <span>New Stock:</span>
                        <span>{{ (item?.current_stock || 0) + (form.quantity || 0) }} {{ item?.unit_of_measure }}</span>
                      </div>
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
                      Processing...
                    </span>
                    <span v-else>
                      Adjust Stock
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
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const { profile } = useAuth()

const loading = ref(false)

const form = ref({
  transaction_type: '',
  quantity: null,
  unit_cost: 0,
  notes: '',
  batch_number: '',
  expiry_date: ''
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    form.value = {
      transaction_type: '',
      quantity: null,
      unit_cost: props.item?.unit_cost || 0,
      notes: '',
      batch_number: '',
      expiry_date: ''
    }
  }
})

const handleSubmit = async () => {
  if (!form.value.quantity) {
    alert('Please enter an adjustment quantity')
    return
  }

  if (!profile.value?.id) {
    alert('Your user profile is not loaded. Please refresh the page and try again.')
    return
  }

  loading.value = true
  
  try {
    const transactionData = {
      transaction_type: form.value.transaction_type,
      inventory_item_id: props.item.id,
      quantity: form.value.quantity,
      unit_cost: form.value.unit_cost,
      total_cost: Math.abs(form.value.quantity) * form.value.unit_cost,
      stock_before: props.item.current_stock,
      stock_after: props.item.current_stock + form.value.quantity,
      notes: form.value.notes,
      batch_number: form.value.batch_number,
      expiry_date: form.value.expiry_date || null,
      reference_type: 'manual_adjustment',
      processed_by: profile.value?.id
    }
    
    const { data } = await $fetch('/api/inventory/transactions', {
      method: 'POST',
      body: transactionData
    })
    
    emit('saved', data)
  } catch (error) {
    console.error('Error adjusting stock:', error)
    alert('Failed to adjust stock. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
