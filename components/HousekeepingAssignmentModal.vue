<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">
          Assign Housekeeping Task
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
          <!-- Task Details -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Task Details</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Room:</span>
                <span class="ml-2 font-medium">{{ task.room?.room_number }}</span>
              </div>
              <div>
                <span class="text-gray-600">Type:</span>
                <span class="ml-2 font-medium capitalize">{{ task.task_type }}</span>
              </div>
              <div>
                <span class="text-gray-600">Priority:</span>
                <span class="ml-2" :class="getPriorityColor(task.priority)">
                  {{ task.priority.toUpperCase() }}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Estimated Duration:</span>
                <span class="ml-2 font-medium">{{ task.estimated_duration || 30 }} minutes</span>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-gray-600">Description:</span>
              <p class="mt-1 text-gray-900">{{ task.description }}</p>
            </div>
            <div v-if="task.special_instructions" class="mt-3">
              <span class="text-gray-600">Special Instructions:</span>
              <p class="mt-1 text-orange-700 bg-orange-50 p-2 rounded">{{ task.special_instructions }}</p>
            </div>
          </div>

          <!-- Housekeeper Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign to Housekeeper
            </label>
            <select
              v-model="selectedHousekeeper"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            >
              <option value="">Select a housekeeper...</option>
              <option
                v-for="housekeeper in availableHousekeepers"
                :key="housekeeper.id"
                :value="housekeeper.id"
              >
                {{ housekeeper.full_name }} 
                <span v-if="housekeeper.active_tasks_count > 0" class="text-gray-500">
                  ({{ housekeeper.active_tasks_count }} active tasks)
                </span>
              </option>
            </select>
          </div>

          <!-- Assignment Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea
              v-model="assignmentNotes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any specific instructions or notes for the housekeeper..."
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Assignment Failed</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 p-6 border-t bg-gray-50">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          @click="assignTask"
          :disabled="!selectedHousekeeper || loading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Assigning...
          </span>
          <span v-else>Assign Task</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, Profile } from '~/types/database'

interface Props {
  isOpen: boolean
  task: HousekeepingTask | null
}

interface Emits {
  (e: 'close'): void
  (e: 'assigned', taskId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $supabase } = useNuxtApp()

const loading = ref(false)
const error = ref('')
const selectedHousekeeper = ref('')
const assignmentNotes = ref('')
const availableHousekeepers = ref<Array<Profile & { active_tasks_count: number }>>([])

// Load available housekeepers when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadAvailableHousekeepers()
    resetForm()
  }
})

const resetForm = () => {
  selectedHousekeeper.value = ''
  assignmentNotes.value = ''
  error.value = ''
}

const loadAvailableHousekeepers = async () => {
  try {
    const { data, error: fetchError } = await $supabase
      .rpc('get_available_housekeepers')

    if (fetchError) throw fetchError
    availableHousekeepers.value = data || []
  } catch (err) {
    console.error('Error loading housekeepers:', err)
    error.value = 'Failed to load available housekeepers'
  }
}

const assignTask = async () => {
  if (!props.task || !selectedHousekeeper.value) return

  try {
    loading.value = true
    error.value = ''

    // Call the assignment function
    const { data, error: assignError } = await $supabase
      .rpc('assign_housekeeping_task', {
        task_id_param: props.task.id,
        housekeeper_id_param: selectedHousekeeper.value
      })

    if (assignError) throw assignError

    if (!data.success) {
      throw new Error(data.message)
    }

    // Add assignment notes if provided
    if (assignmentNotes.value.trim()) {
      await $supabase
        .from('housekeeping_task_logs')
        .insert({
          task_id: props.task.id,
          action: 'assignment_notes',
          notes: assignmentNotes.value.trim(),
          logged_by: selectedHousekeeper.value
        })
    }

    emit('assigned', props.task.id)
    closeModal()
  } catch (err: any) {
    console.error('Error assigning task:', err)
    error.value = err.message || 'Failed to assign task'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
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
