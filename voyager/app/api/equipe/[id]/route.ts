import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateRoleSchema } from '@/lib/validations/configuracoes'

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

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem alterar papéis' }, { status: 403 })
  }

  // Cannot change own role
  if (params.id === user.id) {
    return NextResponse.json({ error: 'Não é possível alterar seu próprio papel' }, { status: 422 })
  }

  const body = await request.json()
  const parsed = updateRoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Confirm target user belongs to same agency
  const { data: target } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', params.id)
    .single()

  if (!target || target.agency_id !== profile.agency_id) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', params.id)
    .select('id, full_name, email, role, is_active')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
