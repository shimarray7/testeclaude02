import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PerfilForm } from '@/components/configuracoes/PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, phone, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      <PerfilForm
        defaultValues={{
          full_name:  profile.full_name,
          phone:      profile.phone     ?? '',
          avatar_url: profile.avatar_url ?? '',
          email:      profile.email     ?? '',
          role:       profile.role,
        }}
      />
    </div>
  )
}
