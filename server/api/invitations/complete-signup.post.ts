import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const token = (body.token || '').toString()
    const userId = (body.userId || '').toString()

    if (!token || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'token and userId are required'
      })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    // Find the demo request for this invitation token
    const { data: request, error: requestError } = await supabase
      .from('demo_requests')
      .select('id, email, name, hotel_name')
      .eq('invitation_token', token)
      .maybeSingle()

    if (requestError || !request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invitation not found'
      })
    }

    // Find the tenant created for this request
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('demo_request_id', request.id)
      .maybeSingle()

    if (tenantError || !tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found for this invitation'
      })
    }

    // Upsert profile for this user and assign as admin for the tenant
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: request.email,
          full_name: request.name,
          role: 'admin',
          is_active: true,
          tenant_id: tenant.id
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      throw createError({
        statusCode: 500,
        statusMessage: profileError.message || 'Failed to update profile'
      })
    }

    return {
      success: true,
      message: 'Invitation signup completed and admin assigned',
      tenantId: tenant.id
    }
  } catch (error: any) {
    console.error('complete-signup error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
