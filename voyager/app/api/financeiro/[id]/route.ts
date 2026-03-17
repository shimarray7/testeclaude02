import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transacaoSchema, marcarPagoSchema } from '@/lib/validations/transacao'

// GET /api/financeiro/[id]
export async function GET(
  _req: NextRequest,
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
  if (!profile || profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      booking:bookings(id, reference_code, destination),
      created_by_user:users!transactions_created_by_fkey(id, full_name)
    `)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

// PUT /api/financeiro/[id]
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
  if (!profile || profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()

  // Marking as paid?
  if ('paid_at' in body && Object.keys(body).length <= 2) {
    const parsed = marcarPagoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }
    const { data, error } = await supabase
      .from('transactions')
      .update({ status: 'paid', paid_at: parsed.data.paid_at })
      .eq('id', params.id)
      .eq('agency_id', profile.agency_id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const parsed = transacaoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const sanitized = {
    ...parsed.data,
    booking_id: parsed.data.booking_id || null,
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(sanitized)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/financeiro/[id]
export async function DELETE(
  _req: NextRequest,
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
  if (!profile || profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  // Only allow deleting pending/cancelled transactions
  const { data: existing } = await supabase
    .from('transactions')
    .select('status')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.status === 'paid') {
    return NextResponse.json(
      { error: 'Não é possível excluir uma transação já paga.' },
      { status: 422 }
    )
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
