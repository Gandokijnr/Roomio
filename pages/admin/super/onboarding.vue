<template>
  <div class="space-y-6 lg:space-y-8">
    <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 text-slate-100">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold">Onboarding &amp; Access Requests</h1>
        <p class="mt-1 text-sm text-slate-400">Review, approve, and manage invitations to the platform</p>
      </div>
    </header>

    <section class="rounded-xl border border-slate-700/70 bg-slate-950/80 shadow-sm flex flex-col">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-slate-700/70 bg-slate-900/80">
        <div>
          <h2 class="text-sm font-semibold text-slate-100">Access Requests</h2>
          <p class="mt-0.5 text-xs text-slate-400">Invitation-only queue from the public landing page</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <select
            v-model="requestStatus"
            @change="loadRequests"
            class="w-full sm:w-auto rounded-md border border-slate-500/70 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:border-royal-gold-500 focus:ring-royal-gold-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            class="inline-flex items-center justify-center rounded-md border border-slate-500/70 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 w-full sm:w-auto"
            @click="loadRequests"
          >
            Refresh
          </button>
        </div>
      </header>

      <div class="max-h-[28rem] overflow-auto">
        <table class="min-w-full text-xs text-slate-200">
          <thead class="bg-slate-900/80 border-b border-slate-700/70">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Hotel</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Contact</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Status</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Requested</th>
              <th class="px-3 sm:px-4 py-2 text-right font-semibold uppercase tracking-wide text-[11px] text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-950/60">
            <tr
              v-for="request in requests"
              :key="request.id"
              class="hover:bg-slate-900/70"
            >
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-100">{{ request.hotel_name }}</div>
                <div class="mt-0.5 text-[11px] text-slate-400">{{ formatDate(request.created_at) }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-100">{{ request.name }}</div>
                <div class="mt-0.5 text-[11px] text-slate-400">{{ request.email }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                  :class="{
                    'bg-amber-500/20 text-amber-300 border border-amber-500/50': request.status === 'pending',
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50': request.status === 'approved',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/50': request.status === 'rejected'
                  }"
                >
                  {{ request.status }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-xs text-slate-300">
                {{ formatDate(request.created_at) }}
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-right">
                <div class="flex justify-end gap-1.5">
                  <button
                    v-if="request.status === 'pending'"
                    class="inline-flex items-center rounded-md border border-emerald-500/70 bg-emerald-900/30 px-2.5 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/50"
                    @click="approveRequest(request)"
                  >
                    Approve
                  </button>
                  <button
                    v-if="request.status === 'pending'"
                    class="inline-flex items-center rounded-md border border-rose-500/70 bg-rose-900/30 px-2.5 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-900/50"
                    @click="rejectRequest(request)"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td
                colspan="5"
                class="px-3 sm:px-4 py-4 text-center text-xs text-slate-400"
              >
                No requests found.
              </td>
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
