import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  await verifySuperAdmin(event)

  const query = getQuery(event)
  const id = query.id as string | undefined
  const tenantId = id && String(id)

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant ID is required'
    })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const { limit = 50 } = query
  const max = Math.min(parseInt(String(limit)) || 50, 200)

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(max)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  const events = (data || []).map((log) => {
    let type = log.action as string
    let title = log.action as string

    if (log.entity_type === 'tenant' && log.action === 'tenant_status_updated') {
      type = 'tenant_status'
      title = 'Tenant status updated'
    } else if (log.entity_type === 'tenant' && log.action === 'tenant_plan_updated') {
      type = 'tenant_plan'
      title = 'Tenant plan updated'
    } else if (log.entity_type === 'tenant' && log.action === 'access_request_approved') {
      type = 'tenant_created'
      title = 'New tenant created'
    } else if (log.entity_type === 'system' && log.action?.toLowerCase().includes('error')) {
      type = 'system_error'
      title = 'System error'
    }

    return {
      id: log.id,
      type,
      title,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    }
  })

  return {
    success: true,
    data: {
      events
    }
  }
})
