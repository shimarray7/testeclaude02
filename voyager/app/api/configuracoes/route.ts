import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { agenciaSchema } from '@/lib/validations/configuracoes'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', profile.agency_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem editar as configurações' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = agenciaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const sanitized = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === '' ? null : v])
  )

  const { data, error } = await supabase
    .from('agencies')
    .update(sanitized)
    .eq('id', profile.agency_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
