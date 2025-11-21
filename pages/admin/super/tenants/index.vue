<template>
  <div class="space-y-6 lg:space-y-8">
    <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 text-slate-100">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold">Tenants</h1>
        <p class="mt-1 text-sm text-slate-400">Manage all hotels on the Roomio platform</p>
      </div>
    </header>

    <section class="rounded-xl border border-slate-700/70 bg-slate-950/80 shadow-sm flex flex-col">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-slate-700/70 bg-slate-900/80">
        <div>
          <h2 class="text-sm font-semibold text-slate-100">Tenant Directory</h2>
          <p class="mt-0.5 text-xs text-slate-400">Search, filter and drill into individual tenants</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <select
            v-model="tenantStatus"
            @change="loadTenants"
            class="w-full sm:w-auto rounded-md border border-slate-500/70 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:border-royal-gold-500 focus:ring-royal-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            v-model="tenantSearch"
            @keyup.enter="loadTenants"
            class="w-full sm:w-auto rounded-md border border-slate-500/70 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:border-royal-gold-500 focus:ring-royal-gold-500"
            type="search"
            placeholder="Search hotels or contacts..."
          />
          <button
            class="inline-flex items-center justify-center rounded-md border border-slate-500/70 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 w-full sm:w-auto"
            @click="loadTenants"
          >
            Refresh
          </button>
        </div>
      </header>

      <div class="max-h-[28rem] overflow-auto">
        <table class="min-w-full text-xs text-slate-200">
          <thead class="bg-slate-900/80 border-b border-slate-700/70">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Hotel Name</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Primary Contact</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Plan</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Status</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-300">Date Joined</th>
              <th class="px-3 sm:px-4 py-2" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-950/60">
            <tr
              v-for="tenant in tenants"
              :key="tenant.id"
              class="hover:bg-slate-900/70"
            >
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-100">{{ tenant.name }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-100">{{ tenant.primary_contact_name || '-' }}</div>
                <div class="mt-0.5 text-[11px] text-slate-400">{{ tenant.primary_contact_email }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-xs text-slate-300">
                {{ tenant.subscription_plan }}
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                  :class="{
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50': tenant.status === 'active',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/50': tenant.status === 'trial',
                    'bg-sky-500/20 text-sky-300 border border-sky-500/50': tenant.status === 'pending',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/50': tenant.status === 'suspended'
                  }"
                >
                  {{ tenant.status }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-xs text-slate-300">
                {{ formatDate(tenant.date_joined || tenant.created_at) }}
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-right">
                <NuxtLink
                  class="inline-flex items-center rounded-md border border-slate-500/70 bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
                  :to="`/admin/super/tenants/${tenant.id}`"
                >
                  View
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td
                colspan="6"
                class="px-3 sm:px-4 py-4 text-center text-xs text-slate-400"
              >
                No tenants found.
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
