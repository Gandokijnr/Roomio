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

  const { data, error } = await supabase
    .from('platform_audit_events')
    .select('id, event_type, details, created_at')
    .eq('tenant_id', tenantId)
    .in('event_type', ['PAYMENT_SUCCESS', 'PAYMENT_FAILURE'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return {
    success: true,
    data: {
      events: data || []
    }
  }
})