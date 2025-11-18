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
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    { data: tenantRows, error: tenantsError },
    { count: pendingRequestsCount },
    { count: activeUsersCount },
    { count: errorCountLastHour },
    { count: totalEventsLast24h },
    { count: errorEventsLast24h },
    { count: totalRooms },
    { count: totalInventoryItems }
  ] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, status, subscription_plan, date_joined, updated_at'),
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
      .or('entity_type.eq.system,action.ilike.%error%'),
    supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString()),
    supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .or('entity_type.eq.system,action.ilike.%error%'),
    supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
  ])

  if (tenantsError) {
    throw createError({
      statusCode: 400,
      statusMessage: tenantsError.message
    })
  }

  const tenants = tenantRows || []
  const totalTenants = tenants.length

  const newTenantsLast30Days = tenants.filter((tenant: any) => {
    if (!tenant.date_joined) return false
    const joinedAt = new Date(tenant.date_joined)
    return joinedAt >= thirtyDaysAgo
  }).length

  const subscriptionBreakdown: Record<string, number> = {
    trial: 0,
    basic: 0,
    premium: 0,
    enterprise: 0,
    other: 0
  }

  const PLAN_PRICES: Record<string, number> = {
    trial: 0,
    basic: 79,
    premium: 149,
    enterprise: 299
  }

  let mrr = 0
  let churnedLast30Days = 0
  let activeAndChurnedBaseline = 0

  tenants.forEach((tenant: any) => {
    const plan = (tenant.subscription_plan || '').toLowerCase()
    const status = (tenant.status || '').toLowerCase()

    if (plan in subscriptionBreakdown) {
      subscriptionBreakdown[plan] += 1
    } else {
      subscriptionBreakdown.other += 1
    }

    if (status === 'active') {
      const price = PLAN_PRICES[plan] ?? 0
      mrr += price
      activeAndChurnedBaseline += 1
    }

    const updatedAt = tenant.updated_at ? new Date(tenant.updated_at) : null
    if (status === 'suspended' && updatedAt && updatedAt >= thirtyDaysAgo) {
      churnedLast30Days += 1
      activeAndChurnedBaseline += 1
    }
  })

  const churnRateLast30Days = activeAndChurnedBaseline > 0
    ? churnedLast30Days / activeAndChurnedBaseline
    : 0

  const errorThreshold = 5
  const systemHealthStatus = (errorCountLastHour || 0) >= errorThreshold ? 'red' as const : 'green' as const

  const totalEvents = totalEventsLast24h || 0
  const errorEvents = errorEventsLast24h || 0
  const errorRateLast24h = totalEvents > 0 ? errorEvents / totalEvents : 0

  return {
    success: true,
    data: {
      totalTenants,
      pendingRequests: pendingRequestsCount || 0,
      activeUsers: activeUsersCount || 0,
      systemHealth: {
        status: systemHealthStatus,
        errorCountLastHour: errorCountLastHour || 0,
        errorRateLast24h
      },
      newTenantsLast30Days,
      totalRooms: totalRooms || 0,
      totalInventoryItems: totalInventoryItems || 0,
      mrr,
      subscriptionBreakdown,
      churnRateLast30Days
    }
  }
})
