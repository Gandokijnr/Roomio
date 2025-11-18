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
        statusMessage: 'Menu item ID is required'
      })
    }

    const body = await readBody(event)

    const updatePayload: any = {}
    const updatableFields = [
      'name',
      'item_code',
      'description',
      'category_id',
      'base_price',
      'cost_price',
      'profit_margin',
      'item_type',
      'preparation_time',
      'calories',
      'allergens',
      'dietary_info',
      'is_available',
      'is_featured',
      'availability_schedule',
      'image_url',
      'images',
      'track_inventory',
      'low_stock_threshold'
    ]

    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field]
      }
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        category:menu_categories(id, name, category_type)
      `)
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
