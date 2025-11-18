import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )
    
    const body = await readBody(event)
    
    // Validate required fields
    const requiredFields = ['order_type', 'items', 'total_amount']
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        })
      }
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order must contain at least one item'
      })
    }

    // Generate order number if not provided
    if (!body.order_number) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const { data: lastOrder } = await supabase
        .from('restaurant_orders')
        .select('order_number')
        .like('order_number', `ORD-${today}-%`)
        .order('created_at', { ascending: false })
        .limit(1)

      let nextNumber = 1
      if (lastOrder && lastOrder.length > 0) {
        const lastOrderNumber = lastOrder[0].order_number
        const match = lastOrderNumber.match(/ORD-\d{8}-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      body.order_number = `ORD-${today}-${String(nextNumber).padStart(4, '0')}`
    }

    // Set default values
    body.order_status = body.order_status || 'pending'
    body.payment_status = body.payment_status || 'pending'
    body.order_time = body.order_time || new Date().toISOString()

    // Calculate totals
    let subtotal = 0
    const items = body.items.map((item: any) => {
      const itemTotal = item.quantity * item.unit_price
      subtotal += itemTotal
      return {
        ...item,
        total_price: itemTotal
      }
    })

    body.subtotal = subtotal
    body.tax_amount = body.tax_amount || 0
    body.service_charge = body.service_charge || 0
    body.discount_amount = body.discount_amount || 0
    body.total_amount = subtotal + body.tax_amount + body.service_charge - body.discount_amount

    // Extract items for separate insertion
    const orderItems = items
    delete body.items

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('restaurant_orders')
      .insert(body)
      .select()
      .single()

    if (orderError) {
      throw createError({
        statusCode: 400,
        statusMessage: orderError.message
      })
    }

    // Insert order items
    const orderItemsWithOrderId = orderItems.map((item: any) => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('restaurant_order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      // Rollback the order if items insertion fails
      await supabase
        .from('restaurant_orders')
        .delete()
        .eq('id', order.id)
      
      throw createError({
        statusCode: 400,
        statusMessage: itemsError.message
      })
    }

    // Sync table status for dine-in and bar orders
    if ((order.order_type === 'dine_in' || order.order_type === 'bar') && order.table_number) {
      try {
        const { error: tableError } = await supabase
          .from('restaurant_tables')
          .update({
            status: 'occupied',
            is_active: true
          })
          .eq('table_number', order.table_number)

        if (tableError) {
          console.error('Error updating table status for new order:', tableError.message)
        }
      } catch (tableUpdateError: any) {
        console.error('Unexpected error updating table status for new order:', tableUpdateError.message || tableUpdateError)
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('restaurant_orders')
      .select(`
        *,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description, item_type)
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      throw createError({
        statusCode: 400,
        statusMessage: fetchError.message
      })
    }

    return {
      success: true,
      data: completeOrder
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
