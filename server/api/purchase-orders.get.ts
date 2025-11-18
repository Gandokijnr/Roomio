import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    const query = getQuery(event)
    const scope = (query.scope as string) || 'all'
    const status = query.status as string | undefined
    const supplierId = query.supplier_id as string | undefined

    let poQuery = supabase
      .from('purchase_orders')
      .select(
        `
        id,
        po_number,
        supplier_id,
        status,
        order_date,
        expected_delivery_date,
        actual_delivery_date,
        subtotal,
        tax_amount,
        shipping_cost,
        total_amount,
        created_at,
        supplier:vendors(id, vendor_name)
      `,
        { count: 'exact' }
      )

    // Pending scope: anything not fully received or cancelled
    if (scope === 'pending') {
      poQuery = poQuery
        .neq('status', 'received')
        .neq('status', 'cancelled')
    }

    if (status) {
      poQuery = poQuery.eq('status', status)
    }

    if (supplierId) {
      poQuery = poQuery.eq('supplier_id', supplierId)
    }

    const { data, count, error } = await poQuery.order('order_date', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    return {
      success: true,
      scope,
      pendingCount: scope === 'pending' ? (count || 0) : 0,
      totalCount: count || 0,
      data: data || []
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
