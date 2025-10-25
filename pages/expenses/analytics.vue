<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <h1>Expense Analytics</h1>
        <p>Analyze spending patterns and trends</p>
      </div>
      <div class="header-actions">
        <button @click="exportReport" class="btn btn-outline">
          📊 Export Report
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="filters card">
      <div class="filter-group">
        <label>Period</label>
        <select v-model="selectedPeriod" @change="updateDateRange" class="input">
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_quarter">This Quarter</option>
          <option value="this_year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      <div v-if="selectedPeriod === 'custom'" class="filter-group">
        <label>From</label>
        <input type="date" v-model="dateRange.start" class="input" />
      </div>
      <div v-if="selectedPeriod === 'custom'" class="filter-group">
        <label>To</label>
        <input type="date" v-model="dateRange.end" class="input" />
      </div>
      <button @click="loadAnalytics" class="btn btn-primary">Refresh</button>
    </div>

    <div v-if="loading" class="loading">Loading analytics...</div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">💰</div>
          <div class="summary-content">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value">₦{{ formatAmount(summary.total) }}</div>
            <div class="summary-change" :class="summary.totalChange >= 0 ? 'positive' : 'negative'">
              {{ summary.totalChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.totalChange) }}% vs previous period
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📝</div>
          <div class="summary-content">
            <div class="summary-label">Total Transactions</div>
            <div class="summary-value">{{ summary.count }}</div>
            <div class="summary-change">{{ summary.avgPerTransaction }} avg per transaction</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">⏰</div>
          <div class="summary-content">
            <div class="summary-label">Unpaid Expenses</div>
            <div class="summary-value text-error">₦{{ formatAmount(summary.unpaid) }}</div>
            <div class="summary-change">{{ summary.unpaidCount }} transactions</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📈</div>
          <div class="summary-content">
            <div class="summary-label">Average Daily</div>
            <div class="summary-value">₦{{ formatAmount(summary.avgDaily) }}</div>
            <div class="summary-change">Based on {{ summary.daysInPeriod }} days</div>
          </div>
        </div>
      </div>

      <!-- Expense by Category -->
      <div class="analytics-section">
        <div class="section-header">
          <h2>Expenses by Category</h2>
        </div>
        <div class="category-breakdown card">
          <div v-for="cat in categoryBreakdown" :key="cat.category" class="category-item">
            <div class="category-info">
              <div class="category-name">{{ formatCategory(cat.category) }}</div>
              <div class="category-amount">₦{{ formatAmount(cat.amount) }}</div>
            </div>
            <div class="category-bar">
              <div class="category-bar-fill" :style="{ width: cat.percentage + '%' }"></div>
            </div>
            <div class="category-stats">
              <span>{{ cat.percentage.toFixed(1) }}%</span>
              <span>{{ cat.count }} transactions</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Vendors -->
      <div class="analytics-section">
        <div class="section-header">
          <h2>Top Vendors by Spending</h2>
        </div>
        <div class="vendors-list card">
          <div v-for="(vendor, index) in topVendors" :key="vendor.vendor_id" class="vendor-item">
            <div class="vendor-rank">{{ index + 1 }}</div>
            <div class="vendor-info">
              <div class="vendor-name">{{ vendor.vendor_name }}</div>
              <div class="vendor-meta">{{ vendor.transaction_count }} transactions</div>
            </div>
            <div class="vendor-amount">₦{{ formatAmount(vendor.total_amount) }}</div>
          </div>
        </div>
      </div>

      <!-- Payment Status Distribution -->
      <div class="analytics-section">
        <div class="section-header">
          <h2>Payment Status Distribution</h2>
        </div>
        <div class="status-distribution card">
          <div v-for="status in paymentStatusDistribution" :key="status.status" class="status-item">
            <div class="status-info">
              <span :class="['status-badge', `badge-${status.status}`]">{{ status.status }}</span>
              <span class="status-count">{{ status.count }} expenses</span>
            </div>
            <div class="status-amount">₦{{ formatAmount(status.amount) }}</div>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="analytics-section">
        <div class="section-header">
          <h2>Monthly Expense Trend</h2>
        </div>
        <div class="trend-chart card">
          <div class="chart-container">
            <div v-for="month in monthlyTrend" :key="month.month" class="chart-bar">
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ height: (month.amount / maxMonthlyAmount * 100) + '%' }"
                  :title="`₦${formatAmount(month.amount)}`"
                ></div>
              </div>
              <div class="bar-label">{{ month.month }}</div>
              <div class="bar-value">₦{{ formatAmount(month.amount) }}</div>
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

<style scoped>
.analytics-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.filters {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--neutral-700);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.summary-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
  display: flex;
  gap: var(--spacing-md);
}

.summary-icon {
  font-size: 2.5rem;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 0.813rem;
  color: var(--neutral-600);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.summary-change {
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.summary-change.positive {
  color: var(--success-600);
}

.summary-change.negative {
  color: var(--error-600);
}

.text-error {
  color: var(--error-600);
}

.analytics-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  margin-bottom: var(--spacing-md);
}

.section-header h2 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  font-weight: 600;
}

.category-breakdown {
  padding: var(--spacing-lg);
}

.category-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--neutral-200);
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.category-name {
  font-weight: 600;
  color: var(--neutral-900);
}

.category-amount {
  font-weight: 700;
  color: var(--primary-600);
}

.category-bar {
  height: 8px;
  background: var(--neutral-100);
  border-radius: var(--radius-full);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
}

.category-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
  transition: width 0.3s ease;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.vendors-list {
  padding: var(--spacing-lg);
}

.vendor-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--neutral-200);
}

.vendor-item:last-child {
  border-bottom: none;
}

.vendor-rank {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.vendor-meta {
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.vendor-amount {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--neutral-900);
}

.status-distribution {
  padding: var(--spacing-lg);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--neutral-200);
}

.status-item:last-child {
  border-bottom: none;
}

.status-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-unpaid {
  background: var(--error-100);
  color: var(--error-700);
}

.badge-partial {
  background: var(--warning-100);
  color: var(--warning-700);
}

.badge-paid {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-overdue {
  background: var(--error-100);
  color: var(--error-700);
}

.status-count {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.status-amount {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--neutral-900);
}

.trend-chart {
  padding: var(--spacing-lg);
}

.chart-container {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  height: 300px;
  padding: var(--spacing-md) 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.bar-container {
  width: 100%;
  height: 250px;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: height 0.3s ease;
  cursor: pointer;
}

.bar-fill:hover {
  background: linear-gradient(180deg, var(--primary-600), var(--primary-700));
}

.bar-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
  font-weight: 600;
}

.bar-value {
  font-size: 0.75rem;
  color: var(--neutral-900);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
}

.input {
  padding: var(--spacing-sm);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: var(--primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-700);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--neutral-300);
  color: var(--neutral-700);
}

.btn-outline:hover {
  background: var(--neutral-50);
}
</style>
