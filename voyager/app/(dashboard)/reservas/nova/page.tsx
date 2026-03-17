import { redirect } from 'next/navigation'
import { ArrowLeft, PlaneTakeoff } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReservaForm } from '@/components/reservas/ReservaForm'

export default async function NovaReservaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const canViewCostPrice = profile?.role === 'admin' || profile?.role === 'gestor'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/reservas" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Nova Reserva</h1>
        </div>
      </div>

      <ReservaForm mode="create" canViewCostPrice={canViewCostPrice} />
    </div>
  )
}
