import { createClient } from '@supabase/supabase-js'
import { verifyTenantUser } from '../../utils/verifyTenantUser'

export default defineEventHandler(async (event) => {
  try {
    const { profile } = await verifyTenantUser(event)

    const body = await readBody(event)
    const { full_name, email, phone, role, password } = body || {}

    if (!full_name || !email || !role || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'full_name, email, role and password are required'
      })
    }

    if (!profile.tenant_id && !profile.is_super_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Tenant context required to create staff'
      })
    }

    // Only admins, managers or super admins can create staff
    const allowedRoles = ['admin', 'manager']
    const currentRole = (profile as any).role as string | undefined

    if (!profile.is_super_admin && (!currentRole || !allowedRoles.includes(currentRole))) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only admins and managers can create staff'
      })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseServiceKey!
    )

    // Prevent creating super admin accounts from tenant UI
    if (role === 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot assign super_admin role from staff management'
      })
    }

    // Create auth user with metadata so the profile trigger populates base fields
    const { data: createResult, error: createErrorResult } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    })

    if (createErrorResult || !createResult?.user) {
      console.error('Failed to create staff user:', createErrorResult)
      throw createError({
        statusCode: 500,
        statusMessage: createErrorResult?.message || 'Failed to create staff user'
      })
    }

    const newUser = createResult.user

    // Attach staff to the same tenant and update optional fields
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        tenant_id: profile.tenant_id,
        phone: phone || null,
        role,
        is_active: true,
      })
      .eq('id', newUser.id)

    if (profileUpdateError) {
      console.error('Failed to update staff profile tenant:', profileUpdateError)
      throw createError({
        statusCode: 500,
        statusMessage: profileUpdateError.message || 'Failed to update staff profile'
      })
    }

    return {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
      },
    }
  } catch (error: any) {
    console.error('Create staff error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
