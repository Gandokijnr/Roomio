import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  const profile = await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const query = getQuery(event)
  const { status, search, page = 1, limit = 25 } = query

  const pageNumber = parseInt(String(page)) || 1
  const pageSize = Math.min(parseInt(String(limit)) || 25, 100)
  const from = (pageNumber - 1) * pageSize
  const to = from + pageSize - 1

  let builder = supabase
    .from('tenants')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && typeof status === 'string') {
    builder = builder.eq('status', status)
  }

  if (search && typeof search === 'string') {
    builder = builder.or(
      `name.ilike.%${search}%,primary_contact_email.ilike.%${search}%,primary_contact_name.ilike.%${search}%`
    )
  }

  const { data, error, count } = await builder

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return {
    success: true,
    data: {
      tenants: data || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize
    }
  }
})
