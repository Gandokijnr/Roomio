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
        statusMessage: 'Purchase order ID is required'
      })
    }

    const body = await readBody(event)
    const { approver_id } = body || {}

    if (!approver_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'approver_id is required'
      })
    }

    // Load purchase order with items
    const { data: purchaseOrder, error: poError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        items:purchase_order_items(
          id,
          inventory_item_id,
          quantity_ordered,
          unit_price,
          total_price
        )
      `)
      .eq('id', id)
      .single()

    if (poError || !purchaseOrder) {
      throw createError({
        statusCode: 404,
        statusMessage: poError?.message || 'Purchase order not found'
      })
    }

    // Only allow approval from non-final states
    const forbiddenStatuses = ['received', 'partial_received', 'cancelled']
    if (forbiddenStatuses.includes(purchaseOrder.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot approve a purchase order in status ${purchaseOrder.status}`
      })
    }

    const items = (purchaseOrder as any).items || []
    if (!Array.isArray(items) || items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Purchase order has no items to receive'
      })
    }

    // For each item, create an inventory transaction and update stock
    for (const item of items) {
      const { inventory_item_id, quantity_ordered, unit_price, total_price } = item

      // Load inventory item
      const { data: inventoryItem, error: itemError } = await supabase
        .from('inventory_items')
        .select('id, current_stock, unit_cost, primary_supplier_id')
        .eq('id', inventory_item_id)
        .single()

      if (itemError || !inventoryItem) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Inventory item not found for one of the purchase order items'
        })
      }

      const stock_before = inventoryItem.current_stock ?? 0
      const quantity = quantity_ordered ?? 0
      const stock_after = stock_before + quantity

      const unit_cost = typeof unit_price === 'number' ? unit_price : (inventoryItem.unit_cost ?? 0)
      const tx_total_cost = typeof total_price === 'number'
        ? total_price
        : Math.abs(quantity) * (unit_cost ?? 0)

      const transaction_number = `PO-${purchaseOrder.po_number || purchaseOrder.id}-${item.id}`

      const transactionPayload = {
        transaction_number,
        transaction_type: 'purchase',
        inventory_item_id,
        quantity,
        unit_cost,
        total_cost: tx_total_cost,
        stock_before,
        stock_after,
        reference_type: 'purchase_order',
        reference_id: purchaseOrder.id,
        supplier_id: purchaseOrder.supplier_id,
        notes: purchaseOrder.notes || null,
        batch_number: null,
        expiry_date: null,
        processed_by: approver_id
      }

      const { error: txError } = await supabase
        .from('inventory_transactions')
        .insert(transactionPayload)

      if (txError) {
        throw createError({
          statusCode: 400,
          statusMessage: txError.message
        })
      }

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          current_stock: stock_after,
          unit_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventory_item_id)

      if (updateError) {
        throw createError({
          statusCode: 400,
          statusMessage: updateError.message
        })
      }
    }

    // Finally, mark the purchase order as received/approved
    const today = new Date().toISOString().split('T')[0]

    const { data: updatedOrder, error: updatePoError } = await supabase
      .from('purchase_orders')
      .update({
        status: 'received',
        approved_by: approver_id,
        received_by: approver_id,
        actual_delivery_date: today
      })
      .eq('id', id)
      .select(`
        *,
        items:purchase_order_items(
          id,
          inventory_item_id,
          quantity_ordered,
          unit_price,
          total_price
        )
      `)
      .single()

    if (updatePoError || !updatedOrder) {
      throw createError({
        statusCode: 400,
        statusMessage: updatePoError?.message || 'Failed to update purchase order status'
      })
    }

    return {
      success: true,
      data: updatedOrder
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
