import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agencyId = profile.agency_id
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? '30' // days

  const periodDays = Math.min(Math.max(parseInt(period), 7), 365)
  const since = new Date()
  since.setDate(since.getDate() - periodDays)
  const sinceStr = since.toISOString().split('T')[0]

  // Run all queries in parallel
  const [
    bookingsKpi,
    clientsKpi,
    tasksKpi,
    revenueKpi,
    recentBookings,
    urgentTasks,
    revenueByDay,
    bookingsByStatus,
  ] = await Promise.all([
    // Total reservas + novas no período
    supabase
      .from('bookings')
      .select('id, status, created_at', { count: 'exact' })
      .eq('agency_id', agencyId),

    // Total clientes
    supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('agency_id', agencyId),

    // Tarefas pendentes
    supabase
      .from('tasks')
      .select('id, status, priority, due_date', { count: 'exact' })
      .eq('agency_id', agencyId)
      .in('status', ['todo', 'in_progress']),

    // Receita do período (transações income pagas)
    supabase
      .from('transactions')
      .select('amount, paid_at, due_date')
      .eq('agency_id', agencyId)
      .eq('type', 'income')
      .eq('status', 'paid')
      .gte('paid_at', sinceStr),

    // 5 reservas mais recentes
    supabase
      .from('bookings')
      .select(`
        id, reference_code, destination, status, departure_date, total_price, created_at,
        client:clients(id, full_name)
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Tarefas urgentes (alta prioridade, não concluídas, prazo <= 7 dias)
    supabase
      .from('tasks')
      .select(`
        id, title, priority, status, due_date,
        assigned_user:users!tasks_assigned_to_fkey(id, full_name),
        booking:bookings(id, reference_code)
      `)
      .eq('agency_id', agencyId)
      .in('status', ['todo', 'in_progress'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(5),

    // Receita por dia nos últimos 30 dias (income + expense paid)
    supabase
      .from('transactions')
      .select('type, amount, paid_at')
      .eq('agency_id', agencyId)
      .in('type', ['income', 'expense'])
      .eq('status', 'paid')
      .gte('paid_at', sinceStr)
      .not('paid_at', 'is', null),

    // Contagem de reservas por status
    supabase
      .from('bookings')
      .select('status')
      .eq('agency_id', agencyId),
  ])

  // --- Process KPIs ---
  const allBookings = bookingsKpi.data ?? []
  const newBookings = allBookings.filter((b) => b.created_at >= sinceStr + 'T00:00:00')
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed')
  const totalRevenuePeriod = (revenueKpi.data ?? []).reduce((s, t) => s + t.amount, 0)

  // Tasks overdue
  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = (tasksKpi.data ?? []).filter(
    (t) => t.due_date && t.due_date < today
  ).length

  // Status breakdown
  const statusCounts = ((bookingsByStatus.data ?? []) as { status: string }[]).reduce(
    (acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  // Revenue by day — last 30 days chart data
  const revenueMap: Record<string, { income: number; expense: number }> = {}
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    revenueMap[key] = { income: 0, expense: 0 }
  }
  for (const t of (revenueByDay.data ?? [])) {
    const key = t.paid_at!.split('T')[0]
    if (revenueMap[key]) {
      if (t.type === 'income')  revenueMap[key].income  += t.amount
      if (t.type === 'expense') revenueMap[key].expense += t.amount
    }
  }

  const chartData = Object.entries(revenueMap).map(([date, vals]) => ({
    date,
    income:  vals.income,
    expense: vals.expense,
    result:  vals.income - vals.expense,
  }))

  return NextResponse.json({
    kpis: {
      total_bookings:    allBookings.length,
      new_bookings:      newBookings.length,
      confirmed_bookings: confirmedBookings.length,
      total_clients:     clientsKpi.count ?? 0,
      pending_tasks:     tasksKpi.count   ?? 0,
      overdue_tasks:     overdueTasks,
      revenue_period:    totalRevenuePeriod,
    },
    bookings_by_status: statusCounts,
    recent_bookings:    recentBookings.data ?? [],
    urgent_tasks:       urgentTasks.data    ?? [],
    chart_data:         chartData,
    period_days:        periodDays,
    role:               profile.role,
  })
}
