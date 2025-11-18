import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    const body = await readBody(event)

    const { transaction_type, inventory_item_id, quantity, processed_by } = body || {}

    if (!transaction_type || !inventory_item_id || typeof quantity !== 'number' || !processed_by) {
      throw createError({
        statusCode: 400,
        statusMessage: 'transaction_type, inventory_item_id, numeric quantity and processed_by are required'
      })
    }

    // Load current inventory item to compute stock_before/after and default costs
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, current_stock, unit_cost, primary_supplier_id')
      .eq('id', inventory_item_id)
      .single()

    if (itemError || !item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Inventory item not found'
      })
    }

    const stock_before = item.current_stock ?? 0
    const stock_after = stock_before + quantity

    const unit_cost =
      typeof body.unit_cost === 'number' ? body.unit_cost : (item.unit_cost ?? 0)

    const total_cost = Math.abs(quantity) * (unit_cost ?? 0)

    // Generate a transaction number – keep it simple for now
    const transaction_number = `ADJ-${Date.now()}`

    const transactionPayload = {
      transaction_number,
      transaction_type,
      inventory_item_id,
      quantity,
      unit_cost,
      total_cost,
      stock_before,
      stock_after,
      reference_type: body.reference_type ?? 'manual_adjustment',
      reference_id: body.reference_id ?? null,
      supplier_id: body.supplier_id ?? item.primary_supplier_id ?? null,
      notes: body.notes ?? null,
      batch_number: body.batch_number ?? null,
      expiry_date: body.expiry_date ?? null,
      processed_by
    }

    const { data: transaction, error: txError } = await supabase
      .from('inventory_transactions')
      .insert(transactionPayload)
      .select('*')
      .single()

    if (txError) {
      throw createError({
        statusCode: 400,
        statusMessage: txError.message
      })
    }

    // Update inventory_items.current_stock
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: stock_after,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventory_item_id)

    if (updateError) {
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message
      })
    }

    return {
      success: true,
      data: transaction
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'An unexpected error occurred'
    })
  }
})
