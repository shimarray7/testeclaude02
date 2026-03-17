import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reservaSchema, statusTransitionSchema } from '@/lib/validations/reserva'

// GET /api/reservas/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, email, phone, cpf, passport_number, passport_expiry),
      assigned_user:users!bookings_assigned_to_fkey(id, full_name, role),
      transactions(*),
      tasks(*, assigned_user:users!tasks_assigned_to_fkey(id, full_name))
    `)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (profile.role === 'atendente') {
    const { cost_price: _cp, ...rest } = booking // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json(rest)
  }

  return NextResponse.json(booking)
}

// PUT /api/reservas/[id] — update fields or status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Status transition?
  if ('status' in body && Object.keys(body).length <= 2) {
    return handleStatusTransition(supabase, profile, user.id, params.id, body)
  }

  // Field update
  const parsed = reservaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Prevent editing reference_code
  const { data: existing } = await supabase
    .from('bookings')
    .select('reference_code, status')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(parsed.data)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(booking)
}

async function handleStatusTransition(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  profile: { agency_id: string; role: string },
  userId: string,
  bookingId: string,
  body: { status: string; note?: string }
) {
  const parsed = statusTransitionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const newStatus = parsed.data.status

  // Fetch current booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status, history, total_price, transactions(status, type)')
    .eq('id', bookingId)
    .eq('agency_id', profile.agency_id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only gestor/admin can cancel
  if (newStatus === 'cancelled' && profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão para cancelar reservas' }, { status: 403 })
  }

  // Cannot transition from completed
  if (booking.status === 'completed' && newStatus !== 'completed') {
    return NextResponse.json({ error: 'Reserva concluída não pode ser alterada' }, { status: 422 })
  }

  const historyEntry = {
    from_status: booking.status,
    to_status: newStatus,
    changed_by: userId,
    changed_at: new Date().toISOString(),
    note: parsed.data.note ?? null,
  }

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    history: [...(booking.history as unknown[]), historyEntry],
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Side effects
  if (newStatus === 'confirmed') {
    // Auto-create income transaction
    await supabase.from('transactions').insert({
      agency_id: profile.agency_id,
      booking_id: bookingId,
      type: 'income',
      status: 'pending',
      amount: booking.total_price,
      description: `Receita da reserva ${updated.reference_code}`,
      created_by: userId,
    })
  }

  if (newStatus === 'cancelled') {
    // Check if there was a paid income transaction → create refund
    const paidTransactions = (booking.transactions as { status: string; type: string }[])
      ?.filter((t) => t.status === 'paid' && t.type === 'income')
    if (paidTransactions?.length) {
      await supabase.from('transactions').insert({
        agency_id: profile.agency_id,
        booking_id: bookingId,
        type: 'refund',
        status: 'pending',
        amount: booking.total_price,
        description: `Reembolso — reserva cancelada ${updated.reference_code}`,
        created_by: userId,
      })
    }
  }

  return NextResponse.json(updated)
}
