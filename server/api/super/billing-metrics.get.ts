import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const now = new Date()
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const cutoffIso = cutoff.toISOString()

  const { count: billingHoldCount, error: tenantsError } = await supabase
    .from('tenants')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'billing_hold')

  if (tenantsError) {
    throw createError({
      statusCode: 500,
      statusMessage: tenantsError.message
    })
  }

  const { data: auditEvents, error: auditError } = await supabase
    .from('platform_audit_events')
    .select('event_type, created_at')
    .gte('created_at', cutoffIso)
    .in('event_type', ['PAYMENT_SUCCESS', 'PAYMENT_FAILURE'])

  if (auditError) {
    throw createError({
      statusCode: 500,
      statusMessage: auditError.message
    })
  }

  const successes = (auditEvents || []).filter(e => e.event_type === 'PAYMENT_SUCCESS').length
  const failures = (auditEvents || []).filter(e => e.event_type === 'PAYMENT_FAILURE').length
  const total = successes + failures
  const successRate = total > 0 ? (successes / total) * 100 : 0

  return {
    success: true,
    data: {
      billing_hold_count: billingHoldCount || 0,
      payment_stats_24h: {
        successes,
        failures,
        total,
        success_rate: successRate
      }
    }
  }
})
