import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tarefaSchema } from '@/lib/validations/tarefa'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role, id')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status     = searchParams.get('status')
  const priority   = searchParams.get('priority')
  const assignedTo = searchParams.get('assigned_to')
  const bookingId  = searchParams.get('booking_id')
  const mine       = searchParams.get('mine') === 'true'
  const page       = parseInt(searchParams.get('page') ?? '1')
  const limit      = parseInt(searchParams.get('limit') ?? '50')
  const offset     = (page - 1) * limit

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(id, full_name),
      booking:bookings(id, reference_code, destination)
    `, { count: 'exact' })
    .eq('agency_id', profile.agency_id)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)     query = query.eq('status', status)
  if (priority)   query = query.eq('priority', priority)
  if (bookingId)  query = query.eq('booking_id', bookingId)
  if (assignedTo) query = query.eq('assigned_to', assignedTo)
  if (mine)       query = query.eq('assigned_to', profile.id)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = tarefaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const sanitized = {
    ...parsed.data,
    assigned_to: parsed.data.assigned_to || null,
    booking_id:  parsed.data.booking_id  || null,
    agency_id:   profile.agency_id,
    created_by:  user.id,
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(sanitized)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
