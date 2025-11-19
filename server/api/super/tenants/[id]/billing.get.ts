import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const tenantId = event.context.params?.id as string | undefined

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant id is required'
    })
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, status, trial_end_date, subscription_end_date, paystack_customer_code, current_plan_id')
    .eq('id', tenantId)
    .maybeSingle()

  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: tenantError?.message || 'Tenant not found'
    })
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', tenant.current_plan_id)
    .maybeSingle()

  const { data: paymentEvents } = await supabase
    .from('platform_audit_events')
    .select('id, event_type, details, created_at')
    .eq('tenant_id', tenantId)
    .in('event_type', ['PAYMENT_SUCCESS', 'PAYMENT_FAILURE'])
    .order('created_at', { ascending: false })
    .limit(10)

  const lastPayment = paymentEvents && paymentEvents.length > 0
    ? paymentEvents[0]
    : null

  let subscriptionStartDate: string | null = null

  if (tenant.subscription_end_date) {
    const end = new Date(tenant.subscription_end_date as any)
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    subscriptionStartDate = start.toISOString()
  }

  return {
    success: true,
    data: {
      tenant_id: tenant.id,
      status: tenant.status,
      trial_end_date: tenant.trial_end_date,
      subscription_start_date: subscriptionStartDate,
      subscription_end_date: tenant.subscription_end_date,
      paystack_customer_code: tenant.paystack_customer_code,
      current_plan: plan || null,
      last_payment: lastPayment,
      payment_events: paymentEvents || []
    }
  }
})
