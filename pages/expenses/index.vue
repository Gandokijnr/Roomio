<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Expense Tracking
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          Record and manage business expenses
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <NuxtLink
          to="/expenses/vendors"
          class="btn btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <span>🏢</span>
          <span>Manage Vendors</span>
        </NuxtLink>
        <NuxtLink
          to="/expenses/analytics"
          class="btn btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>Analytics</span>
        </NuxtLink>
        <button
          @click="showExpenseModal = true"
          class="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span>Add Expense</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex flex-wrap gap-2 mb-6 border-b border-neutral-200">
      <NuxtLink
        to="/expenses"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-primary-500 text-primary-700 bg-white"
      >
        Expenses
      </NuxtLink>
      <NuxtLink
        to="/expenses/vendors"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
      >
        Vendors
      </NuxtLink>
      <NuxtLink
        to="/expenses/analytics"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
      >
        Analytics
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="card mb-6 p-4 sm:p-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Date Range</label>
          <div class="flex items-center gap-2 md:flex-row flex-col">
            <input type="date" v-model="filters.startDate" class="input w-full" />
            <span class="text-xs text-neutral-500">to</span>
            <input type="date" v-model="filters.endDate" class="input w-full" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Category</label>
          <select v-model="filters.category" class="input w-full sm:min-w-[180px]">
            <option value="">All Categories</option>
            <option v-for="cat in expenseCategories" :key="cat" :value="cat">
              {{ formatCategory(cat) }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Payment Status</label>
          <select v-model="filters.paymentStatus" class="input w-full sm:min-w-[160px]">
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button
          @click="loadExpenses"
          class="btn btn-secondary mt-1 w-full sm:w-auto"
        >
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="card p-4 sm:p-5">
        <div class="text-xs font-medium text-neutral-600 mb-1">
          Total Expenses (Last 30 Days)
        </div>
        <div class="text-xl font-semibold text-neutral-900">
          ₦{{ formatAmount(summary.total) }}
        </div>
      </div>
      <div class="card p-4 sm:p-5">
        <div class="text-xs font-medium text-neutral-600 mb-1">
          Unpaid
        </div>
        <div class="text-xl font-semibold text-error-600">
          ₦{{ formatAmount(summary.unpaid) }}
        </div>
      </div>
      <div class="card p-4 sm:p-5">
        <div class="text-xs font-medium text-neutral-600 mb-1">
          Paid
        </div>
        <div class="text-xl font-semibold text-success-600">
          ₦{{ formatAmount(summary.paid) }}
        </div>
      </div>
      <div class="card p-4 sm:p-5">
        <div class="text-xs font-medium text-neutral-600 mb-1">
          Filtered Results
        </div>
        <div class="text-xl font-semibold text-neutral-900">
          {{ expenses.length }}
        </div>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">
      Loading expenses...
    </div>

    <div
      v-else-if="expenses.length === 0"
      class="card py-12 px-6 text-center"
    >
      <div class="text-5xl mb-4">💰</div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-2">
        No expenses found
      </h3>
      <p class="text-sm text-neutral-600">
        Start tracking your business expenses
      </p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Expense #
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Category
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Description
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Vendor
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Base Amount
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Tax
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Total Amount
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-100">
            <tr
              v-for="expense in expenses"
              :key="expense.id"
              class="hover:bg-neutral-50"
            >
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 whitespace-nowrap">
                {{ expense.expense_number }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ formatDate(expense.expense_date) }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ formatCategory(expense.expense_category) }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700">
                {{ expense.description }}
              </td>
              <td class="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                {{ expense.vendor?.vendor_name || '-' }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 text-right whitespace-nowrap">
                ₦{{ expense.amount.toFixed(2) }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-neutral-900 text-right whitespace-nowrap">
                ₦{{ expense.tax_amount.toFixed(2) }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-primary-700 text-right whitespace-nowrap">
                ₦{{ expense.total_amount.toFixed(2) }}
              </td>
              <td class="px-4 py-3">
                <span :class="['badge', `badge-${getStatusColor(expense.payment_status)}`]">
                  {{ expense.payment_status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="viewExpense(expense)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    @click="editExpense(expense)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="expense.payment_status !== 'paid'"
                    @click="markAsPaid(expense)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-base hover:bg-neutral-200 hover:scale-110 transition transform duration-150"
                    title="Mark as Paid"
                  >
                    ✓
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div
      v-if="showExpenseModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 sm:px-6 py-4 sm:py-8"
      @click.self="closeExpenseModal"
    >
      <div class="card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
        <div class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900 sm:text-xl">
            {{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}
          </h2>
          <button
            @click="closeExpenseModal"
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 text-xl leading-none hover:bg-neutral-200 transition"
          >
            ×
          </button>
        </div>
        <div class="px-4 py-4 sm:px-6 sm:py-5">
          <form @submit.prevent="saveExpense" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Expense Date *</label>
                <input
                  type="date"
                  v-model="expenseForm.expense_date"
                  class="input w-full"
                  required
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Category *</label>
                <select
                  v-model="expenseForm.expense_category"
                  class="input w-full"
                  required
                >
                  <option value="">Select Category</option>
                  <option v-for="cat in expenseCategories" :key="cat" :value="cat">
                    {{ formatCategory(cat) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Vendor</label>
                <select v-model="expenseForm.vendor_id" class="input w-full">
                  <option value="">Select Vendor</option>
                  <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                    {{ vendor.vendor_name }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Department</label>
                <input
                  type="text"
                  v-model="expenseForm.department"
                  class="input w-full"
                  placeholder="e.g., Housekeeping"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Description *</label>
              <textarea
                v-model="expenseForm.description"
                class="input w-full resize-y"
                rows="3"
                required
              ></textarea>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Amount *</label>
                <input
                  type="number"
                  v-model.number="expenseForm.amount"
                  class="input w-full"
                  step="0.01"
                  required
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Tax Amount</label>
                <input
                  type="number"
                  v-model.number="expenseForm.tax_amount"
                  class="input w-full"
                  step="0.01"
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Payment Method</label>
                <select v-model="expenseForm.payment_method" class="input w-full">
                  <option value="">Not Paid Yet</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Payment Status</label>
                <select v-model="expenseForm.payment_status" class="input w-full">
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Receipt Number</label>
                <input type="text" v-model="expenseForm.receipt_number" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Invoice Reference</label>
                <input type="text" v-model="expenseForm.invoice_reference" class="input w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                <input type="checkbox" v-model="expenseForm.is_recurring" />
                Recurring Expense
              </label>
            </div>

            <div v-if="expenseForm.is_recurring" class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Frequency</label>
                <select v-model="expenseForm.recurring_frequency" class="input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Next Occurrence</label>
                <input type="date" v-model="expenseForm.next_occurrence" class="input w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Notes</label>
              <textarea v-model="expenseForm.notes" class="input w-full resize-y" rows="2"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-4 mt-2 border-t border-neutral-200">
              <button
                type="button"
                @click="closeExpenseModal"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="saving"
              >
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
