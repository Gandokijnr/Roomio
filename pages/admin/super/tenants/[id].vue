<template>
  <div class="tenant-detail-page" v-if="tenant">
    <header class="tenant-header">
      <div>
        <h1>{{ tenant.name }}</h1>
        <p>
          {{ tenant.primary_contact_name }}
          <span v-if="tenant.primary_contact_email">
            · {{ tenant.primary_contact_email }}
          </span>
        </p>
      </div>
      <div class="tenant-meta">
        <span class="plan-pill">{{ tenant.subscription_plan }}</span>
        <span class="status-pill" :class="tenant.status">{{ tenant.status }}</span>
        <span class="joined" v-if="tenant.date_joined || tenant.created_at">
          Joined {{ formatDate(tenant.date_joined || tenant.created_at) }}
        </span>
      </div>
    </header>

    <section class="metrics-grid" v-if="metrics">
      <div class="metric-card">
        <div class="metric-label">Rooms</div>
        <div class="metric-value">{{ metrics.rooms.totalRooms }}</div>
        <div class="metric-sub">
          {{ metrics.rooms.activeRooms }} active ·
          {{ (metrics.rooms.occupancyRate30Days * 100).toFixed(1) }}% occ (30d) ·
          ADR ${{ metrics.rooms.adr30Days.toFixed(2) }}
        </div>
        <div class="metric-sub subtle">
          {{ metrics.rooms.reservationsLast30Days }} reservations (30d)
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Revenue (30 days)</div>
        <div class="metric-value">
          ${{ metrics.revenue.revenueLast30Days.toLocaleString() }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">F&B Orders (30 days)</div>
        <div class="metric-value">{{ metrics.fb.fbOrdersLast30Days }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Staff</div>
        <div class="metric-value">{{ metrics.staff.staffCount }}</div>
      </div>
      <div class="metric-card" v-if="billing">
        <div class="metric-label">Billing & Subscription</div>
        <div class="metric-value">
          {{ billing.current_plan?.name || tenant?.subscription_plan || 'Unknown plan' }}
        </div>
        <div class="metric-sub">
          Status: <span class="font-semibold">{{ billing.status }}</span>
        </div>
        <div class="metric-sub" v-if="billing.trial_end_date">
          Trial ended: {{ formatDate(billing.trial_end_date) }}
        </div>
        <div class="metric-sub" v-if="billing.subscription_start_date && billing.subscription_end_date">
          Current period:
          {{ formatDate(billing.subscription_start_date) }}
          –
          {{ formatDate(billing.subscription_end_date) }}
        </div>
        <div class="metric-sub" v-if="billing.last_payment">
          Last payment:
          <span :class="billing.last_payment.event_type === 'PAYMENT_SUCCESS' ? 'text-emerald-300' : 'text-rose-300'">
            {{ billing.last_payment.event_type === 'PAYMENT_SUCCESS' ? 'Success' : 'Failed' }}
          </span>
          on {{ formatDateTime(billing.last_payment.created_at) }}
        </div>
        <div class="metric-sub" v-if="billing.paystack_customer_code">
          Paystack customer: {{ billing.paystack_customer_code }}
        </div>
        <div class="metric-sub">
          <button
            type="button"
            class="btn subtle"
            @click="openAuditLogForTenant"
          >
            View audit log for this tenant
          </button>
        </div>
      </div>
    </section>

    <section class="activity-section" v-if="activity.length">
      <h2 class="section-title">Recent Activity</h2>
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
      </div>
    </section>

    <section class="actions-row">
      <NuxtLink to="/admin/super" class="btn subtle">Back to overview</NuxtLink>
      <button class="btn" @click="openUpdateTenant('update_plan')">Change Plan</button>
      <button class="btn danger" @click="openUpdateTenant('update_status')">
        {{ tenant.status === 'suspended' ? 'Activate Tenant' : 'Suspend Tenant' }}
      </button>
      <button class="btn subtle" @click="copyInviteLink">Copy invite link</button>
      <button class="btn subtle" disabled>Impersonate (coming soon)</button>
    </section>

    <div v-if="showUpdateModal" class="modal-backdrop">
      <div class="modal">
        <h3>Update Tenant</h3>
        <p v-if="updateAction === 'update_status'">
          Change status for <strong>{{ tenant.name }}</strong>
        </p>
        <p v-else>
          Change subscription plan for <strong>{{ tenant.name }}</strong>
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

interface TenantMetrics {
  rooms: {
    totalRooms: number
    activeRooms: number
    reservationsLast30Days: number
    occupancyRate30Days: number
    adr30Days: number
  }
  revenue: {
    revenueLast30Days: number
  }
  fb: {
    fbOrdersLast30Days: number
  }
  staff: {
    staffCount: number
  }
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

const tenant = ref<Tenant | null>(null)
const metrics = ref<TenantMetrics | null>(null)
const activity = ref<ActivityEvent[]>([])
const billing = ref<any | null>(null)

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

const tenantId = computed(() => route.params.id as string)

const loadTenant = async () => {
  if (!authToken.value || !tenantId.value) return
  try {
    const { data: res } = await $axios.get('/api/super/tenant-detail', {
      headers: authHeaders.value,
      params: { id: tenantId.value }
    })
    if (res && res.success) {
      tenant.value = res.data as Tenant
    }
  } catch (error: any) {
    console.error('Failed to load tenant:', error)
    const statusCode = error?.statusCode ?? error?.response?.status
    if (statusCode === 404) {
      router.push('/admin/super')
    }
  }
}

const loadMetrics = async () => {
  if (!authToken.value || !tenantId.value) return
  try {
    const { data: res } = await $axios.get('/api/super/tenant-metrics', {
      headers: authHeaders.value,
      params: { id: tenantId.value }
    })
    if (res && res.success) {
      metrics.value = res.data as TenantMetrics
    }
  } catch (error) {
    console.error('Failed to load tenant metrics:', error)
  }
}

const loadBilling = async () => {
  if (!authToken.value || !tenantId.value) return
  try {
    const { data: res } = await $axios.get('/api/super/tenant-billing', {
      headers: authHeaders.value,
      params: { id: tenantId.value }
    })
    if (res && res.success) {
      billing.value = res.data
    }
  } catch (error) {
    console.error('Failed to load tenant billing overview:', error)
  }
}

const loadActivity = async () => {
  if (!authToken.value || !tenantId.value) return
  try {
    const { data: res } = await $axios.get('/api/super/tenant-activity', {
      headers: authHeaders.value,
      params: { id: tenantId.value, limit: 50 }
    })
    if (res && res.success) {
      activity.value = res.data.events as ActivityEvent[]
    }
  } catch (error) {
    console.error('Failed to load tenant activity:', error)
  }
}

const openUpdateTenant = (action: 'update_status' | 'update_plan') => {
  if (!tenant.value) return
  updateAction.value = action
  updateStatus.value = tenant.value.status
  updatePlan.value = tenant.value.subscription_plan
  updateNotes.value = tenant.value.notes || ''
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const submitUpdate = async () => {
  if (!authToken.value || !tenant.value) return
  updating.value = true
  try {
    const { data: res } = await $axios.patch(`/api/super/tenants/${tenant.value.id}`, {
      action: updateAction.value,
      status: updateAction.value === 'update_status' ? updateStatus.value : undefined,
      subscription_plan: updateAction.value === 'update_plan' ? updatePlan.value : undefined,
      notes: updateNotes.value || undefined
    }, {
      headers: authHeaders.value
    })
    if (res && res.success) {
      const updated = res.data as Tenant
      tenant.value = updated
      showUpdateModal.value = false
      await loadMetrics()
    }
  } catch (error) {
    console.error('Failed to update tenant:', error)
  } finally {
    updating.value = false
  }
}

const openAuditLogForTenant = () => {
  if (!tenant.value) return
  router.push({ path: '/admin/super', hash: '#activity', query: { tenant_id: tenant.value.id } })
}

const copyInviteLink = async () => {
  if (!authToken.value || !tenantId.value) return
  try {
    const { data: res } = await $axios.get('/api/super/tenant-invite-link', {
      headers: authHeaders.value,
      params: { id: tenantId.value }
    })

    if (res && res.success && res.data?.invitationLink) {
      await navigator.clipboard.writeText(res.data.invitationLink)
      alert(`Invitation link copied to clipboard:\n\n${res.data.invitationLink}`)
    } else {
      alert('Could not retrieve invitation link for this tenant.')
    }
  } catch (error) {
    console.error('Failed to copy invite link:', error)
    alert('Failed to fetch invitation link. Make sure this tenant came from an approved access request.')
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
    loadTenant(),
    loadMetrics(),
    loadBilling(),
    loadActivity()
  ])
})
</script>

<style scoped>
.tenant-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tenant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #020617, #111827);
  color: #e5e7eb;
}

.tenant-header h1 {
  font-size: 1.4rem;
  font-weight: 600;
}

.tenant-header p {
  font-size: 0.85rem;
  color: #9ca3af;
}

.tenant-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.plan-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid #d4af37;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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

.joined {
  color: #9ca3af;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: #020617;
  border: 1px solid #1f2937;
  color: #e5e7eb;
}

.metric-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.metric-value {
  margin-top: 0.25rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.metric-sub {
  margin-top: 0.25rem;
  font-size: 0.78rem;
  color: #9ca3af;
}

.metric-sub.subtle {
  opacity: 0.8;
}

.actions-row {
  display: flex;
  gap: 0.5rem;
}

.btn {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  background: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
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

.activity-section {
  margin-top: 0.5rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.activity-list {
  max-height: 260px;
  overflow: auto;
  padding: 0.5rem 0.75rem 0.75rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
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

.filter-input {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  width: 100%;
}

.modal-footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .tenant-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .actions-row {
    flex-wrap: wrap;
  }
}
</style>
