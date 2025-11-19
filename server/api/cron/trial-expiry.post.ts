import { createClient } from '@supabase/supabase-js'
import { logPlatformAuditEvent } from '../../utils/logPlatformAuditEvent'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const now = new Date()
  const cutoffIso = now.toISOString()

  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, status, trial_end_date')
    .eq('status', 'trial')
    .lt('trial_end_date', cutoffIso)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  const expired = tenants || []

  for (const tenant of expired) {
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        status: 'billing_hold',
        updated_at: now.toISOString()
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Failed to update tenant to billing_hold for trial expiry', {
        tenantId: tenant.id,
        error: updateError
      })
      continue
    }

    await logPlatformAuditEvent({
      eventType: 'TRIAL_EXPIRED',
      tenantId: tenant.id,
      details: {
        trial_end_date: tenant.trial_end_date,
        processed_at: now.toISOString()
      }
    })
  }

  return {
    success: true,
    data: {
      processed: expired.length
    }
  }
})
