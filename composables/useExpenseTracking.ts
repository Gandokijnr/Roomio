import type {
  Expense,
  Vendor,
  ExpenseCategory,
  ExpensePaymentStatus,
  VendorType
} from '~/types/accounting'

export const useExpenseTracking = () => {
  const { $supabase } = useNuxtApp()

  /**
   * Create expense record
   */
  const createExpense = async (
    expense: Omit<Expense, 'id' | 'expense_number' | 'created_at' | 'updated_at'>
  ): Promise<{ data?: Expense; error?: string }> => {
    try {
      // Generate expense number
      const expenseNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const { data, error } = await $supabase
        .from('expenses')
        .insert([{
          expense_number: expenseNumber,
          ...expense
        }])
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (error: any) {
      console.error('Create expense error:', error)
      return { error: error.message || 'Failed to create expense' }
    }
  }

  /**
   * Get expense by ID
   */
  const getExpense = async (
    expenseId: string
  ): Promise<{ data?: Expense; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single()

      if (error) throw error

      return { data }
    } catch (error: any) {
      console.error('Get expense error:', error)
      return { error: error.message || 'Failed to get expense' }
    }
  }

  /**
   * Get expenses for a period
   */
  const getExpenses = async (
    startDate: string,
    endDate: string,
    category?: ExpenseCategory
  ): Promise<{ data?: Expense[]; error?: string }> => {
    try {
      let query = $supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)

      if (category) {
        query = query.eq('expense_category', category)
      }

      const { data, error } = await query.order('expense_date', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get expenses error:', error)
      return { error: error.message || 'Failed to get expenses' }
    }
  }

  /**
   * Update expense
   */
  const updateExpense = async (
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await $supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Update expense error:', error)
      return { success: false, error: error.message || 'Failed to update expense' }
    }
  }

  /**
   * Mark expense as paid
   */
  const markAsPaid = async (
    expenseId: string,
    paymentDate: string,
    paymentMethod: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await $supabase
        .from('expenses')
        .update({
          payment_status: 'paid',
          payment_date: paymentDate,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Mark as paid error:', error)
      return { success: false, error: error.message || 'Failed to mark as paid' }
    }
  }

  /**
   * Get expense summary by category
   */
  const getExpenseSummary = async (
    startDate: string,
    endDate: string
  ): Promise<{ 
    data?: {
      total: number
      by_category: Record<ExpenseCategory, number>
      by_status: Record<ExpensePaymentStatus, number>
      count: number
    }
    error?: string 
  }> => {
    try {
      const { data, error } = await $supabase
        .from('expenses')
        .select('total_amount, expense_category, payment_status')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)

      if (error) throw error

      const summary = {
        total: data.reduce((sum, exp) => sum + (exp.total_amount || 0), 0),
        by_category: {} as Record<ExpenseCategory, number>,
        by_status: {} as Record<ExpensePaymentStatus, number>,
        count: data.length
      }

      data.forEach(exp => {
        if (exp.expense_category) {
          const cat = exp.expense_category as ExpenseCategory
          summary.by_category[cat] = (summary.by_category[cat] || 0) + exp.total_amount
        }
        if (exp.payment_status) {
          const status = exp.payment_status as ExpensePaymentStatus
          summary.by_status[status] = (summary.by_status[status] || 0) + exp.total_amount
        }
      })

      return { data: summary }
    } catch (error: any) {
      console.error('Get expense summary error:', error)
      return { error: error.message || 'Failed to get expense summary' }
    }
  }

  /**
   * Get unpaid expenses
   */
  const getUnpaidExpenses = async (): Promise<{ 
    data?: Expense[]
    error?: string 
  }> => {
    try {
      const { data, error } = await $supabase
        .from('expenses')
        .select('*')
        .in('payment_status', ['unpaid', 'partial'])
        .order('expense_date', { ascending: true })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get unpaid expenses error:', error)
      return { error: error.message || 'Failed to get unpaid expenses' }
    }
  }

  /**
   * Create vendor
   */
  const createVendor = async (
    vendor: Omit<Vendor, 'id' | 'vendor_code' | 'created_at' | 'updated_at'>
  ): Promise<{ data?: Vendor; error?: string }> => {
    try {
      // Generate vendor code
      const vendorCode = `VEN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      const { data, error } = await $supabase
        .from('vendors')
        .insert([{
          vendor_code: vendorCode,
          ...vendor
        }])
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (error: any) {
      console.error('Create vendor error:', error)
      return { error: error.message || 'Failed to create vendor' }
    }
  }

  /**
   * Get vendor by ID
   */
  const getVendor = async (
    vendorId: string
  ): Promise<{ data?: Vendor; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error) throw error

      return { data }
    } catch (error: any) {
      console.error('Get vendor error:', error)
      return { error: error.message || 'Failed to get vendor' }
    }
  }

  /**
   * Get all vendors
   */
  const getVendors = async (
    type?: VendorType,
    status: string = 'active'
  ): Promise<{ data?: Vendor[]; error?: string }> => {
    try {
      let query = $supabase
        .from('vendors')
        .select('*')
        .eq('status', status)

      if (type) {
        query = query.eq('vendor_type', type)
      }

      const { data, error } = await query.order('vendor_name', { ascending: true })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get vendors error:', error)
      return { error: error.message || 'Failed to get vendors' }
    }
  }

  /**
   * Update vendor
   */
  const updateVendor = async (
    vendorId: string,
    updates: Partial<Vendor>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await $supabase
        .from('vendors')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Update vendor error:', error)
      return { success: false, error: error.message || 'Failed to update vendor' }
    }
  }

  /**
   * Get vendor expenses
   */
  const getVendorExpenses = async (
    vendorId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ data?: Expense[]; error?: string }> => {
    try {
      let query = $supabase
        .from('expenses')
        .select('*')
        .eq('vendor_id', vendorId)

      if (startDate) {
        query = query.gte('expense_date', startDate)
      }
      if (endDate) {
        query = query.lte('expense_date', endDate)
      }

      const { data, error } = await query.order('expense_date', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get vendor expenses error:', error)
      return { error: error.message || 'Failed to get vendor expenses' }
    }
  }

  /**
   * Process recurring expenses
   */
  const processRecurringExpenses = async (): Promise<{ 
    processed: number
    error?: string 
  }> => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get recurring expenses due today
      const { data: dueExpenses, error: fetchError } = await $supabase
        .from('expenses')
        .select('*')
        .eq('is_recurring', true)
        .lte('next_occurrence', today)

      if (fetchError) throw fetchError

      let processed = 0

      for (const expense of dueExpenses || []) {
        // Create new expense instance
        await createExpense({
          expense_date: today,
          expense_category: expense.expense_category,
          vendor_id: expense.vendor_id,
          amount: expense.amount,
          tax_amount: expense.tax_amount,
          total_amount: expense.total_amount,
          currency: expense.currency,
          payment_method: expense.payment_method,
          payment_status: 'unpaid',
          description: `${expense.description} (Recurring)`,
          notes: expense.notes,
          is_recurring: false,
          recorded_by: expense.recorded_by,
          department: expense.department
        })

        // Update next occurrence
        const nextDate = calculateNextOccurrence(today, expense.recurring_frequency!)
        await updateExpense(expense.id, {
          next_occurrence: nextDate
        })

        processed++
      }

      return { processed }
    } catch (error: any) {
      console.error('Process recurring expenses error:', error)
      return { processed: 0, error: error.message || 'Failed to process recurring expenses' }
    }
  }

  /**
   * Calculate next occurrence date
   */
  const calculateNextOccurrence = (currentDate: string, frequency: string): string => {
    const date = new Date(currentDate)
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1)
        break
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'quarterly':
        date.setMonth(date.getMonth() + 3)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    
    return date.toISOString().split('T')[0]
  }

  return {
    createExpense,
    getExpense,
    getExpenses,
    updateExpense,
    markAsPaid,
    getExpenseSummary,
    getUnpaidExpenses,
    createVendor,
    getVendor,
    getVendors,
    updateVendor,
    getVendorExpenses,
    processRecurringExpenses
  }
}
