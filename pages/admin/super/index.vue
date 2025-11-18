<template>
  <div class="super-admin-page">
    <header class="super-admin-header">
      <div>
        <h1>Super Admin Command Center</h1>
        <p>Global control panel for Roomio platform owners</p>
      </div>
      <span class="super-admin-badge">Super Admin</span>
    </header>

    <nav class="super-admin-tabs">
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'overview' }"
        type="button"
        @click="setActiveTab('overview')"
      >
        🛡️ Overview
      </button>
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'tenantsSummary' }"
        type="button"
        @click="setActiveTab('tenantsSummary')"
      >
        🏨 Tenants (Summary)
      </button>
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'tenantsDirectory' }"
        type="button"
        @click="setActiveTab('tenantsDirectory')"
      >
        📋 Tenants Directory
      </button>
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'onboardingSummary' }"
        type="button"
        @click="setActiveTab('onboardingSummary')"
      >
        📬 Onboarding (Summary)
      </button>
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'onboardingQueue' }"
        type="button"
        @click="setActiveTab('onboardingQueue')"
      >
        ✅ Onboarding Queue
      </button>
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'activity' }"
        type="button"
        @click="setActiveTab('activity')"
      >
        📣 Activity
      </button>
    </nav>

    <section class="metrics-grid" v-if="dashboard && activeTab === 'overview'">
      <div class="metric-card tenants">
        <div class="metric-label">Total Tenants</div>
        <div class="metric-value">{{ dashboard.totalTenants }}</div>
        <div class="metric-sub" v-if="dashboard.newTenantsLast30Days !== undefined">
          {{ dashboard.newTenantsLast30Days }} new in last 30 days
        </div>
      </div>
      <div class="metric-card requests">
        <div class="metric-label">Pending Requests</div>
        <div class="metric-value">{{ dashboard.pendingRequests }}</div>
      </div>
      <div class="metric-card users">
        <div class="metric-label">Active Users (15 min)</div>
        <div class="metric-value">{{ dashboard.activeUsers }}</div>
        <div class="metric-sub" v-if="dashboard.churnRateLast30Days !== undefined">
          Churn 30d: {{ (dashboard.churnRateLast30Days * 100).toFixed(1) }}%
        </div>
      </div>
      <div class="metric-card financial" v-if="dashboard.mrr !== undefined">
        <div class="metric-label">Monthly Recurring Revenue</div>
        <div class="metric-value">
          ${{ dashboard.mrr.toLocaleString() }}
        </div>
      </div>
      <div class="metric-card usage" v-if="dashboard.totalRooms !== undefined">
        <div class="metric-label">Rooms Managed</div>
        <div class="metric-value">{{ dashboard.totalRooms }}</div>
        <div class="metric-sub" v-if="dashboard.totalInventoryItems !== undefined">
          {{ dashboard.totalInventoryItems }} inventory items
        </div>
      </div>
      <div class="metric-card health" :class="dashboard.systemHealth.status">
        <div class="metric-label">System Health</div>
        <div class="metric-value">
          {{ dashboard.systemHealth.status === 'green' ? 'Green' : 'Red' }}
        </div>
        <div class="metric-sub">
          {{ dashboard.systemHealth.errorCountLastHour }} errors in last hour
          <span v-if="dashboard.systemHealth.errorRateLast24h !== undefined">
            · {{ (dashboard.systemHealth.errorRateLast24h * 100).toFixed(1) }}% last 24h
          </span>
        </div>
      </div>
    </section>

    <section
      v-if="activeTab === 'tenantsSummary'"
      class="summary-grid"
    >
      <div class="summary-card">
        <div class="summary-card-header">
          <h2>Tenant Status Overview</h2>
          <p>High-level snapshot of all hotels on the platform.</p>
        </div>
        <div class="summary-stats-row">
          <div class="mini-stat">
            <span class="label">Total Tenants</span>
            <span class="value">{{ dashboard?.totalTenants ?? tenants.length }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Active</span>
            <span class="value">{{ tenantCountsByStatus.active || 0 }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Trial</span>
            <span class="value">{{ tenantCountsByStatus.trial || 0 }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Pending</span>
            <span class="value">{{ tenantCountsByStatus.pending || 0 }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Suspended</span>
            <span class="value">{{ tenantCountsByStatus.suspended || 0 }}</span>
          </div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card-header">
          <h2>Plans Mix</h2>
          <p>Distribution of subscription plans across tenants.</p>
        </div>
        <div class="summary-stats-row">
          <div
            v-for="(count, plan) in tenantCountsByPlan"
            :key="plan"
            class="mini-stat"
          >
            <span class="label">{{ plan }}</span>
            <span class="value">{{ count }}</span>
          </div>
          <div v-if="Object.keys(tenantCountsByPlan).length === 0" class="empty-cell">
            No tenants loaded yet.
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="activeTab === 'tenantsDirectory'"
      id="tenants-directory"
      class="card tenants-card"
    >
      <header class="card-header">
        <div>
          <h2>Tenants</h2>
          <p>Manage all hotels on the platform</p>
        </div>
        <div class="card-filters">
          <select v-model="tenantStatus" @change="loadTenants" class="filter-input">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            v-model="tenantSearch"
            @keyup.enter="loadTenants"
            class="filter-input"
            type="search"
            placeholder="Search hotels or contacts..."
          />
          <button class="btn" @click="loadTenants">Refresh</button>
        </div>
      </header>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>Primary Contact</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Date Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tenant in tenants"
              :key="tenant.id"
              :class="{ selected: selectedTenant && selectedTenant.id === tenant.id }"
              @click="selectTenant(tenant)"
            >
              <td>{{ tenant.name }}</td>
              <td>
                <div class="cell-main">{{ tenant.primary_contact_name || '-' }}</div>
                <div class="cell-sub">{{ tenant.primary_contact_email }}</div>
              </td>
              <td>{{ tenant.subscription_plan }}</td>
              <td>
                <span class="status-pill" :class="tenant.status">
                  {{ tenant.status }}
                </span>
              </td>
              <td>{{ formatDate(tenant.date_joined || tenant.created_at) }}</td>
              <td>
                <NuxtLink
                  class="btn xs"
                  :to="`/admin/super/tenants/${tenant.id}`"
                  @click.stop
                >
                  View
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="5" class="empty-cell">No tenants found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="selectedTenant" class="tenant-detail">
        <div class="detail-main">
          <h3>{{ selectedTenant.name }}</h3>
          <p>
            {{ selectedTenant.primary_contact_name }}
            <span v-if="selectedTenant.primary_contact_email">
              · {{ selectedTenant.primary_contact_email }}
            </span>
          </p>
          <div class="detail-stats">
            <div>
              <span class="label">Rooms Defined</span>
              <span class="value">{{ selectedTenant.rooms_defined ?? 0 }}</span>
            </div>
            <div>
              <span class="label">Storage Used</span>
              <span class="value">{{ (selectedTenant.storage_used_mb ?? 0).toFixed(1) }} MB</span>
            </div>
            <div>
              <span class="label">Last Active</span>
              <span class="value">{{ formatDateTime(selectedTenant.last_active_at) }}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn subtle" @click="impersonateTenant" disabled>
            Impersonate (coming soon)
          </button>
          <button class="btn" @click="openUpdateTenant('update_plan')">
            Change Plan
          </button>
          <button
            class="btn danger"
            @click="openUpdateTenant('update_status')"
          >
            {{ selectedTenant.status === 'suspended' ? 'Activate Tenant' : 'Suspend Tenant' }}
          </button>
        </div>
      </footer>
    </section>

    <section
      v-if="activeTab === 'onboardingSummary'"
      class="summary-grid"
    >
      <div class="summary-card">
        <div class="summary-card-header">
          <h2>Onboarding Funnel</h2>
          <p>Pipeline of access requests from the landing page.</p>
        </div>
        <div class="summary-stats-row">
          <div class="mini-stat">
            <span class="label">Total Requests</span>
            <span class="value">{{ requests.length }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Pending</span>
            <span class="value">{{ onboardingCounts.pending }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Approved</span>
            <span class="value">{{ onboardingCounts.approved }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Rejected</span>
            <span class="value">{{ onboardingCounts.rejected }}</span>
          </div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card-header">
          <h2>Recent Requests</h2>
          <p>Most recent hotels that requested access.</p>
        </div>
        <ul class="summary-list">
          <li
            v-for="request in requests.slice(0, 5)"
            :key="request.id"
            class="summary-list-item"
          >
            <div class="cell-main">{{ request.hotel_name }}</div>
            <div class="cell-sub">
              {{ request.name }} · {{ formatDate(request.created_at) }} · {{ request.status }}
            </div>
          </li>
          <li v-if="requests.length === 0" class="empty-cell">No requests yet.</li>
        </ul>
      </div>
    </section>

    <section
      v-if="activeTab === 'onboardingQueue'"
      class="card requests-card"
    >
      <header class="card-header">
        <div>
          <h2>Registration Requests</h2>
          <p>Invite-only and approval queue</p>
        </div>
        <div class="card-filters">
          <select v-model="requestStatus" @change="loadRequests" class="filter-input">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button class="btn" @click="loadRequests">Refresh</button>
        </div>
      </header>

      <div class="table-wrapper compact">
        <table class="data-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in requests" :key="request.id">
              <td>
                <div class="cell-main">{{ request.hotel_name }}</div>
                <div class="cell-sub">{{ formatDate(request.created_at) }}</div>
              </td>
              <td>
                <div class="cell-main">{{ request.name }}</div>
                <div class="cell-sub">{{ request.email }}</div>
              </td>
              <td>
                <span class="status-pill" :class="request.status">
                  {{ request.status }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    v-if="request.status === 'pending'"
                    class="btn xs"
                    @click="approveRequest(request)"
                  >
                    Approve
                  </button>
                  <button
                    v-if="request.status === 'pending'"
                    class="btn xs danger"
                    @click="rejectRequest(request)"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="4" class="empty-cell">No requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-if="activeTab === 'activity'"
      class="card activity-card"
    >
      <header class="card-header">
        <div>
          <h2>Global Activity</h2>
          <p>High-level events across the platform</p>
        </div>
        <button class="btn" @click="loadActivity">Refresh</button>
      </header>

      <div class="activity-list">
        <div v-for="event in activity" :key="event.id" class="activity-item">
          <div class="activity-type" :class="event.type">
            {{ event.type }}
          </div>
          <div class="activity-body">
            <div class="activity-title">{{ event.title }}</div>
            <div class="activity-meta">
              <span>{{ formatDateTime(event.created_at) }}</span>
              <span v-if="event.metadata?.hotel_name">
                · {{ event.metadata.hotel_name }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="activity.length === 0" class="empty-cell">No recent activity.</div>
      </div>
    </section>

    <div v-if="showUpdateModal && selectedTenant" class="modal-backdrop">
      <div class="modal">
        <h3>Update Tenant</h3>
        <p v-if="updateAction === 'update_status'">
          Change status for <strong>{{ selectedTenant.name }}</strong>
        </p>
        <p v-else>
          Change subscription plan for <strong>{{ selectedTenant.name }}</strong>
        </p>

        <div class="modal-body">
          <div v-if="updateAction === 'update_status'" class="field">
            <label>Status</label>
            <select v-model="updateStatus" class="filter-input">
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div v-else class="field">
            <label>Plan</label>
            <input v-model="updatePlan" class="filter-input" placeholder="e.g. trial, starter, growth" />
          </div>
          <div class="field">
            <label>Notes (optional)</label>
            <textarea v-model="updateNotes" rows="3" class="filter-input"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn subtle" @click="closeUpdateModal">Cancel</button>
          <button class="btn" @click="submitUpdate" :disabled="updating">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $supabase, $axios } = useNuxtApp() as any
const route = useRoute()
const router = useRouter()

definePageMeta({
  middleware: ['auth', 'super-admin'],
  layout: 'super-admin'
})

interface DashboardData {
  totalTenants: number
  pendingRequests: number
  activeUsers: number
  systemHealth: {
    status: 'green' | 'red'
    errorCountLastHour: number
    errorRateLast24h?: number
  }
  newTenantsLast30Days?: number
  totalRooms?: number
  totalInventoryItems?: number
  mrr?: number
  subscriptionBreakdown?: Record<string, number>
  churnRateLast30Days?: number
}

interface Tenant {
  id: string
  name: string
  primary_contact_name?: string
  primary_contact_email?: string
  subscription_plan: string
  status: string
  date_joined?: string
  created_at?: string
  rooms_defined?: number
  storage_used_mb?: number
  last_active_at?: string
  notes?: string
}

interface AccessRequest {
  id: string
  name: string
  email: string
  hotel_name: string
  room_count: string
  status: string
  created_at: string
}

interface ActivityEvent {
  id: string
  type: string
  title: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: any
  created_at: string
}

const authToken = ref<string | null>(null)

const activeTab = ref<
  'overview' |
  'tenantsSummary' |
  'tenantsDirectory' |
  'onboardingSummary' |
  'onboardingQueue' |
  'activity'
>('overview')

const loadingDashboard = ref(false)
const loadingTenants = ref(false)
const loadingRequests = ref(false)
const loadingActivity = ref(false)

const dashboard = ref<DashboardData | null>(null)

const tenants = ref<Tenant[]>([])
const tenantStatus = ref('')
const tenantSearch = ref('')
const selectedTenant = ref<Tenant | null>(null)

const requests = ref<AccessRequest[]>([])
const requestStatus = ref('pending')

const activity = ref<ActivityEvent[]>([])

const showUpdateModal = ref(false)
const updateAction = ref<'update_status' | 'update_plan'>('update_status')
const updateStatus = ref('active')
const updatePlan = ref('trial')
const updateNotes = ref('')
const updating = ref(false)

const authHeaders = computed(() => {
  return authToken.value
    ? { Authorization: `Bearer ${authToken.value}` }
    : {}
})

const tabFromHash = (hash: string | null | undefined): typeof activeTab.value => {
  const clean = hash ? hash.replace('#', '') : ''
  switch (clean) {
    case 'overview':
      return 'overview'
    case 'tenants':
    case 'tenants-directory':
    case 'tenantsDirectory':
      return 'tenantsDirectory'
    case 'tenants-summary':
    case 'tenantsSummary':
      return 'tenantsSummary'
    case 'onboarding':
    case 'onboarding-summary':
    case 'onboardingSummary':
    case 'requests':
      return 'onboardingSummary'
    case 'onboarding-queue':
    case 'onboardingQueue':
      return 'onboardingQueue'
    case 'activity':
      return 'activity'
    default:
      return 'overview'
  }
}

const hashFromTab = (tab: typeof activeTab.value): string => {
  switch (tab) {
    case 'overview':
      return '#overview'
    case 'tenantsSummary':
      return '#tenants-summary'
    case 'tenantsDirectory':
      return '#tenants'
    case 'onboardingSummary':
      return '#requests'
    case 'onboardingQueue':
      return '#onboarding-queue'
    case 'activity':
      return '#activity'
  }
}

const setActiveTab = (tab: typeof activeTab.value) => {
  activeTab.value = tab
  const hash = hashFromTab(tab)
  if (route.hash !== hash) {
    router.replace({ hash })
  }
}

watch(
  () => route.hash,
  (newHash) => {
    activeTab.value = tabFromHash(newHash)
  },
  { immediate: true }
)

const tenantCountsByStatus = computed(() => {
  const counts: Record<string, number> = {
    active: 0,
    trial: 0,
    pending: 0,
    suspended: 0
  }

  for (const tenant of tenants.value) {
    const status = tenant.status || 'pending'
    if (!(status in counts)) {
      counts[status] = 0
    }
    counts[status] += 1
  }

  return counts
})

const tenantCountsByPlan = computed(() => {
  const counts: Record<string, number> = {}

  for (const tenant of tenants.value) {
    const plan = tenant.subscription_plan || 'unknown'
    counts[plan] = (counts[plan] || 0) + 1
  }

  return counts
})

const onboardingCounts = computed(() => {
  return requests.value.reduce(
    (acc, request) => {
      if (request.status === 'approved') {
        acc.approved += 1
      } else if (request.status === 'rejected') {
        acc.rejected += 1
      } else {
        acc.pending += 1
      }
      return acc
    },
    { pending: 0, approved: 0, rejected: 0 }
  )
})

const loadDashboard = async () => {
  if (!authToken.value) return
  loadingDashboard.value = true
  try {
    const { data: res } = await $axios.get('/api/super/dashboard', {
      headers: authHeaders.value
    })
    if (res && res.success) {
      dashboard.value = res.data as DashboardData
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loadingDashboard.value = false
  }
}

const loadTenants = async () => {
  if (!authToken.value) return
  loadingTenants.value = true
  try {
    const { data: res } = await $axios.get('/api/super/tenants', {
      headers: authHeaders.value,
      params: {
        status: tenantStatus.value || undefined,
        search: tenantSearch.value || undefined,
        page: 1,
        limit: 50
      }
    })
    if (res && res.success) {
      tenants.value = res.data.tenants as Tenant[]
    }
  } catch (error) {
    console.error('Failed to load tenants:', error)
  } finally {
    loadingTenants.value = false
  }
}

const loadRequests = async () => {
  if (!authToken.value) return
  loadingRequests.value = true
  try {
    const { data: res } = await $axios.get('/api/super/access-requests', {
      headers: authHeaders.value,
      params: {
        status: requestStatus.value,
        page: 1,
        limit: 25
      }
    })
    if (res && res.success) {
      requests.value = res.data.requests as AccessRequest[]
    }
  } catch (error) {
    console.error('Failed to load access requests:', error)
  } finally {
    loadingRequests.value = false
  }
}

const loadActivity = async () => {
  if (!authToken.value) return
  loadingActivity.value = true
  try {
    const { data: res } = await $axios.get('/api/super/activity', {
      headers: authHeaders.value,
      params: { limit: 50 }
    })
    if (res && res.success) {
      activity.value = res.data.events as ActivityEvent[]
    }
  } catch (error) {
    console.error('Failed to load activity:', error)
  } finally {
    loadingActivity.value = false
  }
}

const selectTenant = (tenant: Tenant) => {
  selectedTenant.value = tenant
}

const impersonateTenant = () => {
  // Placeholder for future impersonation flow
}

const openUpdateTenant = (action: 'update_status' | 'update_plan') => {
  if (!selectedTenant.value) return
  updateAction.value = action
  updateStatus.value = selectedTenant.value.status
  updatePlan.value = selectedTenant.value.subscription_plan
  updateNotes.value = selectedTenant.value.notes || ''
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const submitUpdate = async () => {
  if (!authToken.value || !selectedTenant.value) return
  updating.value = true
  try {
    const { data: res } = await $axios.patch(`/api/super/tenants/${selectedTenant.value.id}`, {
      action: updateAction.value,
      status: updateAction.value === 'update_status' ? updateStatus.value : undefined,
      subscription_plan: updateAction.value === 'update_plan' ? updatePlan.value : undefined,
      notes: updateNotes.value || undefined
    }, {
      headers: authHeaders.value
    })
    if (res && res.success) {
      const updated = res.data as Tenant
      const idx = tenants.value.findIndex(t => t.id === updated.id)
      if (idx !== -1) {
        tenants.value[idx] = updated
      }
      selectedTenant.value = updated
      showUpdateModal.value = false
    }
  } catch (error) {
    console.error('Failed to update tenant:', error)
  } finally {
    updating.value = false
  }
}

const approveRequest = async (request: AccessRequest) => {
  if (!authToken.value) return
  if (!confirm(`Approve access request for ${request.hotel_name}?`)) return
  try {
    await $axios.post(`/api/super/access-requests/${request.id}/approve`, null, {
      headers: authHeaders.value
    })
    await Promise.all([loadDashboard(), loadTenants(), loadRequests(), loadActivity()])
  } catch (error) {
    console.error('Failed to approve request:', error)
  }
}

const rejectRequest = async (request: AccessRequest) => {
  if (!authToken.value) return
  const reason = prompt(`Reject access request for ${request.hotel_name} (optional reason):`)
  if (reason === null) return
  try {
    await $axios.post(`/api/super/access-requests/${request.id}/reject`, {
      reason: reason || undefined
    }, {
      headers: authHeaders.value
    })
    await Promise.all([loadDashboard(), loadRequests(), loadActivity()])
  } catch (error) {
    console.error('Failed to reject request:', error)
  }
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  const { data } = await $supabase.auth.getSession()
  authToken.value = data.session?.access_token || null

  if (!authToken.value) return

  await Promise.all([
    loadDashboard(),
    loadTenants(),
    loadRequests(),
    loadActivity()
  ])
})
</script>

<style scoped>
.super-admin-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.super-admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #020617, #111827);
  color: #e5e7eb;
}

.super-admin-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.super-admin-header p {
  font-size: 0.875rem;
  color: #9ca3af;
}

.super-admin-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: #111827;
  border: 1px solid #d4af37;
  color: #fbbf24;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: #020617;
  border: 1px solid #1f2937;
  color: #e5e7eb;
}

.metric-card .metric-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.metric-card .metric-value {
  margin-top: 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.metric-card.health.green {
  border-color: #22c55e;
}

.metric-card.health.red {
  border-color: #ef4444;
}

.metric-card .metric-sub {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.5fr);
  gap: 1.5rem;
}

.card {
  border-radius: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.card-header p {
  font-size: 0.75rem;
  color: #6b7280;
}

.card-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-input {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
}

.table-wrapper {
  overflow: auto;
}

.table-wrapper.compact {
  max-height: 260px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.data-table thead {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table th,
.data-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table tbody tr.selected {
  background: #eff6ff;
}

.cell-main {
  font-weight: 500;
  color: #111827;
}

.cell-sub {
  font-size: 0.7rem;
  color: #6b7280;
}

.empty-cell {
  text-align: center;
  padding: 1rem;
  color: #9ca3af;
}

.status-pill {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  text-transform: capitalize;
}

.status-pill.active {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.trial {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.pending {
  background: #e0f2fe;
  color: #0369a1;
}

.status-pill.suspended {
  background: #fee2e2;
  color: #b91c1c;
}

.tenant-detail {
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.detail-main h3 {
  font-size: 0.95rem;
  font-weight: 600;
}

.detail-main p {
  font-size: 0.8rem;
  color: #6b7280;
}

.detail-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.detail-stats .label {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
}

.detail-stats .value {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-list {
  max-height: 260px;
  overflow: auto;
  padding: 0.5rem 0.75rem 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
  margin-bottom: 0.35rem;
}

.activity-type {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  background: #f3f4f6;
  align-self: flex-start;
}

.activity-type.system_error {
  background: #fef2f2;
  color: #b91c1c;
}

.activity-type.tenant_created {
  background: #ecfdf5;
  color: #15803d;
}

.activity-title {
  font-size: 0.8rem;
  font-weight: 500;
}

.activity-meta {
  font-size: 0.7rem;
  color: #6b7280;
}

.activity-body {
  display: flex;
  flex-direction: column;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

.btn {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  background: white;
  cursor: pointer;
}

.btn:hover {
  background: #f9fafb;
}

.btn.danger {
  border-color: #ef4444;
  color: #b91c1c;
}

.btn.subtle {
  border-color: #e5e7eb;
  color: #4b5563;
}

.btn.xs {
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  width: 360px;
  border: 1px solid #e5e7eb;
}

.modal h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.modal p {
  font-size: 0.8rem;
  color: #6b7280;
}

.modal-body {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  display: block;
  font-size: 0.75rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.field textarea {
  min-height: 60px;
}

.modal-footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .super-admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-filters {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
