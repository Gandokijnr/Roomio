<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">
          Complete Cleaning Task - Room {{ task?.room?.room_number }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div v-if="task" class="space-y-6">
          <!-- Task Overview -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-medium text-blue-900 mb-2">Task Overview</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700">Task Type:</span>
                <span class="ml-2 font-medium capitalize">{{ task.task_type }}</span>
              </div>
              <div>
                <span class="text-blue-700">Priority:</span>
                <span class="ml-2" :class="getPriorityColor(task.priority)">
                  {{ task.priority.toUpperCase() }}
                </span>
              </div>
              <div>
                <span class="text-blue-700">Started:</span>
                <span class="ml-2 font-medium">{{ formatDateTime(task.started_at) }}</span>
              </div>
              <div>
                <span class="text-blue-700">Estimated Duration:</span>
                <span class="ml-2 font-medium">{{ task.estimated_duration || 30 }} minutes</span>
              </div>
            </div>
            <div v-if="task.special_instructions" class="mt-3">
              <span class="text-blue-700">Special Instructions:</span>
              <p class="mt-1 text-orange-700 bg-orange-50 p-2 rounded">{{ task.special_instructions }}</p>
            </div>
          </div>

          <!-- Cleaning Checklist -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Cleaning Checklist</h3>
            
            <div v-if="loadingChecklist" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-gray-600">Loading checklist...</p>
            </div>

            <div v-else-if="checklist" class="space-y-3">
              <div 
                v-for="(item, index) in checklist.checklist_items" 
                :key="item.id"
                class="flex items-start space-x-3 p-3 border rounded-lg"
                :class="completedItems.includes(item.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'"
              >
                <input
                  type="checkbox"
                  :id="`item-${item.id}`"
                  v-model="completedItems"
                  :value="item.id"
                  class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div class="flex-1">
                  <label 
                    :for="`item-${item.id}`" 
                    class="text-sm font-medium text-gray-900 cursor-pointer"
                    :class="completedItems.includes(item.id) ? 'line-through text-green-700' : ''"
                  >
                    {{ item.task }}
                  </label>
                  <div class="flex items-center mt-1">
                    <span 
                      class="text-xs px-2 py-1 rounded"
                      :class="item.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ item.required ? 'Required' : 'Optional' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <p>No checklist available for this task type.</p>
            </div>
          </div>

          <!-- Progress Summary -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Progress Summary</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Total Items:</span>
                <span class="ml-2 font-medium">{{ totalItems }}</span>
              </div>
              <div>
                <span class="text-gray-600">Completed:</span>
                <span class="ml-2 font-medium text-green-600">{{ completedItems.length }}</span>
              </div>
              <div>
                <span class="text-gray-600">Required Completed:</span>
                <span class="ml-2 font-medium" :class="allRequiredCompleted ? 'text-green-600' : 'text-red-600'">
                  {{ completedRequiredItems }}/{{ totalRequiredItems }}
                </span>
              </div>
            </div>
            <div class="mt-3">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span>{{ Math.round(completionPercentage) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${completionPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Completion Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes
            </label>
            <textarea
              v-model="completionNotes"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about the cleaning process, issues found, or special observations..."
            ></textarea>
          </div>

          <!-- Quality Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quality Rating (Optional)
            </label>
            <div class="flex space-x-2">
              <button
                v-for="rating in 5"
                :key="rating"
                @click="qualityRating = rating"
                class="p-2 text-2xl transition-colors"
                :class="rating <= qualityRating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ⭐
              </button>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              Rate the overall quality of the cleaning (1-5 stars)
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Completion Failed</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center p-6 border-t bg-gray-50">
        <div class="text-sm text-gray-600">
          <span v-if="!allRequiredCompleted" class="text-red-600">
            ⚠️ Please complete all required items before finishing
          </span>
          <span v-else class="text-green-600">
            ✅ All required items completed
          </span>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            @click="completeTask"
            :disabled="!allRequiredCompleted || loading"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing...
            </span>
            <span v-else>✅ Complete Task</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, HousekeepingChecklist, ChecklistItem } from '~/types/database'

interface Props {
  isOpen: boolean
  task: HousekeepingTask | null
}

interface Emits {
  (e: 'close'): void
  (e: 'completed', taskId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $supabase } = useNuxtApp()

const loading = ref(false)
const loadingChecklist = ref(false)
const error = ref('')
const checklist = ref<HousekeepingChecklist | null>(null)
const completedItems = ref<string[]>([])
const completionNotes = ref('')
const qualityRating = ref(0)

// Load checklist when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.task) {
    loadChecklist()
    resetForm()
  }
})

const resetForm = () => {
  completedItems.value = []
  completionNotes.value = ''
  qualityRating.value = 0
  error.value = ''
}

const loadChecklist = async () => {
  if (!props.task) return

  try {
    loadingChecklist.value = true
    
    // Load checklist based on task type and room type
    const { data, error: fetchError } = await $supabase
      .from('housekeeping_checklists')
      .select('*')
      .eq('task_type', props.task.task_type)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    checklist.value = data || null
  } catch (err) {
    console.error('Error loading checklist:', err)
    // Don't show error for missing checklist, it's optional
  } finally {
    loadingChecklist.value = false
  }
}

// Computed properties
const totalItems = computed(() => {
  return checklist.value?.checklist_items?.length || 0
})

const totalRequiredItems = computed(() => {
  return checklist.value?.checklist_items?.filter(item => item.required)?.length || 0
})

const completedRequiredItems = computed(() => {
  if (!checklist.value) return 0
  return checklist.value.checklist_items
    .filter(item => item.required && completedItems.value.includes(item.id))
    .length
})

const allRequiredCompleted = computed(() => {
  return totalRequiredItems.value === 0 || completedRequiredItems.value === totalRequiredItems.value
})

const completionPercentage = computed(() => {
  if (totalItems.value === 0) return 100
  return (completedItems.value.length / totalItems.value) * 100
})

const completeTask = async () => {
  if (!props.task || !allRequiredCompleted.value) return

  try {
    loading.value = true
    error.value = ''

    // Complete the task using the database function
    const { data, error: completeError } = await $supabase
      .rpc('complete_housekeeping_task', {
        task_id_param: props.task.id,
        completion_notes_param: completionNotes.value.trim() || null,
        quality_rating_param: qualityRating.value || null
      })

    if (completeError) throw completeError

    if (!data.success) {
      throw new Error(data.message)
    }

    // Save checklist completion if checklist was used
    if (checklist.value && completedItems.value.length > 0) {
      await $supabase
        .from('housekeeping_task_completions')
        .insert({
          task_id: props.task.id,
          checklist_id: checklist.value.id,
          completed_items: completedItems.value,
          completion_notes: completionNotes.value.trim() || null,
          quality_rating: qualityRating.value || null
        })
    }

    emit('completed', props.task.id)
    closeModal()
  } catch (err: any) {
    console.error('Error completing task:', err)
    error.value = err.message || 'Failed to complete task'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleString()
}

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'text-green-600 font-medium',
    medium: 'text-yellow-600 font-medium',
    high: 'text-orange-600 font-medium',
    urgent: 'text-red-600 font-bold'
  }
  return colors[priority as keyof typeof colors] || 'text-gray-600'
}
</script>
