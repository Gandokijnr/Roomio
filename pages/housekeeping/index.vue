<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          {{ isHousekeeper ? 'My Tasks' : 'Housekeeping Management' }}
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          {{ isHousekeeper ? 'Your assigned cleaning and maintenance tasks' : 'Manage all housekeeping tasks and assignments' }}
        </p>
      </div>
      <div class="flex w-full sm:w-auto justify-end">
        <button 
          v-if="!isHousekeeper"
          @click="loadTasks" 
          class="btn btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Task Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
      <div class="card p-4 sm:p-5 text-center">
        <div class="text-2xl font-semibold text-neutral-900 mb-1">
          {{ taskStats.pending }}
        </div>
        <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          Pending Tasks
        </div>
      </div>
      <div class="card p-4 sm:p-5 text-center">
        <div class="text-2xl font-semibold text-neutral-900 mb-1">
          {{ taskStats.in_progress }}
        </div>
        <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          In Progress
        </div>
      </div>
      <div class="card p-4 sm:p-5 text-center">
        <div class="text-2xl font-semibold text-neutral-900 mb-1">
          {{ taskStats.completed_today }}
        </div>
        <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          Completed Today
        </div>
      </div>
      <div
        v-if="!isHousekeeper"
        class="card p-4 sm:p-5 text-center"
      >
        <div class="text-2xl font-semibold text-neutral-900 mb-1">
          {{ taskStats.needs_assignment }}
        </div>
        <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          Needs Assignment
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2 mb-6 border-b border-neutral-200">
      <button 
        v-for="filter in filterOptions" 
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-3 py-2 text-sm font-medium border-b-2"
        :class="activeFilter === filter.value
          ? 'border-primary-500 text-primary-700 bg-white'
          : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'"
      >
        {{ filter.label }} ({{ getFilterCount(filter.value) }})
      </button>
    </div>

    <div v-if="loading" class="py-12 flex flex-col items-center gap-3 text-neutral-600 text-sm">
      <div class="w-8 h-8 border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin"></div>
      <span>Loading tasks...</span>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="py-12 text-center text-neutral-600">
      <div class="text-4xl mb-3">📋</div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-1">
        No tasks found
      </h3>
      <p class="text-sm">
        {{ getEmptyMessage() }}
      </p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="card overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <div class="flex gap-2">
            <span :class="['badge', `badge-${getPriorityColor(task.priority)}`]">
              {{ task.priority.toUpperCase() }}
            </span>
            <span :class="['badge', `badge-${getStatusColor(task.status)}`]">
              {{ formatStatus(task.status) }}
            </span>
          </div>
          <div class="flex gap-1">
            <button 
              v-if="!isHousekeeper && task.status === 'pending'"
              @click="openAssignmentModal(task)"
              class="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-neutral-100 text-neutral-600"
              title="Assign to housekeeper"
            >
              👤
            </button>
            <button 
              @click="openTaskDetails(task)"
              class="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-neutral-100 text-neutral-600"
              title="View details"
            >
              👁️
            </button>
          </div>
        </div>

        <div class="px-4 pb-4">
          <h3 class="text-base font-semibold text-neutral-900 mb-2">
            {{ task.title }}
          </h3>
          <div class="flex flex-wrap gap-3 mb-3 text-sm">
            <span class="font-semibold text-primary-600">
              Room {{ task.room?.room_number }}
            </span>
            <span class="text-neutral-600 capitalize">
              {{ task.task_type }}
            </span>
          </div>
          
          <p class="text-sm text-neutral-800 leading-relaxed mb-3">
            {{ task.description }}
          </p>
          
          <div
            v-if="task.special_instructions"
            class="bg-amber-50 border border-amber-400 rounded-md px-3 py-2 mb-3 text-sm text-amber-900"
          >
            <strong>⚠️ Special Instructions:</strong>
            <p class="mt-1">{{ task.special_instructions }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700 mb-4">
            <div class="flex flex-col">
              <span class="text-neutral-500 font-medium">Scheduled:</span>
              <span>{{ formatDateTime(task.scheduled_date) }}</span>
            </div>
            <div v-if="task.estimated_duration" class="flex flex-col">
              <span class="text-neutral-500 font-medium">Duration:</span>
              <span>{{ task.estimated_duration }} min</span>
            </div>
            <div v-if="task.assigned_housekeeper" class="flex flex-col">
              <span class="text-neutral-500 font-medium">Assigned to:</span>
              <span>{{ task.assigned_housekeeper.full_name }}</span>
            </div>
            <div v-if="task.started_at" class="flex flex-col">
              <span class="text-neutral-500 font-medium">Started:</span>
              <span>{{ formatDateTime(task.started_at) }}</span>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          <!-- Housekeeper Actions -->
          <div
            v-if="isHousekeeper && task.assigned_to === user?.id"
            class="flex justify-end gap-2"
          >
            <button 
              v-if="task.status === 'pending'"
              @click="startTask(task)"
              class="btn btn-primary btn-sm"
            >
              🚀 Start Cleaning
            </button>
            <button 
              v-else-if="task.status === 'in_progress'"
              @click="openCleaningWorkflow(task)"
              class="btn btn-success btn-sm"
            >
              ✅ Complete Task
            </button>
          </div>

          <!-- Manager Actions -->
          <div
            v-else-if="!isHousekeeper"
            class="flex justify-end gap-2"
          >
            <button 
              v-if="task.status === 'pending' && !task.assigned_to"
              @click="openAssignmentModal(task)"
              class="btn btn-primary btn-sm"
            >
              👤 Assign
            </button>
            <button 
              v-if="task.status === 'completed'"
              @click="viewTaskCompletion(task)"
              class="btn btn-secondary btn-sm"
            >
              📋 View Report
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <HousekeepingAssignmentModal
      :is-open="showAssignmentModal"
      :task="selectedTask"
      @close="closeAssignmentModal"
      @assigned="handleTaskAssigned"
    />

    <!-- Cleaning Workflow Modal -->
    <CleaningWorkflowModal
      :is-open="showCleaningModal"
      :task="selectedTask"
      @close="closeCleaningModal"
      @completed="handleTaskCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, TaskPriority, TaskStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { user, hasRole } = useAuth()

const loading = ref(true)
const tasks = ref<HousekeepingTask[]>([])
const activeFilter = ref('all')
const showAssignmentModal = ref(false)
const showCleaningModal = ref(false)
const selectedTask = ref<HousekeepingTask | null>(null)

// Check if current user is a housekeeper
const isHousekeeper = computed(() => hasRole(['housekeeping']))

// Filter options based on user role
const filterOptions = computed(() => {
  const baseOptions = [
    { label: 'All Tasks', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }
  ]

  if (!isHousekeeper.value) {
    baseOptions.splice(1, 0, { label: 'Needs Assignment', value: 'needs_assignment' })
  }

  return baseOptions
})

// Task statistics
const taskStats = computed(() => {
  const today = new Date().toDateString()
  
  return {
    pending: tasks.value.filter(t => t.status === 'pending').length,
    in_progress: tasks.value.filter(t => t.status === 'in_progress').length,
    completed_today: tasks.value.filter(t => 
      t.status === 'completed' && 
      t.completed_at && 
      new Date(t.completed_at).toDateString() === today
    ).length,
    needs_assignment: tasks.value.filter(t => t.status === 'pending' && !t.assigned_to).length
  }
})

// Filtered tasks based on active filter and user role
const filteredTasks = computed(() => {
  let filtered = tasks.value

  // If housekeeper, only show their assigned tasks
  if (isHousekeeper.value) {
    filtered = filtered.filter(task => task.assigned_to === user.value?.id)
  }

  // Apply status filter
  switch (activeFilter.value) {
    case 'pending':
      return filtered.filter(t => t.status === 'pending')
    case 'in_progress':
      return filtered.filter(t => t.status === 'in_progress')
    case 'completed':
      return filtered.filter(t => t.status === 'completed')
    case 'needs_assignment':
      return filtered.filter(t => t.status === 'pending' && !t.assigned_to)
    default:
      return filtered
  }
})

const loadTasks = async () => {
  try {
    loading.value = true
    
    let query = $supabase
      .from('housekeeping_tasks')
      .select(`
        *,
        room:rooms(*),
        assigned_housekeeper:profiles!assigned_to(id, full_name, email)
      `)
      .order('scheduled_date', { ascending: false })

    // If housekeeper, only load their tasks
    if (isHousekeeper.value) {
      query = query.eq('assigned_to', user.value?.id)
    }

    const { data, error } = await query

    if (error) throw error
    tasks.value = data || []
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
}

const getFilterCount = (filterValue: string) => {
  switch (filterValue) {
    case 'pending':
      return taskStats.value.pending
    case 'in_progress':
      return taskStats.value.in_progress
    case 'completed':
      return taskStats.value.completed_today
    case 'needs_assignment':
      return taskStats.value.needs_assignment
    default:
      return filteredTasks.value.length
  }
}

const getEmptyMessage = () => {
  if (isHousekeeper.value) {
    return activeFilter.value === 'pending' 
      ? 'No pending tasks assigned to you'
      : 'No tasks found for the selected filter'
  }
  return activeFilter.value === 'needs_assignment'
    ? 'All tasks have been assigned'
    : 'No tasks found for the selected filter'
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleString()
}

const formatStatus = (status: TaskStatus) => {
  const labels: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    urgent: 'error'
  }
  return colors[priority]
}

const getStatusColor = (status: TaskStatus) => {
  const colors: Record<TaskStatus, string> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'neutral'
  }
  return colors[status]
}

