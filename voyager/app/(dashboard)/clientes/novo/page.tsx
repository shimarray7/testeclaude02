import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ClienteForm } from '@/components/clientes/ClienteForm'

export default async function NovoClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Novo Cliente</h1>
        </div>
      </div>

      <ClienteForm mode="create" />
    </div>
  )
}
