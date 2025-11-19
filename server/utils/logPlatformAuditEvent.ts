import { createClient } from '@supabase/supabase-js'

interface AuditDetails {
  [key: string]: any
}

export const logPlatformAuditEvent = async (params: {
  eventType: string
  tenantId?: string | null
  userId?: string | null
  details?: AuditDetails
}) => {
  const config = useRuntimeConfig()

  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    console.error('Missing Supabase config for audit logging')
    return
  }

  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

    await supabase.from('platform_audit_events').insert({
      event_type: params.eventType,
      tenant_id: params.tenantId || null,
      user_id: params.userId || null,
      details: params.details || {},
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to write platform audit event', error)
  }
}
