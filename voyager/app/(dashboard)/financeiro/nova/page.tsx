import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TransacaoForm } from '@/components/financeiro/TransacaoForm'

export default async function NovaTransacaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'atendente') redirect('/financeiro')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/financeiro" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Nova Transação</h1>
        </div>
      </div>
      <TransacaoForm mode="create" />
    </div>
  )
}
