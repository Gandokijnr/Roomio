<template>
  <div class="super-admin-page space-y-6 lg:space-y-8">
    <header class="super-admin-header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 text-slate-100">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold">Super Admin Command Center</h1>
        <p class="mt-1 text-sm text-slate-400">Global control panel for Roomio platform owners</p>
      </div>
      <span class="super-admin-badge inline-flex items-center rounded-full border border-royal-gold-500/70 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
        Super Admin
      </span>
    </header>

    <nav class="super-admin-tabs mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1 px-1">
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'overview' }"
        type="button"
        @click="setActiveTab('overview')"
      >
        🛡️ Overview
      </button>
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'tenantsSummary' }"
        type="button"
        @click="setActiveTab('tenantsSummary')"
      >
        🏨 Tenants (Summary)
      </button>
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'tenantsDirectory' }"
        type="button"
        @click="setActiveTab('tenantsDirectory')"
      >
        📋 Tenants Directory
      </button>
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'onboardingSummary' }"
        type="button"
        @click="setActiveTab('onboardingSummary')"
      >
        📬 Onboarding (Summary)
      </button>
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'onboardingQueue' }"
        type="button"
        @click="setActiveTab('onboardingQueue')"
      >
        ✅ Onboarding Queue
      </button>
      <button
        class="tab-pill inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/80 text-slate-200 border-slate-700/70 hover:bg-slate-800/90"
        :class="{ active: activeTab === 'activity' }"
        type="button"
        @click="setActiveTab('activity')"
      >
        📣 Activity
      </button>
    </nav>

    <section
      v-if="dashboard && activeTab === 'overview'"
      class="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      <div class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Tenants</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-slate-50">
          {{ dashboard.totalTenants }}
        </p>
        <p
          v-if="dashboard.newTenantsLast30Days !== undefined"
          class="mt-1 text-xs text-slate-400"
        >
          {{ dashboard.newTenantsLast30Days }} new in last 30 days
        </p>
      </div>

      <div class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Pending Requests</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-amber-300">
          {{ dashboard.pendingRequests }}
        </p>
      </div>

      <div class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Active Users (15 min)</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-emerald-300">
          {{ dashboard.activeUsers }}
        </p>
        <p
          v-if="dashboard.churnRateLast30Days !== undefined"
          class="mt-1 text-xs text-slate-400"
        >
          Churn 30d: {{ (dashboard.churnRateLast30Days * 100).toFixed(1) }}%
        </p>
      </div>

      <div
        v-if="dashboard.mrr !== undefined"
        class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Monthly Recurring Revenue</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-emerald-300">
          ${{ dashboard.mrr.toLocaleString() }}
        </p>
      </div>

      <div
        v-if="dashboard.totalRooms !== undefined"
        class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rooms Managed</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-slate-50">
          {{ dashboard.totalRooms }}
        </p>
        <p
          v-if="dashboard.totalInventoryItems !== undefined"
          class="mt-1 text-xs text-slate-400"
        >
          {{ dashboard.totalInventoryItems }} inventory items
        </p>
      </div>

      <div class="rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
        :class="dashboard.systemHealth.status === 'green'
          ? 'border-emerald-500/60 bg-emerald-950/40'
          : 'border-rose-500/60 bg-rose-950/40'"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">System Health</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold">
          <span v-if="dashboard.systemHealth.status === 'green'" class="text-emerald-300">Green</span>
          <span v-else class="text-rose-300">Red</span>
        </p>
        <p class="mt-1 text-xs text-slate-200">
          {{ dashboard.systemHealth.errorCountLastHour }} errors in last hour
          <span v-if="dashboard.systemHealth.errorRateLast24h !== undefined">
            · {{ (dashboard.systemHealth.errorRateLast24h * 100).toFixed(1) }}% last 24h
          </span>
        </p>
      </div>

      <div
        v-if="billingMetrics && billingMetrics.billing_hold_count !== undefined"
        class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Hotels in Billing Hold</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-amber-300">
          {{ billingMetrics.billing_hold_count }}
        </p>
      </div>

      <div
        v-if="billingMetrics && billingMetrics.payment_stats_24h"
        class="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Paystack Success Rate (24h)</p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold text-emerald-300">
          {{ billingMetrics.payment_stats_24h.success_rate.toFixed(1) }}%
        </p>
        <p class="mt-1 text-xs text-slate-400">
          {{ billingMetrics.payment_stats_24h.successes }} success ·
          {{ billingMetrics.payment_stats_24h.failures }} failed
        </p>
      </div>
    </section>

    <section
      v-if="activeTab === 'tenantsSummary'"
      class="grid gap-5 lg:grid-cols-2"
    >
      <div class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm">
        <div class="border-b border-slate-200 px-4 sm:px-5 py-3">
          <h2 class="text-sm font-semibold text-slate-900">Tenant Status Overview</h2>
          <p class="mt-0.5 text-xs text-slate-500">High-level snapshot of all hotels on the platform.</p>
        </div>
        <div class="px-4 sm:px-5 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Total Tenants</span>
            <span class="block text-base font-semibold text-slate-900">{{ dashboard?.totalTenants ?? tenants.length }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Active</span>
            <span class="block text-base font-semibold text-emerald-600">{{ tenantCountsByStatus.active || 0 }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Trial</span>
            <span class="block text-base font-semibold text-amber-600">{{ tenantCountsByStatus.trial || 0 }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Pending</span>
            <span class="block text-base font-semibold text-sky-600">{{ tenantCountsByStatus.pending || 0 }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Suspended</span>
            <span class="block text-base font-semibold text-rose-600">{{ tenantCountsByStatus.suspended || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm flex flex-col">
        <div class="border-b border-slate-200 px-4 sm:px-5 py-3">
          <h2 class="text-sm font-semibold text-slate-900">Plans Mix</h2>
          <p class="mt-0.5 text-xs text-slate-500">Distribution of subscription plans across tenants.</p>
        </div>
        <div class="px-4 sm:px-5 py-3 flex flex-wrap gap-3">
          <div
            v-for="(count, plan) in tenantCountsByPlan"
            :key="plan"
            class="rounded-lg border border-slate-200 px-3 py-2 flex flex-col gap-1 min-w-[7rem]"
          >
            <span class="text-[11px] font-medium text-slate-600 truncate">{{ plan }}</span>
            <span class="text-base font-semibold text-slate-900">{{ count }}</span>
          </div>
          <div
            v-if="Object.keys(tenantCountsByPlan).length === 0"
            class="w-full text-center text-xs text-slate-500 py-4"
          >
            No tenants loaded yet.
          </div>
        </div>
      </div>
    </section>


    <section
      v-if="activeTab === 'tenantsDirectory'"
      id="tenants-directory"
      class="card tenants-card rounded-xl border border-slate-200/80 bg-white/95 shadow-sm overflow-hidden"
    >
      <header class="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50/80">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Tenants</h2>
          <p class="mt-0.5 text-xs text-slate-500">Manage all hotels on the platform</p>
        </div>
        <div class="card-filters flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
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
            class="filter-input w-full sm:w-auto"
            type="search"
            placeholder="Search hotels or contacts..."
          />
          <button class="btn w-full sm:w-auto" @click="loadTenants">Refresh</button>
        </div>
      </header>

      <div class="table-wrapper overflow-x-auto">
        <table class="min-w-full text-xs text-slate-700">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Hotel Name</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Primary Contact</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Plan</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Status</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Date Joined</th>
              <th class="px-3 sm:px-4 py-2" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="tenant in tenants"
              :key="tenant.id"
              class="hover:bg-slate-50 cursor-pointer"
              :class="{ 'bg-slate-50/80': selectedTenant && selectedTenant.id === tenant.id }"
              @click="selectTenant(tenant)"
            >
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-900">{{ tenant.name }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-900">{{ tenant.primary_contact_name || '-' }}</div>
                <div class="mt-0.5 text-[11px] text-slate-500">{{ tenant.primary_contact_email }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-xs text-slate-700">
                {{ tenant.subscription_plan }}
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                  :class="{
                    'bg-emerald-50 text-emerald-700': tenant.status === 'active',
                    'bg-amber-50 text-amber-700': tenant.status === 'trial',
                    'bg-sky-50 text-sky-700': tenant.status === 'pending',
                    'bg-rose-50 text-rose-700': tenant.status === 'suspended'
                  }"
                >
                  {{ tenant.status }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-xs text-slate-700">
                {{ formatDate(tenant.date_joined || tenant.created_at) }}
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-right">
                <NuxtLink
                  class="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  :to="`/admin/super/tenants/${tenant.id}`"
                  @click.stop
                >
                  View
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td
                colspan="6"
                class="px-3 sm:px-4 py-4 text-center text-xs text-slate-500"
              >
                No tenants found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer
        v-if="selectedTenant"
        class="tenant-detail border-t border-slate-200 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/60"
      >
        <div class="detail-main">
          <h3 class="text-sm font-semibold text-slate-900">{{ selectedTenant.name }}</h3>
          <p class="mt-0.5 text-xs text-slate-600">
            {{ selectedTenant.primary_contact_name }}
            <span v-if="selectedTenant.primary_contact_email">
              · {{ selectedTenant.primary_contact_email }}
            </span>
          </p>
          <div class="detail-stats mt-2 flex flex-wrap gap-4">
            <div class="space-y-0.5">
              <span class="label block text-[11px] text-slate-500 uppercase tracking-wide">Rooms Defined</span>
              <span class="value block text-sm font-medium text-slate-900">{{ selectedTenant.rooms_defined ?? 0 }}</span>
            </div>
            <div class="space-y-0.5">
              <span class="label block text-[11px] text-slate-500 uppercase tracking-wide">Storage Used</span>
              <span class="value block text-sm font-medium text-slate-900">{{ (selectedTenant.storage_used_mb ?? 0).toFixed(1) }} MB</span>
            </div>
            <div class="space-y-0.5">
              <span class="label block text-[11px] text-slate-500 uppercase tracking-wide">Last Active</span>
              <span class="value block text-sm font-medium text-slate-900">{{ formatDateTime(selectedTenant.last_active_at) }}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button class="btn subtle w-full sm:w-auto" @click="impersonateTenant" disabled>
            Impersonate (coming soon)
          </button>
          <button class="btn w-full sm:w-auto" @click="openUpdateTenant('update_plan')">
            Change Plan
          </button>
          <button
            class="btn danger w-full sm:w-auto"
            @click="openUpdateTenant('update_status')"
          >
            {{ selectedTenant.status === 'suspended' ? 'Activate Tenant' : 'Suspend Tenant' }}
          </button>
        </div>
      </footer>
    </section>

    <section
      v-if="activeTab === 'onboardingSummary'"
      class="grid gap-5 lg:grid-cols-2"
    >
      <div class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm">
        <div class="border-b border-slate-200 px-4 sm:px-5 py-3">
          <h2 class="text-sm font-semibold text-slate-900">Onboarding Funnel</h2>
          <p class="mt-0.5 text-xs text-slate-500">Pipeline of access requests from the landing page.</p>
        </div>
        <div class="px-4 sm:px-5 py-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Total Requests</span>
            <span class="block text-base font-semibold text-slate-900">{{ requests.length }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Pending</span>
            <span class="block text-base font-semibold text-amber-600">{{ onboardingCounts.pending }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Approved</span>
            <span class="block text-base font-semibold text-emerald-600">{{ onboardingCounts.approved }}</span>
          </div>
          <div class="space-y-0.5">
            <span class="block text-[11px] text-slate-500 uppercase tracking-wide">Rejected</span>
            <span class="block text-base font-semibold text-rose-600">{{ onboardingCounts.rejected }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm flex flex-col">
        <div class="border-b border-slate-200 px-4 sm:px-5 py-3">
          <h2 class="text-sm font-semibold text-slate-900">Recent Requests</h2>
          <p class="mt-0.5 text-xs text-slate-500">Most recent hotels that requested access.</p>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="request in requests.slice(0, 5)"
            :key="request.id"
            class="px-4 sm:px-5 py-2.5"
          >
            <div class="text-xs font-medium text-slate-900">{{ request.hotel_name }}</div>
            <div class="mt-0.5 text-[11px] text-slate-500">
              {{ request.name }} · {{ formatDate(request.created_at) }} · {{ request.status }}
            </div>
          </li>
          <li
            v-if="requests.length === 0"
            class="px-4 sm:px-5 py-4 text-center text-xs text-slate-500"
          >
            No requests yet.
          </li>
        </ul>
      </div>
    </section>

    <section
      v-if="activeTab === 'onboardingQueue'"
      class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm flex flex-col"
    >
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-slate-200">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Registration Requests</h2>
          <p class="mt-0.5 text-xs text-slate-500">Invite-only and approval queue</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <select
            v-model="requestStatus"
            @change="loadRequests"
            class="w-full sm:w-auto rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-royal-gold-500 focus:ring-royal-gold-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
            @click="loadRequests"
          >
            Refresh
          </button>
        </div>
      </header>

      <div class="max-h-72 overflow-auto">
        <table class="min-w-full text-xs text-slate-700">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Hotel</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Contact</th>
              <th class="px-3 sm:px-4 py-2 text-left font-semibold uppercase tracking-wide text-[11px] text-slate-500">Status</th>
              <th class="px-3 sm:px-4 py-2 text-right font-semibold uppercase tracking-wide text-[11px] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="request in requests" :key="request.id">
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-900">{{ request.hotel_name }}</div>
                <div class="mt-0.5 text-[11px] text-slate-500">{{ formatDate(request.created_at) }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <div class="text-xs font-medium text-slate-900">{{ request.name }}</div>
                <div class="mt-0.5 text-[11px] text-slate-500">{{ request.email }}</div>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                  :class="{
                    'bg-amber-50 text-amber-700': request.status === 'pending',
                    'bg-emerald-50 text-emerald-700': request.status === 'approved',
                    'bg-rose-50 text-rose-700': request.status === 'rejected'
                  }"
                >
                  {{ request.status }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 align-top text-right">
                <div class="flex justify-end gap-1.5">
                  <button
                    v-if="request.status === 'pending'"
                    class="inline-flex items-center rounded-md border border-emerald-500/70 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                    @click="approveRequest(request)"
                  >
                    Approve
                  </button>
                  <button
                    v-if="request.status === 'pending'"
                    class="inline-flex items-center rounded-md border border-rose-500/70 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                    @click="rejectRequest(request)"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td
                colspan="4"
                class="px-3 sm:px-4 py-4 text-center text-xs text-slate-500"
              >
                No requests found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-if="activeTab === 'activity'"
      class="rounded-xl border border-slate-200/70 bg-white/95 shadow-sm flex flex-col"
    >
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-slate-200">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Global Activity</h2>
          <p class="mt-0.5 text-xs text-slate-500">High-level events across the platform</p>
        </div>
        <button
          class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
          @click="loadActivity"
        >
          Refresh
        </button>
      </header>

      <div class="max-h-72 overflow-auto px-3 sm:px-4 py-3 space-y-2.5">
        <span id="analytics" class="sr-only">Analytics anchor</span>
        <div
          v-for="event in activity"
          :key="event.id"
          class="flex gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
        >
          <div
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            :class="{
              'bg-rose-50 text-rose-700': event.type === 'system_error',
              'bg-emerald-50 text-emerald-700': event.type === 'tenant_created',
              'bg-slate-200 text-slate-800': event.type !== 'system_error' && event.type !== 'tenant_created'
            }"
          >
            {{ event.type }}
          </div>
          <div class="flex flex-col">
            <div class="text-xs font-medium text-slate-900">{{ event.title }}</div>
            <div class="mt-0.5 text-[11px] text-slate-500 flex flex-wrap gap-x-2">
              <span>{{ formatDateTime(event.created_at) }}</span>
              <span v-if="event.metadata?.hotel_name">
                · {{ event.metadata.hotel_name }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-if="activity.length === 0"
          class="px-3 py-4 text-center text-xs text-slate-500"
        >
          No recent activity.
        </div>
      </div>
    </section>

    <div
      v-if="showUpdateModal && selectedTenant"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
    >
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl">
        <div class="px-4 sm:px-5 pt-4 pb-2">
          <h3 class="text-sm font-semibold text-slate-900">Update Tenant</h3>
          <p v-if="updateAction === 'update_status'" class="mt-1 text-xs text-slate-600">
            Change status for <span class="font-semibold">{{ selectedTenant.name }}</span>
          </p>
          <p v-else class="mt-1 text-xs text-slate-600">
            Change subscription plan for <span class="font-semibold">{{ selectedTenant.name }}</span>
          </p>
        </div>

        <div class="px-4 sm:px-5 pb-3 space-y-3 text-xs">
          <div v-if="updateAction === 'update_status'" class="space-y-1">
            <label class="block text-[11px] font-medium text-slate-600">Status</label>
            <select
              v-model="updateStatus"
              class="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-royal-gold-500 focus:ring-royal-gold-500"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div v-else class="space-y-1">
            <label class="block text-[11px] font-medium text-slate-600">Plan</label>
            <input
              v-model="updatePlan"
              class="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-royal-gold-500 focus:ring-royal-gold-500"
              placeholder="e.g. trial, starter, growth"
            />
          </div>
          <div class="space-y-1">
            <label class="block text-[11px] font-medium text-slate-600">Notes (optional)</label>
            <textarea
              v-model="updateNotes"
              rows="3"
              class="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-royal-gold-500 focus:ring-royal-gold-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-4 sm:px-5 py-2.5">
          <button
            class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="closeUpdateModal"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md border border-royal-gold-500 bg-royal-gold-500 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-royal-gold-600 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="submitUpdate"
            :disabled="updating"
          >
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

interface BillingMetrics {
  billing_hold_count: number
  payment_stats_24h: {
    successes: number
    failures: number
    total: number
    success_rate: number
  }
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
const loadingBillingMetrics = ref(false)
const loadingTenants = ref(false)
const loadingRequests = ref(false)
const loadingActivity = ref(false)

const dashboard = ref<DashboardData | null>(null)
const billingMetrics = ref<BillingMetrics | null>(null)

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

const loadBillingMetrics = async () => {
  if (!authToken.value) return
  loadingBillingMetrics.value = true
  try {
    const { data: res } = await $axios.get('/api/super/billing-metrics', {
      headers: authHeaders.value
    })
    if (res && res.success) {
      billingMetrics.value = res.data as BillingMetrics
    }
  } catch (error) {
    console.error('Failed to load billing metrics:', error)
  } finally {
    loadingBillingMetrics.value = false
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
    loadBillingMetrics(),
    loadTenants(),
    loadRequests(),
    loadActivity()
  ])
})
</script>
