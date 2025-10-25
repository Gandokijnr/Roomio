import type {
  FinancialSummary,
  RevenueByPeriod,
  TopExpenseCategory,
  PaymentMethodBreakdown,
  OutstandingInvoice
} from '~/types/accounting'

export const useFinancialAnalytics = () => {
  const { $supabase } = useNuxtApp()

  /**
   * Get comprehensive financial summary
   */
  const getFinancialSummary = async (
    startDate: string,
    endDate: string
  ): Promise<{ data?: FinancialSummary; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .rpc('get_financial_summary', {
          p_start_date: startDate,
          p_end_date: endDate
        })

      if (error) throw error

      return { data: data[0] }
    } catch (error: any) {
      console.error('Get financial summary error:', error)
      return { error: error.message || 'Failed to get financial summary' }
    }
  }

  /**
   * Get revenue trends by period
   */
  const getRevenueTrends = async (
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{ data?: RevenueByPeriod[]; error?: string }> => {
    try {
      let dateFormat: string
      switch (groupBy) {
        case 'day':
          dateFormat = 'YYYY-MM-DD'
          break
        case 'week':
          dateFormat = 'IYYY-IW'
          break
        case 'month':
          dateFormat = 'YYYY-MM'
          break
      }

      // Get revenue data
      const { data: revenueData, error: revError } = await $supabase
        .from('payment_transactions')
        .select('amount, created_at')
        .eq('transaction_type', 'payment')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (revError) throw revError

      // Get expense data
      const { data: expenseData, error: expError } = await $supabase
        .from('expenses')
        .select('total_amount, expense_date')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .in('payment_status', ['paid', 'partial'])

      if (expError) throw expError

      // Group data by period
      const periods = new Map<string, { revenue: number; expenses: number }>()

      revenueData?.forEach(txn => {
        const period = formatPeriod(txn.created_at, groupBy)
        const current = periods.get(period) || { revenue: 0, expenses: 0 }
        current.revenue += txn.amount
        periods.set(period, current)
      })

      expenseData?.forEach(exp => {
        const period = formatPeriod(exp.expense_date, groupBy)
        const current = periods.get(period) || { revenue: 0, expenses: 0 }
        current.expenses += exp.total_amount
        periods.set(period, current)
      })

      // Convert to array
      const trends: RevenueByPeriod[] = Array.from(periods.entries()).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses
      }))

      trends.sort((a, b) => a.period.localeCompare(b.period))

      return { data: trends }
    } catch (error: any) {
      console.error('Get revenue trends error:', error)
      return { error: error.message || 'Failed to get revenue trends' }
    }
  }

  /**
   * Get top expense categories
   */
  const getTopExpenseCategories = async (
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<{ data?: TopExpenseCategory[]; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('expenses')
        .select('expense_category, total_amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)

      if (error) throw error

      // Group by category
      const categoryTotals = new Map<string, number>()
      let grandTotal = 0

      data?.forEach(exp => {
        const current = categoryTotals.get(exp.expense_category) || 0
        categoryTotals.set(exp.expense_category, current + exp.total_amount)
        grandTotal += exp.total_amount
      })

      // Convert to array and calculate percentages
      const categories: TopExpenseCategory[] = Array.from(categoryTotals.entries())
        .map(([category, total]) => ({
          category,
          total,
          percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)

      return { data: categories }
    } catch (error: any) {
      console.error('Get top expense categories error:', error)
      return { error: error.message || 'Failed to get expense categories' }
    }
  }

  /**
   * Get payment method breakdown
   */
  const getPaymentMethodBreakdown = async (
    startDate: string,
    endDate: string
  ): Promise<{ data?: PaymentMethodBreakdown[]; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('payment_transactions')
        .select('payment_method, amount')
        .eq('transaction_type', 'payment')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error

      // Group by payment method
      const methodTotals = new Map<string, { count: number; total: number }>()
      let grandTotal = 0

      data?.forEach(txn => {
        const current = methodTotals.get(txn.payment_method) || { count: 0, total: 0 }
        current.count++
        current.total += txn.amount
        methodTotals.set(txn.payment_method, current)
        grandTotal += txn.amount
      })

      // Convert to array
      const breakdown: PaymentMethodBreakdown[] = Array.from(methodTotals.entries())
        .map(([method, data]) => ({
          method: method as any,
          count: data.count,
          total_amount: data.total,
          percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0
        }))
        .sort((a, b) => b.total_amount - a.total_amount)

      return { data: breakdown }
    } catch (error: any) {
      console.error('Get payment method breakdown error:', error)
      return { error: error.message || 'Failed to get payment method breakdown' }
    }
  }

  /**
   * Get outstanding invoices
   */
  const getOutstandingInvoices = async (): Promise<{ 
    data?: OutstandingInvoice[]
    error?: string 
  }> => {
    try {
      const { data, error } = await $supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          balance_due,
          due_date,
          status,
          guest_id,
          guests (first_name, last_name)
        `)
        .in('status', ['sent', 'partial', 'overdue'])
        .gt('balance_due', 0)
        .order('due_date', { ascending: true })

      if (error) throw error

      const today = new Date()
      const outstanding: OutstandingInvoice[] = (data || []).map((inv: any) => {
        const dueDate = new Date(inv.due_date)
        const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))

        return {
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          guest_name: inv.guests ? `${inv.guests.first_name} ${inv.guests.last_name}` : 'Unknown',
          amount_due: inv.balance_due,
          days_overdue: daysOverdue,
          status: inv.status
        }
      })

      return { data: outstanding }
    } catch (error: any) {
      console.error('Get outstanding invoices error:', error)
      return { error: error.message || 'Failed to get outstanding invoices' }
    }
  }

  /**
   * Get occupancy vs revenue correlation
   */
  const getOccupancyRevenueCorrelation = async (
    startDate: string,
    endDate: string
  ): Promise<{ 
    data?: Array<{
      date: string
      occupancy_rate: number
      revenue: number
      avg_rate: number
    }>
    error?: string 
  }> => {
    try {
      // Get daily revenue
      const { data: revenueData, error: revError } = await $supabase
        .from('payment_transactions')
        .select('amount, created_at')
        .eq('payment_category', 'room_rental')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (revError) throw revError

      // Get daily occupancy (from reservations)
      const { data: reservations, error: resError } = await $supabase
        .from('reservations')
        .select('check_in_date, check_out_date, total_amount')
        .gte('check_in_date', startDate)
        .lte('check_out_date', endDate)
        .in('status', ['confirmed', 'checked_in', 'checked_out'])

      if (resError) throw resError

      // Get total rooms (you'll need to adjust this based on your schema)
      const { count: totalRooms } = await $supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })

      // Group by date
      const dailyData = new Map<string, { revenue: number; occupied_rooms: number }>()

      revenueData?.forEach(txn => {
        const date = txn.created_at.split('T')[0]
        const current = dailyData.get(date) || { revenue: 0, occupied_rooms: 0 }
        current.revenue += txn.amount
        dailyData.set(date, current)
      })

      reservations?.forEach(res => {
        const checkIn = new Date(res.check_in_date)
        const checkOut = new Date(res.check_out_date)
        
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          const date = d.toISOString().split('T')[0]
          const current = dailyData.get(date) || { revenue: 0, occupied_rooms: 0 }
          current.occupied_rooms++
          dailyData.set(date, current)
        }
      })

      // Convert to array
      const correlation = Array.from(dailyData.entries()).map(([date, data]) => ({
        date,
        occupancy_rate: totalRooms ? (data.occupied_rooms / totalRooms) * 100 : 0,
        revenue: data.revenue,
        avg_rate: data.occupied_rooms > 0 ? data.revenue / data.occupied_rooms : 0
      }))

      correlation.sort((a, b) => a.date.localeCompare(b.date))

      return { data: correlation }
    } catch (error: any) {
      console.error('Get occupancy revenue correlation error:', error)
      return { error: error.message || 'Failed to get correlation data' }
    }
  }

  /**
   * Format period for grouping
   */
  const formatPeriod = (date: string, groupBy: 'day' | 'week' | 'month'): string => {
    const d = new Date(date)
    
    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0]
      case 'week':
        const week = getWeekNumber(d)
        return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      default:
        return d.toISOString().split('T')[0]
    }
  }

  /**
   * Get week number
   */
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  /**
   * Export financial data
   */
  const exportFinancialData = async (
    startDate: string,
    endDate: string,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<{ data?: Blob; error?: string }> => {
    try {
      // Get all financial data
      const summary = await getFinancialSummary(startDate, endDate)
      const trends = await getRevenueTrends(startDate, endDate, 'day')
      const expenses = await getTopExpenseCategories(startDate, endDate)
      const payments = await getPaymentMethodBreakdown(startDate, endDate)

      // TODO: Implement actual export based on format
      // This would use libraries like:
      // - CSV: papaparse or custom CSV generation
      // - Excel: xlsx or exceljs
      // - PDF: jsPDF or pdfmake

      console.log('Export data:', { summary, trends, expenses, payments })

      return { error: `${format.toUpperCase()} export not yet implemented` }
    } catch (error: any) {
      console.error('Export financial data error:', error)
      return { error: error.message || 'Failed to export data' }
    }
  }

  return {
    getFinancialSummary,
    getRevenueTrends,
    getTopExpenseCategories,
    getPaymentMethodBreakdown,
    getOutstandingInvoices,
    getOccupancyRevenueCorrelation,
    exportFinancialData
  }
}
