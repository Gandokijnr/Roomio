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
      capacity_min, 
      capacity_max,
      location,
      is_active,
      limit: queryLimit = 100,
      offset: queryOffset = 0 
    } = query
    
    const limit = parseInt(String(queryLimit))
    const offset = parseInt(String(queryOffset))

    let queryBuilder = supabase
      .from('restaurant_tables')
      .select(`
        *,
        current_reservation:table_reservations(
          id,
          reservation_time,
          party_size,
          guest:guests(id, first_name, last_name, phone),
          status
        )
      `)
      .order('table_number')
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    if (capacity_min) {
      queryBuilder = queryBuilder.gte('capacity', parseInt(String(capacity_min)))
    }

    if (capacity_max) {
      queryBuilder = queryBuilder.lte('capacity', parseInt(String(capacity_max)))
    }

    if (location) {
      queryBuilder = queryBuilder.eq('location', location)
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', is_active === 'true')
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
