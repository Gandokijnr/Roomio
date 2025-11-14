<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1>Invitation System Analytics</h1>
      <p>Track performance and conversion metrics for your access request system</p>
    </div>

    <div v-if="loading" class="loading">Loading analytics...</div>

    <div v-else class="analytics-content">
      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">📊</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.totalRequests }}</div>
            <div class="metric-label">Total Requests</div>
            <div class="metric-change" :class="metrics.requestsChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.requestsChange >= 0 ? '+' : '' }}{{ metrics.requestsChange }}% this week
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.approvalRate }}%</div>
            <div class="metric-label">Approval Rate</div>
            <div class="metric-change">
              {{ metrics.approved }} of {{ metrics.totalRequests }} approved
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🔗</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.invitationsSent }}</div>
            <div class="metric-label">Invitations Sent</div>
            <div class="metric-change">
              {{ metrics.invitationRate }}% of approved requests
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.signupRate }}%</div>
            <div class="metric-label">Signup Conversion</div>
            <div class="metric-change">
              {{ metrics.completedSignups }} signups completed
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.avgResponseTime }}h</div>
            <div class="metric-label">Avg Response Time</div>
            <div class="metric-change">
              Time to approve requests
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🏨</div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.avgRoomCount }}</div>
            <div class="metric-label">Avg Hotel Size</div>
            <div class="metric-change">
              Rooms per request
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Requests Over Time</h3>
          <div class="chart-container">
            <div class="chart-bars">
              <div v-for="(day, index) in chartData.requestsOverTime" :key="index" class="chart-bar">
                <div class="bar" :style="{ height: `${(day.count / chartData.maxRequests) * 100}%` }"></div>
                <div class="bar-label">{{ day.label }}</div>
                <div class="bar-value">{{ day.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Request Status Distribution</h3>
          <div class="status-chart">
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill pending" :style="{ width: `${statusDistribution.pending}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Pending</span>
                <span class="status-count">{{ metrics.pending }} ({{ statusDistribution.pending }}%)</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill approved" :style="{ width: `${statusDistribution.approved}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Approved</span>
                <span class="status-count">{{ metrics.approved }} ({{ statusDistribution.approved }}%)</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div class="status-fill rejected" :style="{ width: `${statusDistribution.rejected}%` }"></div>
              </div>
              <div class="status-info">
                <span class="status-label">Rejected</span>
                <span class="status-count">{{ metrics.rejected }} ({{ statusDistribution.rejected }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hotel Size Analysis -->
      <div class="analysis-grid">
        <div class="analysis-card">
          <h3>Hotel Size Distribution</h3>
          <div class="size-distribution">
            <div v-for="size in hotelSizes" :key="size.range" class="size-item">
              <div class="size-label">{{ size.range }}</div>
              <div class="size-bar">
                <div class="size-fill" :style="{ width: `${size.percentage}%` }"></div>
              </div>
              <div class="size-count">{{ size.count }} hotels</div>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">{{ activity.icon }}</div>
              <div class="activity-info">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export and Actions -->
      <div class="actions-section">
        <div class="actions-card">
          <h3>Export & Actions</h3>
          <div class="actions-grid">
            <button @click="exportData('csv')" class="action-btn">
              📊 Export CSV
            </button>
            <button @click="exportData('json')" class="action-btn">
              📄 Export JSON
            </button>
            <button @click="refreshData" class="action-btn primary">
              🔄 Refresh Data
            </button>
            <button @click="generateReport" class="action-btn">
              📈 Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const metrics = ref({
  totalRequests: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  approvalRate: 0,
  invitationsSent: 0,
  invitationRate: 0,
  completedSignups: 0,
  signupRate: 0,
  avgResponseTime: 0,
  avgRoomCount: 0,
  requestsChange: 0
})

const chartData = ref({
  requestsOverTime: [] as Array<{ label: string; count: number }>,
  maxRequests: 0
})

const hotelSizes = ref([
  { range: '1-25 rooms', count: 0, percentage: 0 },
  { range: '26-50 rooms', count: 0, percentage: 0 },
  { range: '51-100 rooms', count: 0, percentage: 0 },
  { range: '100+ rooms', count: 0, percentage: 0 }
])

const recentActivity = ref<Array<{
  id: string
  type: string
  icon: string
  text: string
  timestamp: string
}>>([])

const statusDistribution = computed(() => {
  const total = metrics.value.totalRequests || 1
  return {
    pending: Math.round((metrics.value.pending / total) * 100),
    approved: Math.round((metrics.value.approved / total) * 100),
    rejected: Math.round((metrics.value.rejected / total) * 100)
  }
})

const loadAnalytics = async () => {
  try {
    loading.value = true

    // Get all demo requests
    const { data: requests, error } = await $supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading analytics:', error)
      return
    }

    const allRequests = requests || []
    
    // Calculate basic metrics
    metrics.value.totalRequests = allRequests.length
    metrics.value.pending = allRequests.filter(r => r.status === 'pending').length
    metrics.value.approved = allRequests.filter(r => r.status === 'approved').length
    metrics.value.rejected = allRequests.filter(r => r.status === 'rejected').length
    
    metrics.value.approvalRate = metrics.value.totalRequests > 0 
      ? Math.round((metrics.value.approved / metrics.value.totalRequests) * 100)
      : 0

    metrics.value.invitationsSent = allRequests.filter(r => r.invitation_sent_at).length
    metrics.value.invitationRate = metrics.value.approved > 0
      ? Math.round((metrics.value.invitationsSent / metrics.value.approved) * 100)
      : 0

    // Calculate signup conversion (this would need user account data)
    metrics.value.completedSignups = allRequests.filter(r => r.status === 'completed').length
    metrics.value.signupRate = metrics.value.invitationsSent > 0
      ? Math.round((metrics.value.completedSignups / metrics.value.invitationsSent) * 100)
      : 0

    // Calculate average response time
    const approvedRequests = allRequests.filter(r => r.status === 'approved' && r.updated_at)
    if (approvedRequests.length > 0) {
      const totalResponseTime = approvedRequests.reduce((sum, request) => {
        const created = new Date(request.created_at).getTime()
        const updated = new Date(request.updated_at).getTime()
        return sum + (updated - created)
      }, 0)
      metrics.value.avgResponseTime = Math.round(totalResponseTime / approvedRequests.length / (1000 * 60 * 60))
    }

    // Calculate average room count
    const roomCounts = allRequests.map(r => {
      const count = r.room_count
      if (count === '1-25') return 12.5
      if (count === '26-50') return 38
      if (count === '51-100') return 75
      if (count === '100+') return 150
      return 0
    })
    metrics.value.avgRoomCount = roomCounts.length > 0
      ? Math.round(roomCounts.reduce((sum, count) => sum + count, 0) / roomCounts.length)
      : 0

    // Generate chart data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    chartData.value.requestsOverTime = last7Days.map(date => {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const count = allRequests.filter(r => {
        const requestDate = new Date(r.created_at)
        return requestDate >= dayStart && requestDate <= dayEnd
      }).length

      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      }
    })

    chartData.value.maxRequests = Math.max(...chartData.value.requestsOverTime.map(d => d.count), 1)

    // Calculate hotel size distribution
    const sizeMap = {
      '1-25': 0,
      '26-50': 0,
      '51-100': 0,
      '100+': 0
    }

    allRequests.forEach(request => {
      if (sizeMap.hasOwnProperty(request.room_count)) {
        sizeMap[request.room_count as keyof typeof sizeMap]++
      }
    })

    hotelSizes.value = [
      { range: '1-25 rooms', count: sizeMap['1-25'], percentage: 0 },
      { range: '26-50 rooms', count: sizeMap['26-50'], percentage: 0 },
      { range: '51-100 rooms', count: sizeMap['51-100'], percentage: 0 },
      { range: '100+ rooms', count: sizeMap['100+'], percentage: 0 }
    ]

    const totalHotels = Object.values(sizeMap).reduce((sum, count) => sum + count, 0)
    if (totalHotels > 0) {
      hotelSizes.value.forEach(size => {
        size.percentage = Math.round((size.count / totalHotels) * 100)
      })
    }

    // Generate recent activity
    recentActivity.value = allRequests
      .slice(0, 10)
      .map(request => ({
        id: request.id,
        type: request.status,
        icon: request.status === 'pending' ? '📋' : request.status === 'approved' ? '✅' : '❌',
        text: `${request.name} from ${request.hotel_name} - ${request.status}`,
        timestamp: request.updated_at || request.created_at
      }))

  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadAnalytics()
}

