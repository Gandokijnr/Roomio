import { createClient } from '@supabase/supabase-js'
import { verifyTenantUser } from '../../utils/verifyTenantUser'

export default defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event)

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

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .maybeSingle()

  if (error || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: error?.message || 'Tenant not found'
    })
  }

  const updatedTenant = tenant

  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (plansError) {
    throw createError({
      statusCode: 500,
      statusMessage: plansError.message
    })
  }

  const currentPlan = updatedTenant.current_plan_id
    ? plans?.find((p: any) => p.id === updatedTenant.current_plan_id) || null
    : null

  return {
    success: true,
    data: {
      tenant: {
        id: updatedTenant.id,
        status: updatedTenant.status,
        trial_end_date: updatedTenant.trial_end_date,
        subscription_end_date: updatedTenant.subscription_end_date,
        current_plan_id: updatedTenant.current_plan_id
      },
      current_plan: currentPlan,
      available_plans: plans || []
    }
  }
})
