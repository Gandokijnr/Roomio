import type {
  PaymentTransaction,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  ProcessRefundRequest,
  PaymentMethod
} from '~/types/accounting'

export const usePaymentProcessing = () => {
  const { $supabase } = useNuxtApp()

  /**
   * Process a payment transaction
   */
  const processPayment = async (
    request: ProcessPaymentRequest
  ): Promise<{ data?: ProcessPaymentResponse; error?: string }> => {
    try {
      // If split payment, handle separately
      if (request.splits && request.splits.length > 0) {
        return await processSplitPayment(request)
      }

      // Process single payment using database function
      const { data, error } = await $supabase
        .rpc('process_payment', {
          p_reservation_id: request.reservation_id,
          p_guest_id: request.guest_id,
          p_amount: request.amount,
          p_payment_method: request.payment_method,
          p_payment_category: request.payment_category || 'room_rental',
          p_description: request.description,
          p_processed_by: request.processed_by
        })

      if (error) throw error

      return { data: data[0] }
    } catch (error: any) {
      console.error('Payment processing error:', error)
      return { error: error.message || 'Failed to process payment' }
    }
  }

  /**
   * Process split payment (multiple payment methods)
   */
  const processSplitPayment = async (
    request: ProcessPaymentRequest
  ): Promise<{ data?: ProcessPaymentResponse; error?: string }> => {
    try {
      if (!request.splits || request.splits.length === 0) {
        throw new Error('No payment splits provided')
      }

      // Validate total amount matches splits
      const splitTotal = request.splits.reduce((sum, split) => sum + split.amount, 0)
      if (Math.abs(splitTotal - request.amount) > 0.01) {
        throw new Error('Split amounts do not match total amount')
      }

      // Generate transaction reference
      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create main transaction
      const { data: transaction, error: txnError } = await $supabase
        .from('payment_transactions')
        .insert([{
          transaction_reference: transactionRef,
          reservation_id: request.reservation_id,
          guest_id: request.guest_id,
          transaction_type: 'payment',
          payment_method: 'multiple', // Indicate split payment
          amount: request.amount,
          amount_in_base_currency: request.amount,
          status: 'completed',
          payment_category: request.payment_category || 'room_rental',
          description: request.description || 'Split payment',
          processed_by: request.processed_by,
          processed_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (txnError) throw txnError

      // Create split records
      const splits = request.splits.map(split => ({
        transaction_id: transaction.id,
        payment_method: split.payment_method,
        amount: split.amount
      }))

      const { error: splitError } = await $supabase
        .from('payment_splits')
        .insert(splits)

      if (splitError) throw splitError

      return {
        data: {
          transaction_id: transaction.id,
          transaction_reference: transactionRef,
          status: 'completed',
          message: 'Split payment processed successfully'
        }
      }
    } catch (error: any) {
      console.error('Split payment error:', error)
      return { error: error.message || 'Failed to process split payment' }
    }
  }

  /**
   * Process refund
   */
  const processRefund = async (
    request: ProcessRefundRequest
  ): Promise<{ data?: ProcessPaymentResponse; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .rpc('process_refund', {
          p_original_transaction_id: request.original_transaction_id,
          p_refund_amount: request.refund_amount,
          p_reason: request.reason,
          p_processed_by: request.processed_by
        })

      if (error) throw error

      return { data: data[0] }
    } catch (error: any) {
      console.error('Refund processing error:', error)
      return { error: error.message || 'Failed to process refund' }
    }
  }

  /**
   * Get payment transaction by ID
   */
  const getTransaction = async (
    transactionId: string
  ): Promise<{ data?: PaymentTransaction; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) throw error

      return { data }
    } catch (error: any) {
      console.error('Get transaction error:', error)
      return { error: error.message || 'Failed to get transaction' }
    }
  }

  /**
   * Get transactions for a reservation
   */
  const getReservationTransactions = async (
    reservationId: string
  ): Promise<{ data?: PaymentTransaction[]; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('payment_transactions')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get reservation transactions error:', error)
      return { error: error.message || 'Failed to get transactions' }
    }
  }

  /**
   * Get transactions for a guest
   */
  const getGuestTransactions = async (
    guestId: string,
    limit: number = 50
  ): Promise<{ data?: PaymentTransaction[]; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('payment_transactions')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get guest transactions error:', error)
      return { error: error.message || 'Failed to get transactions' }
    }
  }

  /**
   * Get payment summary for a period
   */
  const getPaymentSummary = async (
    startDate: string,
    endDate: string
  ): Promise<{ 
    data?: {
      total_amount: number
      transaction_count: number
      by_method: Record<PaymentMethod, number>
      by_category: Record<string, number>
    }
    error?: string 
  }> => {
    try {
      const { data, error } = await $supabase
        .from('payment_transactions')
        .select('amount, payment_method, payment_category')
        .eq('transaction_type', 'payment')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error

      const summary = {
        total_amount: data.reduce((sum, txn) => sum + (txn.amount || 0), 0),
        transaction_count: data.length,
        by_method: {} as Record<PaymentMethod, number>,
        by_category: {} as Record<string, number>
      }

      // Group by payment method
      data.forEach(txn => {
        if (txn.payment_method) {
          const method = txn.payment_method as PaymentMethod
          summary.by_method[method] = 
            (summary.by_method[method] || 0) + txn.amount
        }
        if (txn.payment_category) {
          summary.by_category[txn.payment_category] = 
            (summary.by_category[txn.payment_category] || 0) + txn.amount
        }
      })

      return { data: summary }
    } catch (error: any) {
      console.error('Get payment summary error:', error)
      return { error: error.message || 'Failed to get payment summary' }
    }
  }

  /**
   * Verify payment gateway transaction
   */
  const verifyGatewayPayment = async (
    gatewayReference: string,
    gateway: 'paystack' | 'stripe' | 'flutterwave'
  ): Promise<{ data?: any; error?: string }> => {
    try {
      // This would integrate with actual payment gateway APIs
      // For now, return a placeholder
      console.log(`Verifying ${gateway} payment: ${gatewayReference}`)
      
      // TODO: Implement actual gateway verification
      // Example for Paystack:
      // const response = await fetch(`https://api.paystack.co/transaction/verify/${gatewayReference}`, {
      //   headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      // })
      
      return { 
        data: { 
          verified: true, 
          message: 'Payment gateway verification not yet implemented' 
        } 
      }
    } catch (error: any) {
      console.error('Gateway verification error:', error)
      return { error: error.message || 'Failed to verify payment' }
    }
  }

  /**
   * Cancel pending transaction
   */
  const cancelTransaction = async (
    transactionId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await $supabase
        .from('payment_transactions')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('status', 'pending') // Only cancel pending transactions

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Cancel transaction error:', error)
      return { success: false, error: error.message || 'Failed to cancel transaction' }
    }
  }

  return {
    processPayment,
    processSplitPayment,
    processRefund,
    getTransaction,
    getReservationTransactions,
    getGuestTransactions,
    getPaymentSummary,
    verifyGatewayPayment,
    cancelTransaction
  }
}
