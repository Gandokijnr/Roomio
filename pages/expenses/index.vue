<template>
  <div class="expenses-page">
    <div class="page-header">
      <div>
        <h1>Expense Tracking</h1>
        <p>Record and manage business expenses</p>
      </div>
      <div class="header-actions">
        <NuxtLink to="/expenses/vendors" class="btn btn-secondary">
          <span class="icon">🏢</span>
          Manage Vendors
        </NuxtLink>
        <NuxtLink to="/expenses/analytics" class="btn btn-secondary">
          <span class="icon">📊</span>
          Analytics
        </NuxtLink>
        <button @click="showExpenseModal = true" class="btn btn-primary">
          <span class="icon">+</span>
          Add Expense
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <NuxtLink to="/expenses" class="tab active">
        Expenses
      </NuxtLink>
      <NuxtLink to="/expenses/vendors" class="tab">
        Vendors
      </NuxtLink>
      <NuxtLink to="/expenses/analytics" class="tab">
        Analytics
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="filters card">
      <div class="filter-group flex">
        <label>Date Range</label>
        <input type="date" v-model="filters.startDate" class="input" />
        <span>to</span>
        <input type="date" v-model="filters.endDate" class="input" />
      </div>
      <div class="filter-group">
        <label>Category</label>
        <select v-model="filters.category" class="input">
          <option value="">All Categories</option>
          <option v-for="cat in expenseCategories" :key="cat" :value="cat">
            {{ formatCategory(cat) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Payment Status</label>
        <select v-model="filters.paymentStatus" class="input">
          <option value="">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <button @click="loadExpenses" class="btn btn-secondary">Apply Filters</button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">Total Expenses (Last 30 Days)</div>
        <div class="summary-value">₦{{ formatAmount(summary.total) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Unpaid</div>
        <div class="summary-value text-error">₦{{ formatAmount(summary.unpaid) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Paid</div>
        <div class="summary-value text-success">₦{{ formatAmount(summary.paid) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Filtered Results</div>
        <div class="summary-value">{{ expenses.length }}</div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading expenses...</div>

    <div v-else-if="expenses.length === 0" class="empty-state card">
      <div class="empty-icon">💰</div>
      <h3>No expenses found</h3>
      <p>Start tracking your business expenses</p>
    </div>

    <div v-else class="expenses-table card">
      <table>
        <thead>
          <tr>
            <th>Expense #</th>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Vendor</th>
            <th>Base Amount</th>
            <th>Tax</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td class="expense-number">{{ expense.expense_number }}</td>
            <td>{{ formatDate(expense.expense_date) }}</td>
            <td>{{ formatCategory(expense.expense_category) }}</td>
            <td>{{ expense.description }}</td>
            <td>{{ expense.vendor?.vendor_name || '-' }}</td>
            <td class="amount">₦{{ expense.amount.toFixed(2) }}</td>
            <td class="amount">₦{{ expense.tax_amount.toFixed(2) }}</td>
            <td class="amount total">₦{{ expense.total_amount.toFixed(2) }}</td>
            <td>
              <span :class="['badge', `badge-${getStatusColor(expense.payment_status)}`]">
                {{ expense.payment_status }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button @click="viewExpense(expense)" class="btn-icon" title="View">👁️</button>
                <button @click="editExpense(expense)" class="btn-icon" title="Edit">✏️</button>
                <button v-if="expense.payment_status !== 'paid'" @click="markAsPaid(expense)" class="btn-icon" title="Mark as Paid">✓</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div v-if="showExpenseModal" class="modal-overlay" @click.self="closeExpenseModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}</h2>
          <button @click="closeExpenseModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveExpense">
            <div class="form-row">
              <div class="form-group">
                <label>Expense Date *</label>
                <input type="date" v-model="expenseForm.expense_date" class="input" required />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select v-model="expenseForm.expense_category" class="input" required>
                  <option value="">Select Category</option>
                  <option v-for="cat in expenseCategories" :key="cat" :value="cat">
                    {{ formatCategory(cat) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Vendor</label>
                <select v-model="expenseForm.vendor_id" class="input">
                  <option value="">Select Vendor</option>
                  <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                    {{ vendor.vendor_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Department</label>
                <input type="text" v-model="expenseForm.department" class="input" placeholder="e.g., Housekeeping" />
              </div>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea v-model="expenseForm.description" class="input" rows="3" required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Amount *</label>
                <input type="number" v-model.number="expenseForm.amount" class="input" step="0.01" required />
              </div>
              <div class="form-group">
                <label>Tax Amount</label>
                <input type="number" v-model.number="expenseForm.tax_amount" class="input" step="0.01" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Payment Method</label>
                <select v-model="expenseForm.payment_method" class="input">
                  <option value="">Not Paid Yet</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Payment Status</label>
                <select v-model="expenseForm.payment_status" class="input">
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Receipt Number</label>
                <input type="text" v-model="expenseForm.receipt_number" class="input" />
              </div>
              <div class="form-group">
                <label>Invoice Reference</label>
                <input type="text" v-model="expenseForm.invoice_reference" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" v-model="expenseForm.is_recurring" />
                Recurring Expense
              </label>
            </div>

            <div v-if="expenseForm.is_recurring" class="form-row">
              <div class="form-group">
                <label>Frequency</label>
                <select v-model="expenseForm.recurring_frequency" class="input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div class="form-group">
                <label>Next Occurrence</label>
                <input type="date" v-model="expenseForm.next_occurrence" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea v-model="expenseForm.notes" class="input" rows="2"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeExpenseModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Expense' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense, Vendor, ExpenseCategory, ExpensePaymentStatus, PaymentMethod, RecurringFrequency } from '~/types/accounting'

// Extended type for expenses with vendor relation
type ExpenseWithVendor = Expense & {
  vendor?: Vendor | null
}

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { createExpense, getExpenses, updateExpense, markAsPaid: markExpensePaid, getVendors } = useExpenseTracking()

const loading = ref(true)
const saving = ref(false)
const expenses = ref<ExpenseWithVendor[]>([])
const vendors = ref<Vendor[]>([])
const showExpenseModal = ref(false)
const editingExpense = ref<Expense | null>(null)

const expenseCategories: ExpenseCategory[] = [
  'salaries', 'utilities', 'maintenance', 'supplies', 'marketing',
  'rent', 'insurance', 'taxes', 'equipment', 'food_supplies',
  'cleaning_supplies', 'transportation', 'professional_fees', 'other'
]

// Calculate date 30 days ago
const getLast30DaysDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}

const filters = ref({
  startDate: getLast30DaysDate(),
  endDate: new Date().toISOString().split('T')[0],
  category: '' as ExpenseCategory | '',
  paymentStatus: '' as ExpensePaymentStatus | ''
})

const expenseForm = ref({
  expense_date: new Date().toISOString().split('T')[0],
  expense_category: '' as ExpenseCategory | '',
  vendor_id: '',
  amount: 0,
  tax_amount: 0,
  currency: 'NGN',
  payment_method: '' as PaymentMethod | '',
  payment_status: 'unpaid' as ExpensePaymentStatus,
  payment_date: '',
  receipt_number: '',
  invoice_reference: '',
  description: '',
  notes: '',
  is_recurring: false,
  recurring_frequency: 'monthly' as RecurringFrequency,
  next_occurrence: '',
  department: '',
  recorded_by: ''
})

// Store all expenses from last 30 days for summary (unfiltered)
const allExpensesLast30Days = ref<ExpenseWithVendor[]>([])

const summary = computed(() => {
  // Use all expenses from last 30 days for total (ignoring filters)
  const total = allExpensesLast30Days.value.reduce((sum, exp) => sum + exp.total_amount, 0)
  // Use filtered expenses for unpaid/paid
  const unpaid = expenses.value.filter(e => e.payment_status === 'unpaid' || e.payment_status === 'partial').reduce((sum, exp) => sum + exp.total_amount, 0)
  const paid = expenses.value.filter(e => e.payment_status === 'paid').reduce((sum, exp) => sum + exp.total_amount, 0)
  return { total, unpaid, paid }
})

const loadExpenses = async () => {
  try {
    loading.value = true
    
    // First, load all expenses from last 30 days for summary (unfiltered)
    const thirtyDaysAgo = getLast30DaysDate()
    const today = new Date().toISOString().split('T')[0]
    
    console.log('📅 Date range for summary:', thirtyDaysAgo, 'to', today)
    
    // Try to load with vendors first, fallback to without vendors if table doesn't exist
    let summaryQuery = `*, vendors(*)` // Try with vendor join
    let { data: summaryData, error: summaryError } = await $supabase
      .from('expenses')
      .select(summaryQuery)
      .gte('expense_date', thirtyDaysAgo)
      .lte('expense_date', today)
    
    // If vendor join fails, try without it
    if (summaryError) {
      console.warn('⚠️ Vendor table not found, loading expenses without vendor data')
      const result = await $supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', thirtyDaysAgo)
        .lte('expense_date', today)
      summaryData = result.data
      summaryError = result.error
    }
    
    if (summaryError) {
      console.error('❌ Error loading summary data:', summaryError)
    }
    
    allExpensesLast30Days.value = summaryData || []
    console.log('📊 Summary expenses loaded:', allExpensesLast30Days.value.length)
    
    // Build query with all filters for the main table
    console.log('📅 Filter date range:', filters.value.startDate, 'to', filters.value.endDate)
    
    let query = $supabase
      .from('expenses')
      .select('*, vendors(*)')
      .gte('expense_date', filters.value.startDate)
      .lte('expense_date', filters.value.endDate)
      .order('expense_date', { ascending: false })

    // Apply category filter if selected
    if (filters.value.category) {
      console.log('🏷️ Filtering by category:', filters.value.category)
      query = query.eq('expense_category', filters.value.category)
    }

    // Apply payment status filter if selected
    if (filters.value.paymentStatus) {
      console.log('💳 Filtering by status:', filters.value.paymentStatus)
      query = query.eq('payment_status', filters.value.paymentStatus)
    }

    let { data, error } = await query

    // If vendor join fails, try without it
    if (error) {
      console.warn('⚠️ Vendor join failed, retrying without vendor data')
      query = $supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', filters.value.startDate)
        .lte('expense_date', filters.value.endDate)
        .order('expense_date', { ascending: false })
      
      if (filters.value.category) {
        query = query.eq('expense_category', filters.value.category)
      }
      if (filters.value.paymentStatus) {
        query = query.eq('payment_status', filters.value.paymentStatus)
      }
      
      const result = await query
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('❌ Error loading filtered expenses:', error)
      throw error
    }

    expenses.value = data || []
    console.log('✅ Filtered expenses loaded:', expenses.value.length)
    
    if (expenses.value.length > 0) {
      console.log('📝 First expense:', expenses.value[0])
    }
    
    // Check if there are expenses in database but outside date range
    const { count } = await $supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 Total expenses in database:', count)
  } catch (error) {
    console.error('❌ Error in loadExpenses:', error)
    expenses.value = []
  } finally {
    loading.value = false
  }
}

const loadVendors = async () => {
  const { data } = await getVendors()
  if (data) vendors.value = data
}

const saveExpense = async () => {
  try {
    saving.value = true
    
    const user = await $supabase.auth.getUser()
    const userId = user.data.user?.id

    const total = expenseForm.value.amount + expenseForm.value.tax_amount

    // Prepare expense data with proper type handling
    const expenseData = {
      expense_date: expenseForm.value.expense_date,
      expense_category: expenseForm.value.expense_category as ExpenseCategory,
      vendor_id: expenseForm.value.vendor_id || undefined,
      amount: expenseForm.value.amount,
      tax_amount: expenseForm.value.tax_amount,
      total_amount: total,
      currency: expenseForm.value.currency,
      payment_method: expenseForm.value.payment_method || undefined,
      payment_status: expenseForm.value.payment_status,
      payment_date: expenseForm.value.payment_date || undefined,
      receipt_number: expenseForm.value.receipt_number || undefined,
      invoice_reference: expenseForm.value.invoice_reference || undefined,
      description: expenseForm.value.description,
      notes: expenseForm.value.notes || undefined,
      is_recurring: expenseForm.value.is_recurring,
      recurring_frequency: expenseForm.value.is_recurring ? expenseForm.value.recurring_frequency as RecurringFrequency : undefined,
      next_occurrence: expenseForm.value.next_occurrence || undefined,
      department: expenseForm.value.department || undefined
    }

    if (editingExpense.value) {
      const { error } = await updateExpense(editingExpense.value.id, expenseData)
      if (error) throw new Error(error)
    } else {
      const { error } = await createExpense({
        ...expenseData,
        recorded_by: userId || ''
      })
      if (error) throw new Error(error)
    }

    closeExpenseModal()
    await loadExpenses()
  } catch (error) {
    console.error('Error saving expense:', error)
    alert('Failed to save expense')
  } finally {
    saving.value = false
  }
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  expenseForm.value = {
    expense_date: expense.expense_date,
    expense_category: expense.expense_category,
    vendor_id: expense.vendor_id || '',
    amount: expense.amount,
    tax_amount: expense.tax_amount,
    currency: expense.currency,
    payment_method: expense.payment_method || '',
    payment_status: expense.payment_status,
    payment_date: expense.payment_date || '',
    receipt_number: expense.receipt_number || '',
    invoice_reference: expense.invoice_reference || '',
    description: expense.description,
    notes: expense.notes || '',
    is_recurring: expense.is_recurring,
    recurring_frequency: expense.recurring_frequency || 'monthly',
    next_occurrence: expense.next_occurrence || '',
    department: expense.department || '',
    recorded_by: expense.recorded_by
  }
  showExpenseModal.value = true
}

const viewExpense = (expense: Expense) => {
  // TODO: Implement view details modal
  console.log('View expense:', expense)
}

const markAsPaid = async (expense: Expense) => {
  if (!confirm('Mark this expense as paid?')) return
  
  const paymentDate = new Date().toISOString().split('T')[0]
  const { error } = await markExpensePaid(expense.id, paymentDate, 'cash')
  
  if (error) {
    alert('Failed to mark as paid')
  } else {
    await loadExpenses()
  }
}

const closeExpenseModal = () => {
  showExpenseModal.value = false
  editingExpense.value = null
  expenseForm.value = {
    expense_date: new Date().toISOString().split('T')[0],
    expense_category: '' as ExpenseCategory,
    vendor_id: '',
    amount: 0,
    tax_amount: 0,
    currency: 'NGN',
    payment_method: '',
    payment_status: 'unpaid',
    payment_date: '',
    receipt_number: '',
    invoice_reference: '',
    description: '',
    notes: '',
    is_recurring: false,
    recurring_frequency: 'monthly',
    next_occurrence: '',
    department: '',
    recorded_by: ''
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const formatCategory = (category: string) => {
  return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getStatusColor = (status: ExpensePaymentStatus) => {
  const colors: Record<ExpensePaymentStatus, string> = {
    unpaid: 'error',
    partial: 'warning',
    paid: 'success',
    overdue: 'error'
  }
  return colors[status] || 'neutral'
}

onMounted(async () => {
  await Promise.all([loadExpenses(), loadVendors()])
})
</script>

<style scoped>
.expenses-page {
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

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--neutral-200);
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  text-decoration: none;
  color: var(--neutral-600);
  font-weight: 600;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--primary-600);
  background: var(--neutral-50);
}

.tab.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  margin-bottom: var(--spacing-lg);
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.summary-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
}

.summary-label {
  font-size: 0.813rem;
  color: var(--neutral-600);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.text-error {
  color: var(--error-600);
}

.text-success {
  color: var(--success-600);
}

.loading, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.expenses-table {
  padding: 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--neutral-50);
  border-bottom: 2px solid var(--neutral-200);
}

th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  font-size: 0.813rem;
  color: var(--neutral-700);
  text-transform: uppercase;
}

tbody tr {
  border-bottom: 1px solid var(--neutral-200);
}

tbody tr:hover {
  background: var(--neutral-50);
}

td {
  padding: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.expense-number {
  font-weight: 600;
  color: var(--neutral-900);
}

.amount {
  font-weight: 600;
  color: var(--neutral-900);
  text-align: right;
}

.amount.total {
  font-weight: 700;
  color: var(--primary-700);
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--neutral-900);
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--neutral-500);
  line-height: 1;
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-700);
  margin-bottom: var(--spacing-xs);
}

.input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
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

.btn-secondary {
  background: var(--neutral-200);
  color: var(--neutral-700);
}

.btn-secondary:hover {
  background: var(--neutral-300);
}

.icon {
  margin-right: var(--spacing-xs);
}
</style>
