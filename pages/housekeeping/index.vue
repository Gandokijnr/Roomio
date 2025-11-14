<template>
  <div class="housekeeping-page">
    <div class="page-header">
      <div>
        <h1>{{ isHousekeeper ? 'My Tasks' : 'Housekeeping Management' }}</h1>
        <p>{{ isHousekeeper ? 'Your assigned cleaning and maintenance tasks' : 'Manage all housekeeping tasks and assignments' }}</p>
      </div>
      <div class="header-actions">
        <button 
          v-if="!isHousekeeper"
          @click="loadTasks" 
          class="btn btn-secondary"
          :disabled="loading"
        >
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Task Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.pending }}</div>
        <div class="stat-label">Pending Tasks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.in_progress }}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.completed_today }}</div>
        <div class="stat-label">Completed Today</div>
      </div>
      <div v-if="!isHousekeeper" class="stat-card">
        <div class="stat-number">{{ taskStats.needs_assignment }}</div>
        <div class="stat-label">Needs Assignment</div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="filter in filterOptions" 
        :key="filter.value"
        @click="activeFilter = filter.value"
        :class="['filter-tab', { active: activeFilter === filter.value }]"
      >
        {{ filter.label }} ({{ getFilterCount(filter.value) }})
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading tasks...
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No tasks found</h3>
      <p>{{ getEmptyMessage() }}</p>
    </div>

    <div v-else class="tasks-grid">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <div class="task-badges">
            <span :class="['badge', `badge-${getPriorityColor(task.priority)}`]">
              {{ task.priority.toUpperCase() }}
            </span>
            <span :class="['badge', `badge-${getStatusColor(task.status)}`]">
              {{ formatStatus(task.status) }}
            </span>
          </div>
          <div class="task-actions">
            <button 
              v-if="!isHousekeeper && task.status === 'pending'"
              @click="openAssignmentModal(task)"
              class="btn-icon"
              title="Assign to housekeeper"
            >
              👤
            </button>
            <button 
              @click="openTaskDetails(task)"
              class="btn-icon"
              title="View details"
            >
              👁️
            </button>
          </div>
        </div>

        <div class="task-content">
          <h3>{{ task.title }}</h3>
          <div class="room-info">
            <span class="room-number">Room {{ task.room?.room_number }}</span>
            <span class="task-type">{{ task.task_type }}</span>
          </div>
          
          <p class="task-description">{{ task.description }}</p>
          
          <div v-if="task.special_instructions" class="special-instructions">
            <strong>⚠️ Special Instructions:</strong>
            <p>{{ task.special_instructions }}</p>
          </div>

          <div class="task-meta">
            <div class="meta-item">
              <span class="meta-label">Scheduled:</span>
              <span>{{ formatDateTime(task.scheduled_date) }}</span>
            </div>
            <div v-if="task.estimated_duration" class="meta-item">
              <span class="meta-label">Duration:</span>
              <span>{{ task.estimated_duration }} min</span>
            </div>
            <div v-if="task.assigned_housekeeper" class="meta-item">
              <span class="meta-label">Assigned to:</span>
              <span>{{ task.assigned_housekeeper.full_name }}</span>
            </div>
            <div v-if="task.started_at" class="meta-item">
              <span class="meta-label">Started:</span>
              <span>{{ formatDateTime(task.started_at) }}</span>
            </div>
          </div>
        </div>

        <div class="task-footer">
          <!-- Housekeeper Actions -->
          <div v-if="isHousekeeper && task.assigned_to === user?.id" class="housekeeper-actions">
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
          <div v-else-if="!isHousekeeper" class="manager-actions">
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

<style scoped>
.housekeeping-page {
  max-width: 1400px;
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
  font-size: 0.938rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: #374151;
}

.filter-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.task-content {
  padding: 0 1rem 1rem;
}

.task-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.room-info {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.room-number {
  font-weight: 600;
  color: #3b82f6;
}

.task-type {
  color: #6b7280;
  text-transform: capitalize;
}

.task-description {
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.special-instructions {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.special-instructions strong {
  color: #92400e;
}

.special-instructions p {
  margin: 0.5rem 0 0;
  color: #92400e;
}

.task-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.813rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  color: #6b7280;
  font-weight: 500;
}

.task-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.housekeeper-actions,
.manager-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.813rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-neutral {
  background: #f3f4f6;
  color: #374151;
}
</style>
