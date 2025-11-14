<template>
  <div class="task-detail-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading task details...
    </div>

    <div v-else-if="!task" class="error-state">
      <div class="error-icon">❌</div>
      <h2>Task Not Found</h2>
      <p>The requested housekeeping task could not be found.</p>
      <button @click="$router.push('/housekeeping')" class="btn btn-primary">
        Back to Housekeeping
      </button>
    </div>

    <div v-else class="task-detail-content">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button @click="$router.back()" class="back-button">
            ← Back
          </button>
          <div class="header-info">
            <h1>{{ task.title }}</h1>
            <div class="task-meta">
              <span class="room-badge">Room {{ task.room?.room_number }}</span>
              <span :class="['status-badge', `status-${task.status}`]">
                {{ formatStatus(task.status) }}
              </span>
              <span :class="['priority-badge', `priority-${task.priority}`]">
                {{ task.priority.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Information -->
      <div class="content-grid">
        <div class="main-content">
          <!-- Task Details Card -->
          <div class="card">
            <h3>Task Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Task Type</label>
                <span class="capitalize">{{ task.task_type }}</span>
              </div>
              <div class="detail-item">
                <label>Priority</label>
                <span :class="getPriorityColor(task.priority)">{{ task.priority.toUpperCase() }}</span>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span :class="getStatusColor(task.status)">{{ formatStatus(task.status) }}</span>
              </div>
              <div class="detail-item">
                <label>Room</label>
                <span>{{ task.room?.room_number }} - {{ task.room?.room_type }}</span>
              </div>
              <div class="detail-item">
                <label>Scheduled Date</label>
                <span>{{ formatDateTime(task.scheduled_date) }}</span>
              </div>
              <div v-if="task.estimated_duration" class="detail-item">
                <label>Estimated Duration</label>
                <span>{{ task.estimated_duration }} minutes</span>
              </div>
            </div>

            <div v-if="task.description" class="description">
              <label>Description</label>
              <p>{{ task.description }}</p>
            </div>

            <div v-if="task.special_instructions" class="special-instructions">
              <label>Special Instructions</label>
              <div class="instruction-box">
                <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <p>{{ task.special_instructions }}</p>
              </div>
            </div>
          </div>

          <!-- Assignment & Progress Card -->
          <div class="card">
            <h3>Assignment & Progress</h3>
            <div class="detail-grid">
              <div v-if="task.assigned_housekeeper" class="detail-item">
                <label>Assigned To</label>
                <span>{{ task.assigned_housekeeper.full_name }}</span>
              </div>
              <div v-if="task.started_at" class="detail-item">
                <label>Started At</label>
                <span>{{ formatDateTime(task.started_at) }}</span>
              </div>
              <div v-if="task.completed_at" class="detail-item">
                <label>Completed At</label>
                <span>{{ formatDateTime(task.completed_at) }}</span>
              </div>
              <div v-if="task.actual_duration" class="detail-item">
                <label>Actual Duration</label>
                <span>{{ task.actual_duration }} minutes</span>
              </div>
            </div>
          </div>

          <!-- Completion Report (if completed) -->
          <div v-if="task.status === 'completed' && completion" class="card">
            <h3>Completion Report</h3>
            
            <div v-if="completion.quality_rating" class="quality-rating">
              <label>Quality Rating</label>
              <div class="rating-stars">
                <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= completion.quality_rating }">
                  ⭐
                </span>
                <span class="rating-text">{{ completion.quality_rating }}/5</span>
              </div>
            </div>

            <div v-if="completion.completion_notes" class="completion-notes">
              <label>Completion Notes</label>
              <p>{{ completion.completion_notes }}</p>
            </div>

            <div v-if="completion.completed_items && completion.completed_items.length > 0" class="checklist-summary">
              <label>Checklist Items Completed</label>
              <div class="checklist-items">
                <div v-for="itemId in completion.completed_items" :key="itemId" class="checklist-item">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span>Checklist item completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Actions Card -->
          <div class="card">
            <h3>Actions</h3>
            <div class="action-buttons">
              <button 
                v-if="task.status === 'pending' && !task.assigned_to && canManageHousekeeping()"
                @click="openAssignmentModal"
                class="btn btn-primary"
              >
                👤 Assign Task
              </button>
              
              <button 
                v-if="task.status === 'completed'"
                @click="viewCompletionReport"
                class="btn btn-secondary"
              >
                📋 View Full Report
              </button>
              
              <button 
                v-if="task.status !== 'completed' && canManageHousekeeping()"
                @click="editTask"
                class="btn btn-secondary"
              >
                ✏️ Edit Task
              </button>
            </div>
          </div>

          <!-- Task Timeline -->
          <div class="card">
            <h3>Task Timeline</h3>
            <div class="timeline">
              <div class="timeline-item completed">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Created</span>
                  <span class="timeline-date">{{ formatDateTime(task.created_at) }}</span>
                </div>
              </div>
              
              <div v-if="task.assigned_to" class="timeline-item completed">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Assigned to {{ task.assigned_housekeeper?.full_name }}</span>
                  <span class="timeline-date">{{ formatDateTime(task.updated_at) }}</span>
                </div>
              </div>
              
              <div v-if="task.started_at" class="timeline-item completed">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Started</span>
                  <span class="timeline-date">{{ formatDateTime(task.started_at) }}</span>
                </div>
              </div>
              
              <div v-if="task.completed_at" class="timeline-item completed">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Completed</span>
                  <span class="timeline-date">{{ formatDateTime(task.completed_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <HousekeepingAssignmentModal
      :is-open="showAssignmentModal"
      :task="task"
      @close="closeAssignmentModal"
      @assigned="handleTaskAssigned"
    />
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, HousekeepingTaskCompletion } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const route = useRoute()
const { $supabase } = useNuxtApp()
const { canManageHousekeeping } = useAuth()

const loading = ref(true)
const task = ref<HousekeepingTask | null>(null)
const completion = ref<HousekeepingTaskCompletion | null>(null)
const showAssignmentModal = ref(false)

const loadTask = async () => {
  try {
    loading.value = true
    const taskId = route.params.id as string

    const { data, error } = await $supabase
      .from('housekeeping_tasks')
      .select(`
        *,
        room:rooms(*),
        assigned_housekeeper:profiles!assigned_to(id, full_name, email)
      `)
      .eq('id', taskId)
      .single()

    if (error) throw error
    task.value = data

    // Load completion report if task is completed
    if (data.status === 'completed') {
      const { data: completionData } = await $supabase
        .from('housekeeping_task_completions')
        .select('*')
        .eq('task_id', taskId)
        .single()

      completion.value = completionData
    }
  } catch (error) {
    console.error('Error loading task:', error)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleString()
}

const formatStatus = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
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

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'text-yellow-600 font-medium',
    in_progress: 'text-blue-600 font-medium',
    completed: 'text-green-600 font-medium',
    cancelled: 'text-gray-600 font-medium'
  }
  return colors[status as keyof typeof colors] || 'text-gray-600'
}

const openAssignmentModal = () => {
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
}

const handleTaskAssigned = () => {
  loadTask()
}

const viewCompletionReport = () => {
  navigateTo(`/housekeeping/tasks/${task.value?.id}/completion`)
}

const editTask = () => {
  // TODO: Implement task editing
  console.log('Edit task functionality to be implemented')
}

onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.task-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 4rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.back-button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background: #e5e7eb;
}

.header-info h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.room-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-in_progress { background: #dbeafe; color: #1e40af; }
.status-completed { background: #d1fae5; color: #065f46; }
.status-cancelled { background: #f3f4f6; color: #374151; }

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.priority-low { background: #d1fae5; color: #065f46; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fed7aa; color: #9a3412; }
.priority-urgent { background: #fee2e2; color: #991b1b; }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-item span {
  color: #1f2937;
}

.description, .completion-notes {
  margin-top: 1rem;
}

.description label, .completion-notes label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.description p, .completion-notes p {
  color: #374151;
  line-height: 1.6;
}

.special-instructions {
  margin-top: 1rem;
}

.special-instructions label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.instruction-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  padding: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.instruction-box p {
  color: #92400e;
  margin: 0;
}

.quality-rating {
  margin-bottom: 1rem;
}

.quality-rating label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star {
  font-size: 1.25rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  margin-left: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.checklist-summary label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.timeline-marker {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #d1d5db;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.timeline-item.completed .timeline-marker {
  background: #10b981;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.timeline-date {
  color: #6b7280;
  font-size: 0.75rem;
}

.capitalize {
  text-transform: capitalize;
}
</style>
