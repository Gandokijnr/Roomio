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
      category_id, 
      item_type, 
      is_available,
      search,
      limit: queryLimit = 100,
      offset: queryOffset = 0 
    } = query
    
    const limit = parseInt(String(queryLimit))
    const offset = parseInt(String(queryOffset))

    let queryBuilder = supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(id, name, category_type),
        recipe_ingredients:recipe_ingredients(
          id,
          quantity_required,
          unit,
          inventory_item:inventory_items(id, name, unit_of_measure, current_stock)
        )
      `)
      .order('name')
      .range(offset, offset + limit - 1)

    // Apply filters
    if (category_id) {
      queryBuilder = queryBuilder.eq('category_id', category_id)
    }

    if (item_type) {
      queryBuilder = queryBuilder.eq('item_type', item_type)
    }

    if (is_available !== undefined) {
      queryBuilder = queryBuilder.eq('is_available', is_available === 'true')
    }

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
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
