import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    const params = getRouterParams(event)
    const id = params.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    const body = await readBody(event)

    const updatePayload: any = {}
    const updatableFields = [
      'order_status',
      'payment_status',
      'tax_amount',
      'service_charge',
      'discount_amount',
      'payment_method',
      'special_instructions',
      'customer_notes',
      'table_number',
      'room_number',
      'total_amount'
    ]

    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid fields provided for update'
      })
    }

    const { data, error } = await supabase
      .from('restaurant_orders')
      .update(updatePayload)
      .eq('id', id)
      .select(
        `*,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description)
        )`
      )
      .single()

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
