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
      inventory_item_id,
      transaction_type,
      limit: queryLimit = 50,
      offset: queryOffset = 0
    } = query

    if (!inventory_item_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'inventory_item_id is required'
      })
    }

    const limit = parseInt(String(queryLimit))
    const offset = parseInt(String(queryOffset))

    let queryBuilder = supabase
      .from('inventory_transactions')
      .select(`
        *,
        item:inventory_items(id, name, unit_of_measure),
        supplier:vendors(id, vendor_name)
      `)
      .eq('inventory_item_id', inventory_item_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transaction_type) {
      queryBuilder = queryBuilder.eq('transaction_type', transaction_type)
    }

    const { data, error } = await queryBuilder

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
