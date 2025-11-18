<template>
  <div class="super-onboarding-page">
    <header class="page-header">
      <div>
        <h1>Onboarding & Access Requests</h1>
        <p>Review, approve, and manage invitations to the platform</p>
      </div>
    </header>

    <section class="card">
      <header class="card-header">
        <div>
          <h2>Access Requests</h2>
          <p>Invitation-only queue from the public landing page</p>
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

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Requested</th>
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
              <td>{{ formatDate(request.created_at) }}</td>
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
              <td colspan="5" class="empty-cell">No requests found.</td>
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

interface AccessRequest {
  id: string
  name: string
  email: string
  hotel_name: string
  room_count: string
  status: string
  created_at: string
}

const authToken = ref<string | null>(null)

const requests = ref<AccessRequest[]>([])
const requestStatus = ref('pending')
const loadingRequests = ref(false)

const authHeaders = computed(() => {
  return authToken.value
    ? { Authorization: `Bearer ${authToken.value}` }
    : {}
})

const loadRequests = async () => {
  if (!authToken.value) return
  loadingRequests.value = true
  try {
    const { data: res } = await $axios.get('/api/super/access-requests', {
      headers: authHeaders.value,
      params: {
        status: requestStatus.value,
        page: 1,
        limit: 50
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

const approveRequest = async (request: AccessRequest) => {
  if (!authToken.value) return
  if (!confirm(`Approve access request for ${request.hotel_name}?`)) return
  try {
    await $axios.post(`/api/super/access-requests/${request.id}/approve`, null, {
      headers: authHeaders.value
    })
    await loadRequests()
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
    await loadRequests()
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

onMounted(async () => {
  const { data } = await $supabase.auth.getSession()
  authToken.value = data.session?.access_token || null

  if (!authToken.value) return

  await loadRequests()
})
</script>

<style scoped>
.super-onboarding-page {
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

.status-pill.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.approved {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.rejected {
  background: #fee2e2;
  color: #b91c1c;
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
