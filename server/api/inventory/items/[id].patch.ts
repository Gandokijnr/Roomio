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
        statusMessage: 'Inventory item ID is required'
      })
    }

    const body = await readBody(event)

    const updatePayload: any = {}
    const updatableFields = [
      'name',
      'item_code',
      'description',
      'category_id',
      'unit_of_measure',
      'current_stock',
      'minimum_stock',
      'maximum_stock',
      'reorder_point',
      'unit_cost',
      'average_cost',
      'last_purchase_price',
      'primary_supplier_id',
      'supplier_item_code',
      'storage_location',
      'storage_temperature',
      'shelf_life_days',
      'is_active'
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

    updatePayload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        category:inventory_categories(id, name, category_type),
        supplier:vendors(id, vendor_name)
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
