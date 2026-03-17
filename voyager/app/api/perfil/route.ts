import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { perfilSchema } from '@/lib/validations/configuracoes'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, avatar_url, role, agency_id, is_active, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = perfilSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const sanitized = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === '' ? null : v])
  )

  const { data, error } = await supabase
    .from('users')
    .update(sanitized)
    .eq('id', user.id)
    .select('id, full_name, email, phone, avatar_url, role')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