// Modal handlers
const openAssignmentModal = (task: HousekeepingTask) => {
  selectedTask.value = task
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedTask.value = null
}

const openCleaningModal = (task: HousekeepingTask) => {
  selectedTask.value = task
  showCleaningModal.value = true
}

const closeCleaningModal = () => {
  showCleaningModal.value = false
  selectedTask.value = null
}

const openTaskDetails = (task: HousekeepingTask) => {
  // Navigate to task detail page or open detail modal
  navigateTo(`/housekeeping/tasks/${task.id}`)
}

// Task actions
const startTask = async (task: HousekeepingTask) => {
  try {
    const { error } = await $supabase
      .from('housekeeping_tasks')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', task.id)

    if (error) throw error
    await loadTasks()
  } catch (error) {
    console.error('Error starting task:', error)
  }
}

const openCleaningWorkflow = (task: HousekeepingTask) => {
  openCleaningModal(task)
}

const viewTaskCompletion = (task: HousekeepingTask) => {
  // Navigate to completion report or open modal
  navigateTo(`/housekeeping/tasks/${task.id}/completion`)
}

// Event handlers
const handleTaskAssigned = (taskId: string) => {
  loadTasks()
}

const handleTaskCompleted = (taskId: string) => {
  loadTasks()
}

onMounted(() => {
  loadTasks()
})
</script>
