import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inviteSchema } from '@/lib/validations/configuracoes'

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

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem convidar membros' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Check if e-mail already exists in the agency
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', parsed.data.email)
    .eq('agency_id', profile.agency_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Este e-mail já está cadastrado na sua agência.' },
      { status: 422 }
    )
  }

  // Use Supabase Auth admin to invite
  const { data: invited, error } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        agency_id: profile.agency_id,
        role:      parsed.data.role,
      },
    }
  )

  if (error) {
    // Graceful fallback: create pending user record
    const { data: pendingUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email:     parsed.data.email,
        full_name: parsed.data.email.split('@')[0],
        role:      parsed.data.role,
        agency_id: profile.agency_id,
        is_active: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(
      { ...pendingUser, invited: true, note: 'Convite pendente — usuário ainda não ativou a conta.' },
      { status: 201 }
    )
  }

  return NextResponse.json({ id: invited.user?.id, email: invited.user?.email, invited: true }, { status: 201 })
}
