import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transacaoSchema } from '@/lib/validations/transacao'

// GET /api/financeiro — list + DRE summary
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

  // atendente cannot see financials
  if (profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type       = searchParams.get('type')
  const status     = searchParams.get('status')
  const from       = searchParams.get('from')
  const to         = searchParams.get('to')
  const bookingId  = searchParams.get('booking_id')
  const page       = parseInt(searchParams.get('page') ?? '1')
  const limit      = parseInt(searchParams.get('limit') ?? '30')
  const offset     = (page - 1) * limit
  const summaryOnly = searchParams.get('summary') === 'true'

  // DRE summary query (always returned)
  const dreQuery = supabase
    .from('transactions')
    .select('type, status, amount')
    .eq('agency_id', profile.agency_id)
    .neq('status', 'cancelled')

  if (from) dreQuery.gte('due_date', from)
  if (to)   dreQuery.lte('due_date', to)

  const { data: dreRows } = await dreQuery

  const dreBase = (dreRows ?? []).reduce(
    (acc, t) => {
      if (t.type === 'income' && t.status === 'paid')   acc.receitas_realizadas += t.amount
      if (t.type === 'income' && t.status !== 'paid')   acc.receitas_previstas  += t.amount
      if (t.type === 'expense' && t.status === 'paid')  acc.despesas_realizadas += t.amount
      if (t.type === 'expense' && t.status !== 'paid')  acc.despesas_previstas  += t.amount
      if (t.type === 'refund')                          acc.reembolsos          += t.amount
      return acc
    },
    {
      receitas_realizadas: 0,
      receitas_previstas:  0,
      despesas_realizadas: 0,
      despesas_previstas:  0,
      reembolsos:          0,
    }
  )

  const dre = {
    ...dreBase,
    resultado_realizado: dreBase.receitas_realizadas - dreBase.despesas_realizadas - dreBase.reembolsos,
    resultado_previsto:  (dreBase.receitas_realizadas + dreBase.receitas_previstas)
                         - (dreBase.despesas_realizadas + dreBase.despesas_previstas)
                         - dreBase.reembolsos,
  }

  if (summaryOnly) return NextResponse.json({ dre })

  // Transactions list
  let query = supabase
    .from('transactions')
    .select(`
      *,
      booking:bookings(id, reference_code, destination),
      created_by_user:users!transactions_created_by_fkey(id, full_name)
    `, { count: 'exact' })
    .eq('agency_id', profile.agency_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type)      query = query.eq('type', type)
  if (status)    query = query.eq('status', status)
  if (bookingId) query = query.eq('booking_id', bookingId)
  if (from)      query = query.gte('due_date', from)
  if (to)        query = query.lte('due_date', to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit, dre })
}

// POST /api/financeiro — create
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = transacaoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const sanitized = {
    ...parsed.data,
    booking_id: parsed.data.booking_id || null,
    agency_id: profile.agency_id,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(sanitized)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
