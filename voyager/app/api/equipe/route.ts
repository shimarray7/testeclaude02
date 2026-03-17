import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Only admin/gestor can list team
  if (profile.role === 'atendente') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, role, is_active, avatar_url, created_at')
    .eq('agency_id', profile.agency_id)
    .order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