const exportData = async (format: 'csv' | 'json') => {
  try {
    const { data: requests } = await $supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!requests) return

    if (format === 'csv') {
      const csv = [
        'Name,Email,Hotel,Room Count,Status,Created,Updated',
        ...requests.map(r => 
          `"${r.name}","${r.email}","${r.hotel_name}","${r.room_count}","${r.status}","${r.created_at}","${r.updated_at || ''}"`
        )
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `demo-requests-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } else {
      const json = JSON.stringify(requests, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `demo-requests-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  }
}

const generateReport = () => {
  const report = `
Roomio Invitation System Report
Generated: ${new Date().toLocaleString()}

KEY METRICS:
- Total Requests: ${metrics.value.totalRequests}
- Approval Rate: ${metrics.value.approvalRate}%
- Invitation Conversion: ${metrics.value.invitationRate}%
- Signup Conversion: ${metrics.value.signupRate}%
- Average Response Time: ${metrics.value.avgResponseTime} hours
- Average Hotel Size: ${metrics.value.avgRoomCount} rooms

STATUS BREAKDOWN:
- Pending: ${metrics.value.pending}
- Approved: ${metrics.value.approved}
- Rejected: ${metrics.value.rejected}

HOTEL SIZE DISTRIBUTION:
${hotelSizes.value.map(size => `- ${size.range}: ${size.count} (${size.percentage}%)`).join('\n')}
  `

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roomio-report-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.analytics-page {
  max-width: 1400px;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.75rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #059669;
}

.metric-change.negative {
  color: #dc2626;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: end;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  width: 100%;
  min-height: 4px;
  transition: all 0.3s ease;
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 0.25rem;
}

.status-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.status-fill.pending {
  background: #f59e0b;
}

.status-fill.approved {
  background: #10b981;
}

.status-fill.rejected {
  background: #ef4444;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.status-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.analysis-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analysis-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.size-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.size-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 100px;
}

.size-bar {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.size-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.size-count {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 80px;
  text-align: right;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.activity-icon {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
}

.activity-text {
  font-size: 0.875rem;
  color: #374151;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.actions-section {
  margin-top: 2rem;
}

.actions-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover {
  background: #2563eb;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid,
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
