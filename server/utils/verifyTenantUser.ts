import { createClient } from '@supabase/supabase-js'

interface TenantProfile {
  id: string
  tenant_id: string | null
  is_super_admin?: boolean
  role?: string
}

export const verifyTenantUser = async (event: any) => {
  const authHeader =
    event.node?.req?.headers['authorization'] ||
    event.node?.req?.headers['Authorization']

  if (!authHeader || Array.isArray(authHeader)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authorization header'
    })
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authorization header'
    })
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
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, tenant_id, is_super_admin, role')
    .eq('id', user.id)
    .maybeSingle<TenantProfile>()

  if (profileError || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Profile not found'
    })
  }

  if (!profile.tenant_id && !profile.is_super_admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Tenant access required'
    })
  }

  return { user, profile }
}
