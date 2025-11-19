import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  await verifySuperAdmin(event)

  const query = getQuery(event)
  const tenantId = query.id as string | undefined

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

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, demo_request_id')
    .eq('id', tenantId)
    .maybeSingle()

  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: tenantError?.message || 'Tenant not found'
    })
  }

  if (!tenant.demo_request_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No demo request associated with this tenant'
    })
  }

  const { data: request, error: requestError } = await supabase
    .from('demo_requests')
    .select('id, invitation_token, status, invitation_expires_at, email, name, hotel_name')
    .eq('id', tenant.demo_request_id)
    .maybeSingle()

  if (requestError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: requestError?.message || 'Access request not found for this tenant'
    })
  }

  if (!request.invitation_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No invitation token generated for this request yet'
    })
  }

  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`

  const now = new Date()
  const expiresAt = request.invitation_expires_at
    ? new Date(request.invitation_expires_at as any).toISOString()
    : null

  const isExpired = expiresAt ? new Date(expiresAt) < now : false

  return {
    success: true,
    data: {
      invitationLink,
      status: request.status,
      expiresAt,
      expired: isExpired,
      email: request.email,
      name: request.name,
      hotelName: request.hotel_name
    }
  }
})
