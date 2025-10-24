<template>
  <div class="housekeeping-page">
    <div class="page-header">
      <div>
        <h1>Housekeeping Tasks</h1>
        <p>Manage cleaning and maintenance tasks</p>
      </div>
      <button v-if="canManageHousekeeping()" @click="showCreateModal = true" class="btn btn-primary">
        + Create Task
      </button>
    </div>

    <div v-if="loading" class="loading">Loading tasks...</div>

    <div v-else class="tasks-grid">
      <div v-for="task in tasks" :key="task.id" class="task-card card">
        <div class="task-header">
          <span :class="['badge', `badge-${getPriorityColor(task.priority)}`]">{{ task.priority }}</span>
          <span :class="['badge', `badge-${getStatusColor(task.status)}`]">{{ task.status }}</span>
        </div>
        <h3>Room {{ task.room?.room_number }}</h3>
        <p>{{ task.description }}</p>
        <div class="task-meta">
          <div>Type: {{ task.task_type }}</div>
          <div>Date: {{ formatDate(task.scheduled_date) }}</div>
        </div>
        <button
          v-if="task.status === 'pending' && (canManageHousekeeping() || task.assigned_to === user.id)"
          @click="updateTaskStatus(task.id, 'completed')"
          class="btn btn-success btn-sm"
        >
          Mark Complete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, TaskPriority, TaskStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { user, canManageHousekeeping } = useAuth()

const loading = ref(true)
const tasks = ref<HousekeepingTask[]>([])
const showCreateModal = ref(false)

const loadTasks = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('housekeeping_tasks')
      .select('*, room:rooms(*)')
      .order('scheduled_date', { ascending: false })

    if (error) throw error
    tasks.value = data || []
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    low: 'neutral',
    medium: 'primary',
    high: 'warning',
    urgent: 'error',
  }
  return colors[priority]
}

const getStatusColor = (status: TaskStatus) => {
  const colors: Record<TaskStatus, string> = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'neutral',
  }
  return colors[status]
}

const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  try {
    const { error } = await $supabase
      .from('housekeeping_tasks')
      .update({ status, completed_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) throw error
    await loadTasks()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.housekeeping-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: 2rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.page-header p {
  color: var(--neutral-600);
  font-size: 0.938rem;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.task-card {
  padding: var(--spacing-lg);
}

.task-header {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.task-card h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.task-card p {
  color: var(--neutral-700);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.task-meta {
  font-size: 0.813rem;
  color: var(--neutral-600);
  margin-bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
