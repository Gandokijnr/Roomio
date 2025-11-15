import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )
    
    const query = getQuery(event)
    const { category_type } = query

    let queryBuilder = supabase
      .from('inventory_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (category_type) {
      queryBuilder = queryBuilder.eq('category_type', category_type)
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
