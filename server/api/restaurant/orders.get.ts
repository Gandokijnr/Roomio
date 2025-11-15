import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )
    
    const query = getQuery(event)
    const { 
      status, 
      order_type, 
      date_from, 
      date_to, 
      limit: queryLimit = 50,
      offset: queryOffset = 0 
    } = query
    
    const limit = parseInt(String(queryLimit))
    const offset = parseInt(String(queryOffset))

    let queryBuilder = supabase
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
          menu_item:menu_items(id, name, description)
        ),
        taken_by_profile:profiles!taken_by(id, full_name),
        prepared_by_profile:profiles!prepared_by(id, full_name),
        served_by_profile:profiles!served_by(id, full_name)
      `)
      .order('order_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      queryBuilder = queryBuilder.eq('order_status', status)
    }

    if (order_type) {
      queryBuilder = queryBuilder.eq('order_type', order_type)
    }

    if (date_from) {
      queryBuilder = queryBuilder.gte('order_time', date_from)
    }

    if (date_to) {
      queryBuilder = queryBuilder.lte('order_time', date_to)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    return {
      success: true,
      data,
      count
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
