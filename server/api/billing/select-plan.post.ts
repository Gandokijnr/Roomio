import { createClient } from '@supabase/supabase-js'
import { verifyTenantUser } from '../../utils/verifyTenantUser'
import { logPlatformAuditEvent } from '../../utils/logPlatformAuditEvent'

export default defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event)

  const body = await readBody(event)
  const { plan_id } = body || {}

  if (!plan_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'plan_id is required'
    })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const tenantId = (profile as any).tenant_id

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No tenant associated with this user'
    })
  }

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('id, code, name, price_monthly, currency, is_active')
    .eq('id', plan_id)
    .maybeSingle()

  if (planError || !plan) {
    throw createError({
      statusCode: 404,
      statusMessage: planError?.message || 'Plan not found'
    })
  }

  if (!plan.is_active) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Plan is not active'
    })
  }

  const { error: updateError } = await supabase
    .from('tenants')
    .update({
      current_plan_id: plan.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  await logPlatformAuditEvent({
    eventType: 'PLAN_SELECTED',
    tenantId,
    userId: (profile as any).id,
    details: {
      plan_id: plan.id,
      plan_code: plan.code,
      plan_name: plan.name,
      price_monthly: plan.price_monthly,
      currency: plan.currency
    }
  })

  return {
    success: true,
    data: {
      plan
    }
  }
})
