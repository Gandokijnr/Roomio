import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const params = getRouterParams(event)
  const id = params.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request ID is required'
    })
  }

  const body = await readBody(event)
  const { reason } = body || {}

  const { data: request, error: fetchError } = await supabase
    .from('demo_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: fetchError?.message || 'Request not found'
    })
  }

  const { error: updateError } = await supabase
    .from('demo_requests')
    .update({
      status: 'rejected',
      notes: reason || request.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', request.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  await supabase
    .from('activity_logs')
    .insert({
      user_id: superAdmin.id,
      action: 'access_request_rejected',
      entity_type: 'system',
      entity_id: request.id,
      metadata: {
        hotel_name: request.hotel_name,
        email: request.email,
        reason: reason || null
      }
    })

  return {
    success: true,
    message: 'Request rejected'
  }
})
