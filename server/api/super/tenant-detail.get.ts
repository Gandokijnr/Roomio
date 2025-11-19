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

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  return {
    success: true,
    data
  }
})
