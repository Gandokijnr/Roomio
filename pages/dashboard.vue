<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Overview of hotel operations</p>
    </div>

    <div v-if="loading" class="loading">Loading dashboard...</div>

    <div v-else class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--primary-100); color: var(--primary-600);">🏨</div>
          <div class="stat-info">
            <div class="stat-label">Total Rooms</div>
            <div class="stat-value">{{ stats.totalRooms }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--success-50); color: var(--success-600);">✅</div>
          <div class="stat-info">
            <div class="stat-label">Available Rooms</div>
            <div class="stat-value">{{ stats.availableRooms }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--warning-50); color: var(--warning-600);">🔑</div>
          <div class="stat-info">
            <div class="stat-label">Occupied Rooms</div>
            <div class="stat-value">{{ stats.occupiedRooms }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--primary-100); color: var(--primary-600);">📅</div>
          <div class="stat-info">
            <div class="stat-label">Today's Check-ins</div>
            <div class="stat-value">{{ stats.todayCheckIns }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--neutral-100); color: var(--neutral-600);">📤</div>
          <div class="stat-info">
            <div class="stat-label">Today's Check-outs</div>
            <div class="stat-value">{{ stats.todayCheckOuts }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background: var(--success-50); color: var(--success-600);">💰</div>
          <div class="stat-info">
            <div class="stat-label">Occupancy Rate</div>
            <div class="stat-value">{{ stats.occupancyRate }}%</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card room-status-card">
          <h3>Room Status Overview</h3>
          <div class="room-status-list">
            <div class="status-item">
              <span class="badge badge-success">Available</span>
              <span class="status-count">{{ stats.availableRooms }} rooms</span>
            </div>
            <div class="status-item">
              <span class="badge badge-warning">Occupied</span>
              <span class="status-count">{{ stats.occupiedRooms }} rooms</span>
            </div>
            <div class="status-item">
              <span class="badge badge-primary">Reserved</span>
              <span class="status-count">{{ stats.reservedRooms }} rooms</span>
            </div>
            <div class="status-item">
              <span class="badge badge-error">Maintenance</span>
              <span class="status-count">{{ stats.maintenanceRooms }} rooms</span>
            </div>
            <div class="status-item">
              <span class="badge badge-warning">Needs Cleaning</span>
              <span class="status-count">{{ stats.needsCleaningRooms }} rooms</span>
            </div>
            <div class="status-item">
              <span class="badge badge-info">Assigned Housekeeper</span>
              <span class="status-count">{{ stats.assignedHousekeeperRooms }} rooms</span>
            </div>
          </div>
        </div>

        <div class="card recent-reservations-card">
          <h3>Recent Reservations</h3>
          <div v-if="recentReservations.length === 0" class="empty-state">
            No recent reservations
          </div>
          <div v-else class="reservations-list">
            <div v-for="reservation in recentReservations" :key="reservation.id" class="reservation-item">
              <div class="reservation-info">
                <div class="reservation-guest">{{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}</div>
                <div class="reservation-details">
                  Room {{ reservation.room?.room_number }} • {{ reservation.reservation_number }}
                </div>
              </div>
              <span :class="['badge', `badge-${getStatusColor(reservation.status)}`]">
                {{ reservation.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canManageHousekeeping() || hasRole(['housekeeping'])" class="card housekeeping-card">
        <h3>Pending Housekeeping Tasks</h3>
        <div v-if="pendingTasks.length === 0" class="empty-state">
          No pending tasks
        </div>
        <div v-else class="tasks-list">
          <div v-for="task in pendingTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <div class="task-title">{{ task.description }}</div>
              <div class="task-details">Room {{ task.room?.room_number }} • {{ task.task_type }}</div>
            </div>
            <span :class="['badge', `badge-${getPriorityColor(task.priority)}`]">
              {{ task.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reservation, HousekeepingTask, ReservationStatus, TaskPriority } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { hasRole, canManageHousekeeping } = useAuth()

const loading = ref(true)
const stats = ref({
  totalRooms: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  reservedRooms: 0,
  maintenanceRooms: 0,
  cleaningRooms: 0,
  needsCleaningRooms: 0,
  assignedHousekeeperRooms: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  occupancyRate: 0,
})

const recentReservations = ref<Reservation[]>([])
const pendingTasks = ref<HousekeepingTask[]>([])

const loadDashboardData = async () => {
  try {
    loading.value = true

    const today = new Date().toISOString().split('T')[0]

    const [roomsRes, reservationsRes, tasksRes] = await Promise.all([
      $supabase.from('rooms').select('status, is_active'),
      $supabase
        .from('reservations')
        .select('*, guest:guests(*), room:rooms(*)')
        .order('created_at', { ascending: false })
        .limit(5),
      $supabase
        .from('housekeeping_tasks')
        .select('*, room:rooms(*)')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .limit(5),
    ])

    if (roomsRes.data) {
      const activeRooms = roomsRes.data.filter(r => r.is_active)
      stats.value.totalRooms = activeRooms.length
      stats.value.availableRooms = activeRooms.filter(r => r.status === 'available').length
      stats.value.occupiedRooms = activeRooms.filter(r => r.status === 'occupied').length
      stats.value.reservedRooms = activeRooms.filter(r => r.status === 'reserved').length
      stats.value.maintenanceRooms = activeRooms.filter(r => r.status === 'maintenance').length
      stats.value.cleaningRooms = activeRooms.filter(r => r.status === 'cleaning').length
      stats.value.needsCleaningRooms = activeRooms.filter(r => r.status === 'needs_cleaning').length
      stats.value.assignedHousekeeperRooms = activeRooms.filter(r => r.status === 'assigned_housekeeper').length

      if (stats.value.totalRooms > 0) {
        stats.value.occupancyRate = Math.round((stats.value.occupiedRooms / stats.value.totalRooms) * 100)
      }
    }

    if (reservationsRes.data) {
      recentReservations.value = reservationsRes.data

      const { data: checkInsData } = await $supabase
        .from('reservations')
        .select('id')
        .eq('check_in_date', today)
        .in('status', ['confirmed', 'checked_in'])

      const { data: checkOutsData } = await $supabase
        .from('reservations')
        .select('id')
        .eq('check_out_date', today)
        .in('status', ['checked_in', 'checked_out'])

      stats.value.todayCheckIns = checkInsData?.length || 0
      stats.value.todayCheckOuts = checkOutsData?.length || 0
    }

    if (tasksRes.data) {
      pendingTasks.value = tasksRes.data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: ReservationStatus) => {
  const colors: Record<ReservationStatus, string> = {
    pending: 'warning',
    confirmed: 'primary',
    checked_in: 'success',
    checked_out: 'neutral',
    cancelled: 'error',
    no_show: 'error',
  }
  return colors[status] || 'neutral'
}

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    low: 'neutral',
    medium: 'primary',
    high: 'warning',
    urgent: 'error',
  }
  return colors[priority] || 'neutral'
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.page-header {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.813rem;
  color: var(--neutral-600);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.card h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.room-status-card,
.recent-reservations-card,
.housekeeping-card {
  padding: 0;
}

.room-status-list,
.reservations-list,
.tasks-list {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.status-item,
.reservation-item,
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  transition: background 0.2s ease;
}

.status-item:hover,
.reservation-item:hover,
.task-item:hover {
  background: var(--neutral-100);
}

.status-count {
  font-weight: 500;
  color: var(--neutral-700);
  font-size: 0.875rem;
}

.reservation-info,
.task-info {
  flex: 1;
  min-width: 0;
}

.reservation-guest,
.task-title {
  font-weight: 500;
  color: var(--neutral-900);
  font-size: 0.938rem;
  margin-bottom: 4px;
}

.reservation-details,
.task-details {
  font-size: 0.813rem;
  color: var(--neutral-600);
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--neutral-500);
  font-size: 0.875rem;
}
</style>
