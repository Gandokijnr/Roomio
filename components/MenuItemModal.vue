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
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
            >
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="flex items-center justify-between mb-6">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      {{ isEdit ? 'Edit Menu Item' : 'Add New Menu Item' }}
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
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Menu item name"
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

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        v-model="form.category_id"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="">Select Category</option>
                        <option
                          v-for="category in categories"
                          :key="category.id"
                          :value="category.id"
                        >
                          {{ category.name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Item Type *</label>
                      <select
                        v-model="form.item_type"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      >
                        <option value="food">Food</option>
                        <option value="beverage">Beverage</option>
                        <option value="combo">Combo</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Base Price (₦) *</label>
                      <input
                        v-model.number="form.base_price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Cost Price (₦)</label>
                      <input
                        v-model.number="form.cost_price"
                        type="number"
                        min="0"
                        step="0.01"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        v-model="form.description"
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                        placeholder="Short description of the item"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
                      <input
                        v-model.number="form.preparation_time"
                        type="number"
                        min="0"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-royal-gold-500 focus:border-royal-gold-500 sm:text-sm"
                      />
                    </div>

                    <div class="flex items-center mt-2 space-x-4">
                      <label class="inline-flex items-center">
                        <input
                          v-model="form.is_available"
                          type="checkbox"
                          class="h-4 w-4 text-royal-gold-600 focus:ring-royal-gold-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 text-sm text-gray-700">Available</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input
                          v-model="form.is_featured"
                          type="checkbox"
                          class="h-4 w-4 text-royal-gold-600 focus:ring-royal-gold-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 text-sm text-gray-700">Featured</span>
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
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const isEdit = computed(() => !!props.item)

const createDefaultForm = () => ({
  name: '',
  item_code: '',
  description: '',
  category_id: '',
  base_price: 0,
  cost_price: 0,
  item_type: 'food',
  preparation_time: 15,
  is_available: true,
  is_featured: false
})

const form = ref(createDefaultForm())

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      Object.keys(form.value).forEach((key) => {
        if (newItem[key] !== undefined) {
          form.value[key] = newItem[key]
        }
      })
    } else {
      form.value = createDefaultForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen && !props.item) {
      form.value = createDefaultForm()
    }
  }
)

const handleSubmit = async () => {
  loading.value = true

  try {
    const url = isEdit.value
      ? `/api/restaurant/menu-items/${props.item.id}`
      : '/api/restaurant/menu-items'
    const method = isEdit.value ? 'PATCH' : 'POST'

    const { data } = await $fetch(url, {
      method,
      body: form.value
    })

    emit('saved', data)
  } catch (error) {
    console.error('Error saving menu item:', error)
    alert('Failed to save menu item. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
