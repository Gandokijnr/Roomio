import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )
    
    // For now, we'll skip user authentication in server API
    // In production, you'd want to implement proper auth middleware
    const user = { id: 'system' }
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const body = await readBody(event)
    
    // Validate required fields
    const requiredFields = ['name', 'category_id', 'unit_of_measure', 'minimum_stock']
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
        .from('inventory_items')
        .select('item_code')
        .order('created_at', { ascending: false })
        .limit(1)

      let nextNumber = 1
      if (lastItem && lastItem.length > 0) {
        const lastCode = lastItem[0].item_code
        const match = lastCode.match(/INV-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      body.item_code = `INV-${String(nextNumber).padStart(6, '0')}`
    }

    // Add metadata
    body.created_by = user.id
    body.created_at = new Date().toISOString()
    body.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(body)
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

    // Create initial inventory transaction if current_stock > 0
    if (body.current_stock > 0) {
      await supabase
        .from('inventory_transactions')
        .insert({
          transaction_number: `ADJ-${Date.now()}`,
          transaction_type: 'adjustment',
          inventory_item_id: data.id,
          quantity: body.current_stock,
          stock_before: 0,
          stock_after: body.current_stock,
          notes: 'Initial stock entry',
          processed_by: user.id
        })
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'An unexpected error occurred'
    })
  }
})
