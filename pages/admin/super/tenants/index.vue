<template>
  <div class="super-tenants-page">
    <header class="page-header">
      <div>
        <h1>Tenants</h1>
        <p>Manage all hotels on the Roomio platform</p>
      </div>
    </header>

    <section class="card">
      <header class="card-header">
        <div>
          <h2>Tenant Directory</h2>
          <p>Search, filter and drill into individual tenants</p>
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
            <tr v-for="tenant in tenants" :key="tenant.id">
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
                >
                  View
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="6" class="empty-cell">No tenants found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { $supabase, $axios } = useNuxtApp() as any

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
}

const authToken = ref<string | null>(null)

const tenants = ref<Tenant[]>([])
const tenantStatus = ref('')
const tenantSearch = ref('')
const loadingTenants = ref(false)

const authHeaders = computed(() => {
  return authToken.value
    ? { Authorization: `Bearer ${authToken.value}` }
    : {}
})

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

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  const { data } = await $supabase.auth.getSession()
  authToken.value = data.session?.access_token || null

  if (!authToken.value) return

  await loadTenants()
})
</script>

<style scoped>
.super-tenants-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #020617, #111827);
  color: #e5e7eb;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.page-header p {
  font-size: 0.875rem;
  color: #9ca3af;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th,
.data-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
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

.btn.xs {
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
}

@media (max-width: 768px) {
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
