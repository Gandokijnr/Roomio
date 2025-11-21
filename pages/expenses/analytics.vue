<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Expense Analytics
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          Analyze spending patterns and trends
        </p>
      </div>
      <div class="w-full sm:w-auto flex justify-end">
        <button
          @click="exportReport"
          class="btn btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="card mb-6 p-4 sm:p-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <label class="text-sm font-medium text-neutral-700">Period</label>
          <select
            v-model="selectedPeriod"
            @change="updateDateRange"
            class="input w-full"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div
          v-if="selectedPeriod === 'custom'"
          class="flex flex-col gap-2 w-full sm:w-auto"
        >
          <label class="text-sm font-medium text-neutral-700">From</label>
          <input type="date" v-model="dateRange.start" class="input w-full" />
        </div>
        <div
          v-if="selectedPeriod === 'custom'"
          class="flex flex-col gap-2 w-full sm:w-auto"
        >
          <label class="text-sm font-medium text-neutral-700">To</label>
          <input type="date" v-model="dateRange.end" class="input w-full" />
        </div>
        <button
          @click="loadAnalytics"
          class="btn btn-primary mt-1 w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">
      Loading analytics...
    </div>

    <div v-else class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4 sm:p-5 flex gap-3 items-start">
          <div class="text-3xl">
            💰
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
              Total Expenses
            </div>
            <div class="text-xl font-semibold text-neutral-900">
              ₦{{ formatAmount(summary.total) }}
            </div>
            <div
              class="text-xs"
              :class="summary.totalChange >= 0 ? 'text-success-600' : 'text-error-600'"
            >
              {{ summary.totalChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.totalChange) }}% vs previous period
            </div>
          </div>
        </div>

        <div class="card p-4 sm:p-5 flex gap-3 items-start">
          <div class="text-3xl">
            📝
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
              Total Transactions
            </div>
            <div class="text-xl font-semibold text-neutral-900">
              {{ summary.count }}
            </div>
            <div class="text-xs text-neutral-600">
              {{ summary.avgPerTransaction }} avg per transaction
            </div>
          </div>
        </div>

        <div class="card p-4 sm:p-5 flex gap-3 items-start">
          <div class="text-3xl">
            ⏰
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
              Unpaid Expenses
            </div>
            <div class="text-xl font-semibold text-error-600">
              ₦{{ formatAmount(summary.unpaid) }}
            </div>
            <div class="text-xs text-neutral-600">
              {{ summary.unpaidCount }} transactions
            </div>
          </div>
        </div>

        <div class="card p-4 sm:p-5 flex gap-3 items-start">
          <div class="text-3xl">
            📈
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-xs font-medium text-neutral-600 uppercase tracking-wide">
              Average Daily
            </div>
            <div class="text-xl font-semibold text-neutral-900">
              ₦{{ formatAmount(summary.avgDaily) }}
            </div>
            <div class="text-xs text-neutral-600">
              Based on {{ summary.daysInPeriod }} days
            </div>
          </div>
        </div>
      </div>

      <!-- Expense by Category -->
      <div class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">
            Expenses by Category
          </h2>
        </div>
        <div class="card p-4 sm:p-5">
          <div
            v-for="cat in categoryBreakdown"
            :key="cat.category"
            class="py-3 border-b border-neutral-200 last:border-b-0"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="font-medium text-neutral-900">
                {{ formatCategory(cat.category) }}
              </div>
              <div class="font-semibold text-primary-600">
                ₦{{ formatAmount(cat.amount) }}
              </div>
            </div>
            <div class="h-2 bg-neutral-100 rounded-full overflow-hidden mb-1">
              <div
                class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                :style="{ width: cat.percentage + '%' }"
              ></div>
            </div>
            <div class="flex items-center justify-between text-xs text-neutral-600">
              <span>{{ cat.percentage.toFixed(1) }}%</span>
              <span>{{ cat.count }} transactions</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Vendors -->
      <div class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">
            Top Vendors by Spending
          </h2>
        </div>
        <div class="card p-4 sm:p-5">
          <div
            v-for="(vendor, index) in topVendors"
            :key="vendor.vendor_id"
            class="flex items-center gap-4 py-3 border-b border-neutral-200 last:border-b-0"
          >
            <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-neutral-900">
                {{ vendor.vendor_name }}
              </div>
              <div class="text-xs text-neutral-600">
                {{ vendor.transaction_count }} transactions
              </div>
            </div>
            <div class="font-semibold text-neutral-900 text-sm">
              ₦{{ formatAmount(vendor.total_amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Status Distribution -->
      <div class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">
            Payment Status Distribution
          </h2>
        </div>
        <div class="card p-4 sm:p-5">
          <div
            v-for="status in paymentStatusDistribution"
            :key="status.status"
            class="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <span :class="['badge', `badge-${status.status}`]">{{ status.status }}</span>
              <span class="text-sm text-neutral-600">{{ status.count }} expenses</span>
            </div>
            <div class="font-semibold text-neutral-900 text-sm">
              ₦{{ formatAmount(status.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">
            Monthly Expense Trend
          </h2>
        </div>
        <div class="card p-4 sm:p-5">
          <div class="flex gap-4 items-end h-72 py-2 overflow-x-auto">
            <div
              v-for="month in monthlyTrend"
              :key="month.month"
              class="flex-1 min-w-[64px] flex flex-col items-center gap-1"
            >
              <div class="w-full h-60 flex items-end">
                <div
                  class="w-full bg-gradient-to-b from-primary-500 to-primary-600 rounded-t-md transition-[height] duration-300 cursor-pointer hover:from-primary-600 hover:to-primary-700"
                  :style="{ height: (month.amount / maxMonthlyAmount * 100) + '%' }"
                  :title="`₦${formatAmount(month.amount)}`"
                ></div>
              </div>
              <div class="text-xs text-neutral-600 font-semibold">
                {{ month.month }}
              </div>
              <div class="text-xs text-neutral-900 font-semibold">
                ₦{{ formatAmount(month.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense, ExpenseCategory } from '~/types/accounting'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { getExpenses, getExpenseSummary } = useExpenseTracking()

const loading = ref(true)
const selectedPeriod = ref('this_month')
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})

const summary = ref({
  total: 0,
  count: 0,
  unpaid: 0,
  unpaidCount: 0,
  avgPerTransaction: 0,
  avgDaily: 0,
  daysInPeriod: 0,
  totalChange: 0
})

const categoryBreakdown = ref<Array<{
  category: string
  amount: number
  count: number
  percentage: number
}>>([])

const topVendors = ref<Array<{
  vendor_id: string
  vendor_name: string
  total_amount: number
  transaction_count: number
}>>([])

const paymentStatusDistribution = ref<Array<{
  status: string
  count: number
  amount: number
}>>([])

const monthlyTrend = ref<Array<{
  month: string
  amount: number
}>>([])

const maxMonthlyAmount = computed(() => {
  return Math.max(...monthlyTrend.value.map(m => m.amount), 1)
})

const updateDateRange = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (selectedPeriod.value) {
    case 'this_month':
      dateRange.value.start = new Date(year, month, 1).toISOString().split('T')[0]
      dateRange.value.end = new Date(year, month + 1, 0).toISOString().split('T')[0]
      break
    case 'last_month':
      dateRange.value.start = new Date(year, month - 1, 1).toISOString().split('T')[0]
      dateRange.value.end = new Date(year, month, 0).toISOString().split('T')[0]
      break
    case 'this_quarter':
      const quarter = Math.floor(month / 3)
      dateRange.value.start = new Date(year, quarter * 3, 1).toISOString().split('T')[0]
      dateRange.value.end = new Date(year, (quarter + 1) * 3, 0).toISOString().split('T')[0]
      break
    case 'this_year':
      dateRange.value.start = new Date(year, 0, 1).toISOString().split('T')[0]
      dateRange.value.end = new Date(year, 11, 31).toISOString().split('T')[0]
      break
  }

  if (selectedPeriod.value !== 'custom') {
    loadAnalytics()
  }
}

const loadAnalytics = async () => {
  try {
    loading.value = true

    // Get expenses (without vendor join due to missing FK)
    const { data: expensesData, error: expensesError } = await $supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', dateRange.value.start)
      .lte('expense_date', dateRange.value.end)

    if (expensesError) {
      console.error('Error loading expenses:', expensesError)
      loading.value = false
      return
    }

    // Get all vendors separately
    const { data: vendorsData } = await $supabase
      .from('vendors')
      .select('*')

    // Create vendor lookup map
    const vendorLookup = new Map()
    vendorsData?.forEach(v => vendorLookup.set(v.id, v))

    // Merge vendor data into expenses
    const expenses = (expensesData || []).map(exp => ({
      ...exp,
      vendors: exp.vendor_id ? vendorLookup.get(exp.vendor_id) : null
    }))

    // Calculate summary
    const total = expenses.reduce((sum, exp) => sum + exp.total_amount, 0)
    const unpaidExpenses = expenses.filter(e => e.payment_status === 'unpaid' || e.payment_status === 'partial')
    const unpaid = unpaidExpenses.reduce((sum, exp) => sum + exp.total_amount, 0)
    
    const startDate = new Date(dateRange.value.start)
    const endDate = new Date(dateRange.value.end)
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    summary.value = {
      total,
      count: expenses.length,
      unpaid,
      unpaidCount: unpaidExpenses.length,
      avgPerTransaction: expenses.length > 0 ? total / expenses.length : 0,
      avgDaily: daysInPeriod > 0 ? total / daysInPeriod : 0,
      daysInPeriod,
      totalChange: 0 // TODO: Calculate vs previous period
    }

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>()
    expenses.forEach(exp => {
      const cat = exp.expense_category
      const existing = categoryMap.get(cat) || { amount: 0, count: 0 }
      categoryMap.set(cat, {
        amount: existing.amount + exp.total_amount,
        count: existing.count + 1
      })
    })

    categoryBreakdown.value = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: (data.amount / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount)

    // Top vendors
    const vendorMap = new Map<string, { name: string; amount: number; count: number }>()
    expenses.forEach(exp => {
      // Handle vendor data - Supabase returns it as 'vendors' object
      const vendor = exp.vendors
      if (exp.vendor_id && vendor) {
        const existing = vendorMap.get(exp.vendor_id) || { name: vendor.vendor_name, amount: 0, count: 0 }
        vendorMap.set(exp.vendor_id, {
          name: vendor.vendor_name,
          amount: existing.amount + exp.total_amount,
          count: existing.count + 1
        })
      }
    })

    topVendors.value = Array.from(vendorMap.entries())
      .map(([vendor_id, data]) => ({
        vendor_id,
        vendor_name: data.name,
        total_amount: data.amount,
        transaction_count: data.count
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10)

    // Payment status distribution
    const statusMap = new Map<string, { count: number; amount: number }>()
    expenses.forEach(exp => {
      const status = exp.payment_status
      const existing = statusMap.get(status) || { count: 0, amount: 0 }
      statusMap.set(status, {
        count: existing.count + 1,
        amount: existing.amount + exp.total_amount
      })
    })

    paymentStatusDistribution.value = Array.from(statusMap.entries())
      .map(([status, data]) => ({
        status,
        count: data.count,
        amount: data.amount
      }))

    // Monthly trend (last 6 months)
    const monthlyMap = new Map<string, number>()
    expenses.forEach(exp => {
      const month = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + exp.total_amount)
    })

    monthlyTrend.value = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  // TODO: Implement export functionality
  alert('Export functionality coming soon!')
}

const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatCategory = (category: string) => {
  return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

onMounted(() => {
  updateDateRange()
})
</script>
