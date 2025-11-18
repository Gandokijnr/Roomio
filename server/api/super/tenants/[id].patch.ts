import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event)

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
      statusMessage: 'Tenant ID is required'
    })
  }

  const body = await readBody(event)
  const { action, status, subscription_plan, notes } = body || {}

  if (!action) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Action is required'
    })
  }

  const updates: Record<string, any> = {}

  if (action === 'update_status') {
    if (!status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status is required for update_status action'
      })
    }
    updates.status = status
  }

  if (action === 'update_plan') {
    if (!subscription_plan) {
      throw createError({
        statusCode: 400,
        statusMessage: 'subscription_plan is required for update_plan action'
      })
    }
    updates.subscription_plan = subscription_plan
  }

  if (notes !== undefined) {
    updates.notes = notes
  }

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No updates to apply'
    })
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  await supabase
    .from('activity_logs')
    .insert({
      user_id: superAdmin.id,
      action: action === 'update_status' ? 'tenant_status_updated' : 'tenant_plan_updated',
      entity_type: 'tenant',
      entity_id: id,
      tenant_id: id,
      metadata: updates
    })

  return {
    success: true,
    data
  }
})
