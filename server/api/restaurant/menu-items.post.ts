import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    const body = await readBody(event)

    // Validate required fields (item_code will be generated if empty)
    const requiredFields = ['name', 'category_id', 'base_price', 'item_type']
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        })
      }
    }

    // Generate item code if not provided
    if (!body.item_code) {
      const { data: lastItem } = await supabase
        .from('menu_items')
        .select('item_code')
        .order('created_at', { ascending: false })
        .limit(1)

      let nextNumber = 1
      if (lastItem && lastItem.length > 0) {
        const lastCode = lastItem[0].item_code as string
        const match = lastCode && lastCode.match(/MENU-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }

      body.item_code = `MENU-${String(nextNumber).padStart(6, '0')}`
    }

    const payload = {
      item_code: body.item_code,
      name: body.name,
      description: body.description ?? null,
      category_id: body.category_id,
      base_price: body.base_price,
      cost_price: body.cost_price ?? 0,
      profit_margin: body.profit_margin ?? null,
      item_type: body.item_type,
      preparation_time: body.preparation_time ?? 15,
      calories: body.calories ?? null,
      allergens: body.allergens ?? [],
      dietary_info: body.dietary_info ?? [],
      is_available: body.is_available ?? true,
      is_featured: body.is_featured ?? false,
      availability_schedule: body.availability_schedule ?? null,
      image_url: body.image_url ?? null,
      images: body.images ?? [],
      track_inventory: body.track_inventory ?? true,
      low_stock_threshold: body.low_stock_threshold ?? 10
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert(payload)
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
