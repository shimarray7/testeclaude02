import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reservaSchema } from '@/lib/validations/reserva'

// GET /api/reservas — list with filters
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

  const { searchParams } = new URL(request.url)
  const status    = searchParams.get('status')
  const search    = searchParams.get('search')
  const assignedTo = searchParams.get('assigned_to')
  const from      = searchParams.get('from')
  const to        = searchParams.get('to')
  const page      = parseInt(searchParams.get('page') ?? '1')
  const limit     = parseInt(searchParams.get('limit') ?? '20')
  const offset    = (page - 1) * limit

  let query = supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, email, phone),
      assigned_user:users!bookings_assigned_to_fkey(id, full_name, role)
    `, { count: 'exact' })
    .eq('agency_id', profile.agency_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (assignedTo) query = query.eq('assigned_to', assignedTo)
  if (from) query = query.gte('departure_date', from)
  if (to)   query = query.lte('departure_date', to)
  if (search) {
    query = query.or(
      `destination.ilike.%${search}%,reference_code.ilike.%${search}%`
    )
  }

  // Atendente: hide cost_price — handled via RLS + we strip it here
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Strip cost_price for atendente
  const result = data?.map((b) => {
    if (profile.role === 'atendente') {
      const { cost_price: _cp, ...rest } = b // eslint-disable-line @typescript-eslint/no-unused-vars
      return rest
    }
    return b
  })

  return NextResponse.json({ data: result, total: count, page, limit })
}

// POST /api/reservas — create
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

  const body = await request.json()
  const parsed = reservaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Generate reference_code server-side
  const { data: codeResult, error: codeError } = await supabase
    .rpc('generate_reference_code', { p_agency_id: profile.agency_id })
  if (codeError) return NextResponse.json({ error: codeError.message }, { status: 500 })

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      ...parsed.data,
      agency_id: profile.agency_id,
      reference_code: codeResult,
      status: 'draft',
      history: [
        {
          from_status: null,
          to_status: 'draft',
          changed_by: user.id,
          changed_at: new Date().toISOString(),
          note: 'Reserva criada',
        },
      ],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(booking, { status: 201 })
}
