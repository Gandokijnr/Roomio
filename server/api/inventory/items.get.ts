import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )
    
    // Get query parameters
    const query = getQuery(event)
    const { category_id, search, stock_status } = query

    let queryBuilder = supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(id, name, category_type),
        supplier:vendors(id, vendor_name)
      `)
      .eq('is_active', true)
      .order('name')

    // Apply filters
    if (category_id) {
      queryBuilder = queryBuilder.eq('category_id', category_id)
    }

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,item_code.ilike.%${search}%`)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    // Apply stock status filter if needed
    let filteredData = data
    if (stock_status) {
      filteredData = data?.filter(item => {
        switch (stock_status) {
          case 'in_stock':
            return item.current_stock > item.minimum_stock
          case 'low_stock':
            return item.current_stock <= item.minimum_stock && item.current_stock > 0
          case 'out_of_stock':
            return item.current_stock === 0
          default:
            return true
        }
      })
    }

    return {
      success: true,
      data: filteredData
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'An unexpected error occurred'
    })
  }
})
