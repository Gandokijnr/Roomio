import { createClient } from '@supabase/supabase-js'
import { logPlatformAuditEvent } from '../utils/logPlatformAuditEvent'

export default defineEventHandler(async (event) => {
  const req = event.node.req
  const url = req.url || ''

  // Allow public and super-admin/super APIs to bypass tenant billing checks
  if (
    url.startsWith('/api/super') ||
    url.startsWith('/api/paystack') ||
    url.startsWith('/webhooks/paystack') ||
    url.startsWith('/api/auth')
  ) {
    return
  }

  const authHeader =
    req.headers['authorization'] ||
    req.headers['Authorization']

  if (!authHeader || Array.isArray(authHeader)) {
    // Let other auth middleware handle 401s – this middleware is only about billing
    return
  }

  const [scheme, token] = String(authHeader).split(' ')

  if (scheme !== 'Bearer' || !token) {
    return
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, is_super_admin')
    .eq('id', user.id)
    .maybeSingle()

  // Super admins bypass billing gating
  if (!profile || profile.is_super_admin) {
    return
  }

  if (!profile.tenant_id) {
    return
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, status')
    .eq('id', profile.tenant_id)
    .maybeSingle()

  if (!tenant) {
    return
  }

  if (tenant.status === 'billing_hold') {
    await logPlatformAuditEvent({
      eventType: 'BLOCKED_ACCESS',
      tenantId: tenant.id,
      userId: user.id,
      details: {
        route: url,
        method: req.method
      }
    })

    throw createError({
      statusCode: 403,
      statusMessage: 'Billing required to continue using Roomio'
    })
  }
})
