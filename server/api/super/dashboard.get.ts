import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../utils/verifySuperAdmin'

export default defineEventHandler(async (event) => {
  await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const now = new Date()
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const [{ count: tenantsCount }, { count: pendingRequestsCount }, { count: activeUsersCount }, { count: errorCount }] = await Promise.all([
    supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('demo_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', fifteenMinutesAgo.toISOString()),
    supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString())
      .or('entity_type.eq.system,action.ilike.%error%')
  ])

  const errorThreshold = 5
  const systemHealthStatus = (errorCount || 0) >= errorThreshold ? 'red' as const : 'green' as const

  return {
    success: true,
    data: {
      totalTenants: tenantsCount || 0,
      pendingRequests: pendingRequestsCount || 0,
      activeUsers: activeUsersCount || 0,
      systemHealth: {
        status: systemHealthStatus,
        errorCountLastHour: errorCount || 0
      }
    }
  }
})
