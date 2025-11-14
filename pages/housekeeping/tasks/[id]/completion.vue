<template>
  <div class="completion-report-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading completion report...
    </div>

    <div v-else-if="!task || !completion" class="error-state">
      <div class="error-icon">📋</div>
      <h2>Report Not Found</h2>
      <p>The completion report for this task could not be found.</p>
      <button @click="$router.push('/housekeeping')" class="btn btn-primary">
        Back to Housekeeping
      </button>
    </div>

    <div v-else class="report-content">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button @click="$router.back()" class="back-button">
            ← Back
          </button>
          <div class="header-info">
            <h1>Completion Report</h1>
            <p class="subtitle">{{ task.title }} - Room {{ task.room?.room_number }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="printReport" class="btn btn-secondary">
            🖨️ Print Report
          </button>
          <button @click="exportReport" class="btn btn-primary">
            📄 Export PDF
          </button>
        </div>
      </div>

      <!-- Report Summary -->
      <div class="report-summary">
        <div class="summary-card">
          <div class="summary-icon success">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="summary-content">
            <h3>Task Completed Successfully</h3>
            <p>Completed on {{ formatDateTime(task.completed_at) }}</p>
          </div>
        </div>

        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{{ task.actual_duration || 'N/A' }} min</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Quality Rating</span>
            <span class="stat-value">
              <div class="rating-display">
                <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= (completion.quality_rating || 0) }">
                  ⭐
                </span>
                <span class="rating-text">{{ completion.quality_rating || 'N/A' }}/5</span>
              </div>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed By</span>
            <span class="stat-value">{{ task.assigned_housekeeper?.full_name || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <!-- Detailed Report -->
      <div class="report-grid">
        <!-- Task Information -->
        <div class="report-section">
          <div class="card">
            <h3>Task Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Task ID</label>
                <span class="monospace">{{ task.id.substring(0, 8) }}...</span>
              </div>
              <div class="info-item">
                <label>Room</label>
                <span>{{ task.room?.room_number }} - {{ task.room?.room_type }}</span>
              </div>
              <div class="info-item">
                <label>Task Type</label>
                <span class="capitalize">{{ task.task_type }}</span>
              </div>
              <div class="info-item">
                <label>Priority</label>
                <span :class="getPriorityColor(task.priority)">{{ task.priority.toUpperCase() }}</span>
              </div>
              <div class="info-item">
                <label>Scheduled Date</label>
                <span>{{ formatDateTime(task.scheduled_date) }}</span>
              </div>
              <div class="info-item">
                <label>Estimated Duration</label>
                <span>{{ task.estimated_duration || 'N/A' }} minutes</span>
              </div>
            </div>

            <div v-if="task.description" class="description-section">
              <label>Task Description</label>
              <p>{{ task.description }}</p>
            </div>

            <div v-if="task.special_instructions" class="instructions-section">
              <label>Special Instructions</label>
              <div class="instruction-box">
                <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <p>{{ task.special_instructions }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Details -->
        <div class="report-section">
          <div class="card">
            <h3>Completion Details</h3>
            
            <!-- Timeline -->
            <div class="completion-timeline">
              <div class="timeline-item">
                <div class="timeline-marker completed"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Created</span>
                  <span class="timeline-date">{{ formatDateTime(task.created_at) }}</span>
                </div>
              </div>
              
              <div v-if="task.assigned_to" class="timeline-item">
                <div class="timeline-marker completed"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Assigned to {{ task.assigned_housekeeper?.full_name }}</span>
                  <span class="timeline-date">{{ formatDateTime(task.updated_at) }}</span>
                </div>
              </div>
              
              <div v-if="task.started_at" class="timeline-item">
                <div class="timeline-marker completed"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Started</span>
                  <span class="timeline-date">{{ formatDateTime(task.started_at) }}</span>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-marker completed"></div>
                <div class="timeline-content">
                  <span class="timeline-title">Task Completed</span>
                  <span class="timeline-date">{{ formatDateTime(task.completed_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-metrics">
              <h4>Performance Metrics</h4>
              <div class="metrics-grid">
                <div class="metric-item">
                  <label>Time Efficiency</label>
                  <div class="metric-value">
                    <span class="metric-number">{{ timeEfficiency }}%</span>
                    <span :class="['metric-indicator', timeEfficiencyClass]">
                      {{ timeEfficiencyText }}
                    </span>
                  </div>
                </div>
                <div class="metric-item">
                  <label>Quality Score</label>
                  <div class="metric-value">
                    <span class="metric-number">{{ qualityScore }}%</span>
                    <span :class="['metric-indicator', qualityScoreClass]">
                      {{ qualityScoreText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist Results -->
        <div v-if="checklist && completion.completed_items" class="report-section full-width">
          <div class="card">
            <h3>Checklist Results</h3>
            <div class="checklist-summary-stats">
              <div class="summary-stat">
                <span class="stat-number">{{ completion.completed_items.length }}</span>
                <span class="stat-label">Items Completed</span>
              </div>
              <div class="summary-stat">
                <span class="stat-number">{{ checklist.checklist_items.length }}</span>
                <span class="stat-label">Total Items</span>
              </div>
              <div class="summary-stat">
                <span class="stat-number">{{ checklistCompletionRate }}%</span>
                <span class="stat-label">Completion Rate</span>
              </div>
            </div>

            <div class="checklist-items">
              <div 
                v-for="item in checklist.checklist_items" 
                :key="item.id"
                class="checklist-item"
                :class="{ completed: completion.completed_items.includes(item.id) }"
              >
                <div class="item-status">
                  <svg v-if="completion.completed_items.includes(item.id)" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm2 6a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-title">{{ item.task }}</span>
                  <span class="item-type" :class="{ required: item.required }">
                    {{ item.required ? 'Required' : 'Optional' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Notes -->
        <div v-if="completion.completion_notes" class="report-section full-width">
          <div class="card">
            <h3>Completion Notes</h3>
            <div class="notes-content">
              <p>{{ completion.completion_notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Footer -->
      <div class="report-footer">
        <div class="footer-info">
          <p>Report generated on {{ formatDateTime(new Date().toISOString()) }}</p>
          <p>Task ID: {{ task.id }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HousekeepingTask, HousekeepingTaskCompletion, HousekeepingChecklist } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const route = useRoute()
const { $supabase } = useNuxtApp()

const loading = ref(true)
const task = ref<HousekeepingTask | null>(null)
const completion = ref<HousekeepingTaskCompletion | null>(null)
const checklist = ref<HousekeepingChecklist | null>(null)

const loadCompletionReport = async () => {
  try {
    loading.value = true
    const taskId = route.params.id as string

    // Load task details
    const { data: taskData, error: taskError } = await $supabase
      .from('housekeeping_tasks')
      .select(`
        *,
        room:rooms(*),
        assigned_housekeeper:profiles!assigned_to(id, full_name, email)
      `)
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError
    task.value = taskData

    // Load completion details
    const { data: completionData, error: completionError } = await $supabase
      .from('housekeeping_task_completions')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (completionError) throw completionError
    completion.value = completionData

    // Load checklist if available
    if (completionData.checklist_id) {
      const { data: checklistData } = await $supabase
        .from('housekeeping_checklists')
        .select('*')
        .eq('id', completionData.checklist_id)
        .single()

      checklist.value = checklistData
    }
  } catch (error) {
    console.error('Error loading completion report:', error)
  } finally {
    loading.value = false
  }
}

// Computed properties
const timeEfficiency = computed(() => {
  if (!task.value?.estimated_duration || !task.value?.actual_duration) return 0
  return Math.round((task.value.estimated_duration / task.value.actual_duration) * 100)
})

const timeEfficiencyClass = computed(() => {
  const efficiency = timeEfficiency.value
  if (efficiency >= 100) return 'excellent'
  if (efficiency >= 80) return 'good'
  if (efficiency >= 60) return 'average'
  return 'poor'
})

const timeEfficiencyText = computed(() => {
  const efficiency = timeEfficiency.value
  if (efficiency >= 100) return 'Excellent'
  if (efficiency >= 80) return 'Good'
  if (efficiency >= 60) return 'Average'
  return 'Needs Improvement'
})

const qualityScore = computed(() => {
  if (!completion.value?.quality_rating) return 0
  return (completion.value.quality_rating / 5) * 100
})

const qualityScoreClass = computed(() => {
  const score = qualityScore.value
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
})

const qualityScoreText = computed(() => {
  const score = qualityScore.value
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Needs Improvement'
})

const checklistCompletionRate = computed(() => {
  if (!checklist.value || !completion.value?.completed_items) return 0
  return Math.round((completion.value.completed_items.length / checklist.value.checklist_items.length) * 100)
})

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

const printReport = () => {
  window.print()
}

const exportReport = () => {
  // TODO: Implement PDF export
  console.log('PDF export functionality to be implemented')
}

onMounted(() => {
  loadCompletionReport()
})
</script>

<style scoped>
.completion-report-page {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.header-actions {
  display: flex;
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
}

.btn-primary {
  background: #d4af37;
  color: white;
}

.btn-primary:hover {
  background: #b8931f;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.report-summary {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon.success {
  background: #d1fae5;
  color: #065f46;
}

.summary-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.summary-content p {
  color: #6b7280;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.rating-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.star {
  font-size: 1rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.report-section.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #1f2937;
}

.monospace {
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.capitalize {
  text-transform: capitalize;
}

.description-section, .instructions-section {
  margin-top: 1rem;
}

.description-section label, .instructions-section label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.description-section p {
  color: #374151;
  line-height: 1.6;
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

.completion-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  background: #10b981;
  margin-top: 0.125rem;
  flex-shrink: 0;
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

.performance-metrics h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.metric-item label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.metric-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.metric-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.metric-indicator.excellent {
  background: #d1fae5;
  color: #065f46;
}

.metric-indicator.good {
  background: #dbeafe;
  color: #1e40af;
}

.metric-indicator.average {
  background: #fef3c7;
  color: #92400e;
}

.metric-indicator.poor {
  background: #fee2e2;
  color: #991b1b;
}

.checklist-summary-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.summary-stat {
  text-align: center;
}

.summary-stat .stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.summary-stat .stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.checklist-item.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.item-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-weight: 500;
  color: #1f2937;
}

.item-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
  color: #6b7280;
}

.item-type.required {
  background: #fee2e2;
  color: #991b1b;
}

.notes-content {
  background: #f9fafb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.notes-content p {
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.report-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.footer-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

@media print {
  .page-header .header-actions {
    display: none;
  }
  
  .back-button {
    display: none;
  }
}
</style>
