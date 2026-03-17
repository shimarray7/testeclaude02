import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelarReservaSchema } from '@/lib/validations/reserva'

// POST /api/reservas/[id]/cancelar
export async function POST(
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

  if (profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão para cancelar reservas' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = cancelarReservaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('status, history, total_price, reference_code, transactions(status, type)')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.status === 'completed') {
    return NextResponse.json({ error: 'Reserva concluída não pode ser cancelada' }, { status: 422 })
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Reserva já está cancelada' }, { status: 422 })
  }

  const historyEntry = {
    from_status: booking.status,
    to_status: 'cancelled',
    changed_by: user.id,
    changed_at: new Date().toISOString(),
    note: parsed.data.cancelled_reason,
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_reason: parsed.data.cancelled_reason,
      history: [...(booking.history as unknown[]), historyEntry],
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-create refund if there was a paid income
  const paidIncome = (booking.transactions as { status: string; type: string }[])
    ?.some((t) => t.status === 'paid' && t.type === 'income')
  if (paidIncome) {
    await supabase.from('transactions').insert({
      agency_id: profile.agency_id,
      booking_id: params.id,
      type: 'refund',
      status: 'pending',
      amount: booking.total_price,
      description: `Reembolso — reserva cancelada ${booking.reference_code}`,
      created_by: user.id,
    })
  }

  return NextResponse.json(updated)
}
