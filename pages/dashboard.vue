<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="mb-8 sm:mb-10">
      <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">Dashboard</h1>
      <p class="mt-1 text-sm text-neutral-600">Overview of hotel operations</p>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">Loading dashboard...</div>

    <div v-else class="space-y-8">
      <div class="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--primary-100); color: var(--primary-600);">
🏨</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Total Rooms</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.totalRooms }}</div>
          </div>
        </div>

        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--success-50); color: var(--success-600);">✅</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Available Rooms</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.availableRooms }}</div>
          </div>
        </div>

        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--warning-50); color: var(--warning-600);">🔑</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Occupied Rooms</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.occupiedRooms }}</div>
          </div>
        </div>

        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--primary-100); color: var(--primary-600);">📅</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Today's Check-ins</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.todayCheckIns }}</div>
          </div>
        </div>

        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--neutral-100); color: var(--neutral-600);">📤</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Today's Check-outs</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.todayCheckOuts }}</div>
          </div>
        </div>

        <div class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--success-50); color: var(--success-600);">💰</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Occupancy Rate</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.occupancyRate }}%</div>
          </div>
        </div>

        <!-- F&B Operations Stats -->
        <div v-if="canManageRestaurant() || canManageBar()" class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--warning-50); color: var(--warning-600);">🍽️</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Today's Orders</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.todayOrders }}</div>
          </div>
        </div>

        <div v-if="canManageBar()" class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--info-50); color: var(--info-600);">🍸</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Bar Orders</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.barOrders }}</div>
          </div>
        </div>

        <div v-if="canManageInventory()" class="card flex items-center gap-4 p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style="background: var(--error-50); color: var(--error-600);">📦</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-neutral-600 mb-1">Low Stock Items</div>
            <div class="text-2xl font-bold text-neutral-900">{{ stats.lowStockItems }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card overflow-hidden">
          <h3 class="px-6 py-4 text-base font-semibold text-neutral-900 border-b border-neutral-200">Room Status Overview</h3>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-success">Available</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.availableRooms }} rooms</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-warning">Occupied</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.occupiedRooms }} rooms</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-primary">Reserved</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.reservedRooms }} rooms</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-error">Maintenance</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.maintenanceRooms }} rooms</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-warning">Needs Cleaning</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.needsCleaningRooms }} rooms</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <span class="badge badge-info">Assigned Housekeeper</span>
              <span class="text-sm font-medium text-neutral-700">{{ stats.assignedHousekeeperRooms }} rooms</span>
            </div>
          </div>
        </div>

        <div class="card overflow-hidden">
          <h3 class="px-6 py-4 text-base font-semibold text-neutral-900 border-b border-neutral-200">Recent Reservations</h3>
          <div v-if="recentReservations.length === 0" class="px-6 py-8 text-center text-sm text-neutral-500">
            No recent reservations
          </div>
          <div v-else class="p-6 space-y-4">
            <div v-for="reservation in recentReservations" :key="reservation.id" class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <div class="flex-1 min-w-0">
                <div class="mb-1 text-sm font-medium text-neutral-900 truncate">{{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}</div>
                <div class="text-xs text-neutral-600">
                  Room {{ reservation.room?.room_number }} • {{ reservation.reservation_number }}
                </div>
              </div>
              <span :class="['badge', `badge-${getStatusColor(reservation.status)}`]">
                {{ reservation.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Restaurant Orders Card -->
        <div v-if="canManageRestaurant() || canManageBar()" class="card overflow-hidden">
          <h3 class="px-6 py-4 text-base font-semibold text-neutral-900 border-b border-neutral-200">Recent Restaurant Orders</h3>
          <div v-if="recentOrders.length === 0" class="px-6 py-8 text-center text-sm text-neutral-500">
            No recent orders
          </div>
          <div v-else class="p-6 space-y-4">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <div class="flex-1 min-w-0">
                <div class="mb-1 text-sm font-medium text-neutral-900 truncate">#{{ order.order_number }}</div>
                <div class="text-xs text-neutral-600">
                  {{ order.service_type }} • {{ order.table_number ? `Table ${order.table_number}` : 'Room Service' }}
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span :class="['badge', `badge-${getOrderStatusColor(order.status)}`]">
                  {{ order.status }}
                </span>
                <div class="text-sm font-semibold text-neutral-900">${{ order.total_amount }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Alerts Card -->
        <div v-if="canManageInventory()" class="card overflow-hidden">
          <h3 class="px-6 py-4 text-base font-semibold text-neutral-900 border-b border-neutral-200">Inventory Alerts</h3>
          <div v-if="inventoryAlerts.length === 0" class="px-6 py-8 text-center text-sm text-neutral-500">
            All items are well stocked
          </div>
          <div v-else class="p-6 space-y-4">
            <div v-for="item in inventoryAlerts" :key="item.id" class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
              <div class="flex-1 min-w-0">
                <div class="mb-1 text-sm font-medium text-neutral-900 truncate">{{ item.name }}</div>
                <div class="text-xs text-neutral-600">
                  Current: {{ item.current_stock }} {{ item.unit }} • Min: {{ item.minimum_stock }} {{ item.unit }}
                </div>
              </div>
              <span :class="['badge', item.current_stock === 0 ? 'badge-error' : 'badge-warning']">
                {{ item.current_stock === 0 ? 'Out of Stock' : 'Low Stock' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canManageHousekeeping() || hasRole(['housekeeping'])" class="card overflow-hidden">
        <h3 class="px-6 py-4 text-base font-semibold text-neutral-900 border-b border-neutral-200">Pending Housekeeping Tasks</h3>
        <div v-if="pendingTasks.length === 0" class="px-6 py-8 text-center text-sm text-neutral-500">
          No pending tasks
        </div>
        <div v-else class="p-6 space-y-4">
          <div v-for="task in pendingTasks" :key="task.id" class="flex items-center justify-between p-4 rounded-md bg-neutral-50 transition-colors duration-150 hover:bg-neutral-100">
            <div class="flex-1 min-w-0">
              <div class="mb-1 text-sm font-medium text-neutral-900 truncate">{{ task.description }}</div>
              <div class="text-xs text-neutral-600">Room {{ task.room?.room_number }} • {{ task.task_type }}</div>
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
const { 
  hasRole, 
  canManageHousekeeping, 
  canManageRestaurant, 
  canManageBar, 
  canManageInventory 
} = useAuth()

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
  // F&B Operations Stats
  todayOrders: 0,
  barOrders: 0,
  lowStockItems: 0,
})

const recentReservations = ref<Reservation[]>([])
const pendingTasks = ref<HousekeepingTask[]>([])
const recentOrders = ref<any[]>([])
const inventoryAlerts = ref<any[]>([])

const loadDashboardData = async () => {
  try {
    loading.value = true

    const today = new Date().toISOString().split('T')[0]

    // Prepare all data fetching promises
    const promises = [
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
    ]

    // Add F&B data fetching if user has permissions
    let ordersPromise = null
    let inventoryPromise = null

    if (canManageRestaurant() || canManageBar()) {
      ordersPromise = $supabase
        .from('restaurant_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      promises.push(ordersPromise)
    }

    if (canManageInventory()) {
      // Fetch active inventory items and derive low-stock items client-side
      inventoryPromise = $supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true)
        .limit(10)
      promises.push(inventoryPromise)
    }

    const results = await Promise.all(promises)
    const [roomsRes, reservationsRes, tasksRes, ...fbResults] = results

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
      // Type assertion with runtime validation
      const reservationData = reservationsRes.data as any[]
      recentReservations.value = reservationData.filter(item => 
        item && typeof item === 'object' && 'id' in item && 'reservation_number' in item
      ) as Reservation[]

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
      // Type assertion with runtime validation for housekeeping tasks
      const tasksData = tasksRes.data as any[]
      pendingTasks.value = tasksData.filter(item => 
        item && typeof item === 'object' && 'id' in item && 'room_id' in item && 'task_type' in item
      ) as HousekeepingTask[]
    }

    // Process F&B data
    let fbResultIndex = 0
    
    if (canManageRestaurant() || canManageBar()) {
      const ordersRes = fbResults[fbResultIndex++]
      if (ordersRes?.data) {
        recentOrders.value = ordersRes.data
        
        // Count today's orders
        const todayOrdersCount = ordersRes.data.filter(order => 
          order.created_at?.startsWith(today)
        ).length
        stats.value.todayOrders = todayOrdersCount
        
        // Count bar orders specifically
        const barOrdersCount = ordersRes.data.filter(order => 
          order.service_type === 'bar' && order.created_at?.startsWith(today)
        ).length
        stats.value.barOrders = barOrdersCount
      }
    }

    if (canManageInventory()) {
      const inventoryRes = fbResults[fbResultIndex++]
      if (inventoryRes?.data) {
        // Derive low stock items (current_stock <= minimum_stock)
        const lowStock = inventoryRes.data.filter((item: any) =>
          typeof item.current_stock === 'number' &&
          typeof item.minimum_stock === 'number' &&
          item.current_stock <= item.minimum_stock
        )

        inventoryAlerts.value = lowStock
        stats.value.lowStockItems = lowStock.length
      }
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

const getOrderStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    preparing: 'info',
    ready: 'success',
    served: 'neutral',
    cancelled: 'error',
  }
  return colors[status] || 'neutral'
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
.restaurant-orders-card,
.inventory-alerts-card,
.housekeeping-card {
  padding: 0;
}

.room-status-list,
.reservations-list,
.orders-list,
.alerts-list,
.tasks-list {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.status-item,
.reservation-item,
.order-item,
.alert-item,
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
.order-item:hover,
.alert-item:hover,
.task-item:hover {
  background: var(--neutral-100);
}

.status-count {
  font-weight: 500;
  color: var(--neutral-700);
  font-size: 0.875rem;
}

.reservation-info,
.order-info,
.alert-info,
.task-info {
  flex: 1;
  min-width: 0;
}

.reservation-guest,
.order-number,
.item-name,
.task-title {
  font-weight: 500;
  color: var(--neutral-900);
  font-size: 0.938rem;
  margin-bottom: 4px;
}

.reservation-details,
.order-details,
.item-details,
.task-details {
  font-size: 0.813rem;
  color: var(--neutral-600);
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.order-total {
  font-weight: 600;
  color: var(--neutral-900);
  font-size: 0.875rem;
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--neutral-500);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0 var(--spacing-md) var(--spacing-xl);
  }

  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .card h3 {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .room-status-list,
  .reservations-list,
  .orders-list,
  .alerts-list,
  .tasks-list {
    padding: var(--spacing-md);
  }

  .status-item,
  .reservation-item,
  .order-item,
  .alert-item,
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .order-meta {
    align-items: flex-start;
  }
}
</style>
