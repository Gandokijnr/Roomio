import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const token = (query.token || '').toString()

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required'
      })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    const { data, error } = await supabase
      .from('demo_requests')
      .select('email, name, hotel_name, room_count, status, invitation_expires_at')
      .eq('invitation_token', token)
      .maybeSingle()

    if (error || !data) {
      return { valid: false }
    }

    const now = new Date()
    const expiresAt = data.invitation_expires_at
      ? new Date(data.invitation_expires_at as any)
      : null

    if (data.status !== 'approved' || (expiresAt && expiresAt < now)) {
      return { valid: false }
    }

    return {
      valid: true,
      data: {
        email: data.email,
        name: data.name,
        hotel_name: data.hotel_name,
        room_count: data.room_count
      }
    }
  } catch (error: any) {
    console.error('Invitation validate error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
