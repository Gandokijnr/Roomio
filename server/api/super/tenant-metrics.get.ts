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

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10)

  const [
    { count: totalRooms },
    { count: activeRooms },
    { data: reservationsRows, error: reservationsError },
    { data: invoicesRows, error: invoicesError },
    { count: fbOrdersLast30Days },
    { count: staffCount }
  ] = await Promise.all([
    supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['available', 'occupied', 'reserved']),
    supabase
      .from('reservations')
      .select('id, total_amount, check_in_date, check_out_date, status')
      .eq('tenant_id', tenantId)
      .gte('check_in_date', thirtyDaysAgoDate),
    supabase
      .from('invoices')
      .select('total_amount, issue_date')
      .eq('tenant_id', tenantId)
      .gte('issue_date', thirtyDaysAgoDate),
    supabase
      .from('restaurant_orders')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('order_time', thirtyDaysAgo.toISOString()),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
  ])

  if (reservationsError) {
    throw createError({
      statusCode: 400,
      statusMessage: reservationsError.message
    })
  }

  if (invoicesError) {
    throw createError({
      statusCode: 400,
      statusMessage: invoicesError.message
    })
  }

  const reservations = reservationsRows || []
  const invoices = invoicesRows || []

  const reservationsLast30Days = reservations.length
  const revenueLast30Days = invoices.reduce((sum: number, invoice: any) => {
    const amount = Number(invoice.total_amount) || 0
    return sum + amount
  }, 0)

  let occupiedNights = 0
  const nowDateOnly = new Date(now.toISOString().slice(0, 10))

  reservations.forEach((reservation: any) => {
    if (!reservation.check_in_date || !reservation.check_out_date) return

    const checkIn = new Date(reservation.check_in_date)
    const checkOut = new Date(reservation.check_out_date)

    const rangeStart = checkIn < thirtyDaysAgo ? thirtyDaysAgo : checkIn
    const rangeEnd = checkOut > nowDateOnly ? nowDateOnly : checkOut

    const diffMs = rangeEnd.getTime() - rangeStart.getTime()
    const nights = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))

    occupiedNights += nights
  })

  const totalRoomNights = (totalRooms || 0) * 30
  const occupancyRate30Days = totalRoomNights > 0 ? occupiedNights / totalRoomNights : 0

  const reservationsRevenue = reservations.reduce((sum: number, reservation: any) => {
    const amount = Number(reservation.total_amount) || 0
    return sum + amount
  }, 0)

  const adr30Days = occupiedNights > 0 ? reservationsRevenue / occupiedNights : 0

  return {
    success: true,
    data: {
      rooms: {
        totalRooms: totalRooms || 0,
        activeRooms: activeRooms || 0,
        reservationsLast30Days,
        occupancyRate30Days,
        adr30Days
      },
      revenue: {
        revenueLast30Days
      },
      fb: {
        fbOrdersLast30Days: fbOrdersLast30Days || 0
      },
      staff: {
        staffCount: staffCount || 0
      }
    }
  }
})
