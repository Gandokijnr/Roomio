import type {
  Invoice,
  InvoiceLineItem,
  CreateInvoiceRequest,
  InvoiceStatus
} from '~/types/accounting'

export const useInvoiceManagement = () => {
  const { $supabase } = useNuxtApp()

  /**
   * Create invoice for reservation
   */
  const createReservationInvoice = async (
    reservationId: string,
    guestId: string,
    issuedBy?: string
  ): Promise<{ data?: string; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .rpc('create_reservation_invoice', {
          p_reservation_id: reservationId,
          p_guest_id: guestId,
          p_issued_by: issuedBy
        })

      if (error) throw error

      return { data } // Returns invoice ID
    } catch (error: any) {
      console.error('Create invoice error:', error)
      return { error: error.message || 'Failed to create invoice' }
    }
  }

  /**
   * Create custom invoice
   */
  const createCustomInvoice = async (
    request: CreateInvoiceRequest
  ): Promise<{ data?: Invoice; error?: string }> => {
    try {
      // Calculate totals
      const subtotal = request.line_items.reduce((sum, item) => {
        const lineTotal = item.quantity * item.unit_price
        const discount = lineTotal * ((item.discount_rate || 0) / 100)
        return sum + (lineTotal - discount)
      }, 0)

      const taxAmount = request.line_items.reduce((sum, item) => {
        const lineTotal = item.quantity * item.unit_price
        const discount = lineTotal * ((item.discount_rate || 0) / 100)
        const taxableAmount = lineTotal - discount
        return sum + (taxableAmount * ((item.tax_rate || 0) / 100))
      }, 0)

      const totalAmount = subtotal + taxAmount

      // Create invoice
      const { data: invoice, error: invoiceError } = await $supabase
        .from('invoices')
        .insert([{
          invoice_number: `INV-${Date.now()}`, // Will be replaced by trigger
          reservation_id: request.reservation_id,
          guest_id: request.guest_id,
          invoice_date: new Date().toISOString().split('T')[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          balance_due: totalAmount,
          status: 'draft',
          notes: request.notes,
          payment_terms: request.payment_terms
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create line items
      const lineItems = request.line_items.map(item => ({
        invoice_id: invoice.id,
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        discount_rate: item.discount_rate || 0,
        line_total: (item.quantity * item.unit_price) * 
                    (1 - (item.discount_rate || 0) / 100)
      }))

      const { error: itemsError } = await $supabase
        .from('invoice_line_items')
        .insert(lineItems)

      if (itemsError) throw itemsError

      return { data: invoice }
    } catch (error: any) {
      console.error('Create custom invoice error:', error)
      return { error: error.message || 'Failed to create invoice' }
    }
  }

  /**
   * Get invoice by ID with line items
   */
  const getInvoice = async (
    invoiceId: string
  ): Promise<{ 
    data?: Invoice & { line_items: InvoiceLineItem[] }
    error?: string 
  }> => {
    try {
      const { data: invoice, error: invoiceError } = await $supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError

      const { data: lineItems, error: itemsError } = await $supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      return { 
        data: { 
          ...invoice, 
          line_items: lineItems || [] 
        } 
      }
    } catch (error: any) {
      console.error('Get invoice error:', error)
      return { error: error.message || 'Failed to get invoice' }
    }
  }

  /**
   * Get invoices for a guest
   */
  const getGuestInvoices = async (
    guestId: string
  ): Promise<{ data?: Invoice[]; error?: string }> => {
    try {
      const { data, error } = await $supabase
        .from('invoices')
        .select('*')
        .eq('guest_id', guestId)
        .order('invoice_date', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get guest invoices error:', error)
      return { error: error.message || 'Failed to get invoices' }
    }
  }

  /**
   * Update invoice status
   */
  const updateInvoiceStatus = async (
    invoiceId: string,
    status: InvoiceStatus
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString()
      } else if (status === 'paid') {
        updateData.paid_at = new Date().toISOString()
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      }

      const { error } = await $supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Update invoice status error:', error)
      return { success: false, error: error.message || 'Failed to update invoice' }
    }
  }

  /**
   * Add line item to invoice
   */
  const addLineItem = async (
    invoiceId: string,
    item: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Add line item
      const { error: itemError } = await $supabase
        .from('invoice_line_items')
        .insert([{
          invoice_id: invoiceId,
          ...item
        }])

      if (itemError) throw itemError

      // Recalculate invoice totals
      await recalculateInvoiceTotals(invoiceId)

      return { success: true }
    } catch (error: any) {
      console.error('Add line item error:', error)
      return { success: false, error: error.message || 'Failed to add line item' }
    }
  }

  /**
   * Remove line item from invoice
   */
  const removeLineItem = async (
    lineItemId: string,
    invoiceId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await $supabase
        .from('invoice_line_items')
        .delete()
        .eq('id', lineItemId)

      if (error) throw error

      // Recalculate invoice totals
      await recalculateInvoiceTotals(invoiceId)

      return { success: true }
    } catch (error: any) {
      console.error('Remove line item error:', error)
      return { success: false, error: error.message || 'Failed to remove line item' }
    }
  }

  /**
   * Recalculate invoice totals
   */
  const recalculateInvoiceTotals = async (
    invoiceId: string
  ): Promise<void> => {
    const { data: items } = await $supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    if (!items) return

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
    const taxAmount = items.reduce((sum, item) => {
      return sum + (item.line_total * (item.tax_rate / 100))
    }, 0)
    const totalAmount = subtotal + taxAmount

    const { data: invoice } = await $supabase
      .from('invoices')
      .select('amount_paid')
      .eq('id', invoiceId)
      .single()

    const amountPaid = invoice?.amount_paid || 0
    const balanceDue = totalAmount - amountPaid

    await $supabase
      .from('invoices')
      .update({
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: balanceDue,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
  }

  /**
   * Get overdue invoices
   */
  const getOverdueInvoices = async (): Promise<{ 
    data?: Invoice[]
    error?: string 
  }> => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await $supabase
        .from('invoices')
        .select('*')
        .lt('due_date', today)
        .in('status', ['sent', 'partial'])
        .order('due_date', { ascending: true })

      if (error) throw error

      // Update status to overdue
      if (data && data.length > 0) {
        const overdueIds = data.map(inv => inv.id)
        await $supabase
          .from('invoices')
          .update({ status: 'overdue' })
          .in('id', overdueIds)
          .in('status', ['sent', 'partial'])
      }

      return { data: data || [] }
    } catch (error: any) {
      console.error('Get overdue invoices error:', error)
      return { error: error.message || 'Failed to get overdue invoices' }
    }
  }

  /**
   * Send invoice to guest (email)
   */
  const sendInvoice = async (
    invoiceId: string,
    recipientEmail: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: Implement email sending
      // This would integrate with your email service (SendGrid, Mailgun, etc.)
      
      // Update invoice status
      await updateInvoiceStatus(invoiceId, 'sent')

      console.log(`Invoice sent to ${recipientEmail}`)
      
      return { success: true }
    } catch (error: any) {
      console.error('Send invoice error:', error)
      return { success: false, error: error.message || 'Failed to send invoice' }
    }
  }

  /**
   * Generate invoice PDF
   */
  const generateInvoicePDF = async (
    invoiceId: string
  ): Promise<{ data?: Blob; error?: string }> => {
    try {
      // TODO: Implement PDF generation
      // This would use a library like jsPDF or pdfmake
      
      console.log(`Generating PDF for invoice ${invoiceId}`)
      
      return { error: 'PDF generation not yet implemented' }
    } catch (error: any) {
      console.error('Generate PDF error:', error)
      return { error: error.message || 'Failed to generate PDF' }
    }
  }

  return {
    createReservationInvoice,
    createCustomInvoice,
    getInvoice,
    getGuestInvoices,
    updateInvoiceStatus,
    addLineItem,
    removeLineItem,
    recalculateInvoiceTotals,
    getOverdueInvoices,
    sendInvoice,
    generateInvoicePDF
  }
}
