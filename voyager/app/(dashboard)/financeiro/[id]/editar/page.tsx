import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TransacaoForm } from '@/components/financeiro/TransacaoForm'

export default async function EditarTransacaoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'atendente') redirect('/financeiro')

  const { data: transacao, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !transacao) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/financeiro" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar Transação</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{transacao.description}</p>
        </div>
      </div>

      <TransacaoForm
        mode="edit"
        transacaoId={transacao.id}
        defaultValues={{
          type:        transacao.type,
          status:      transacao.status,
          amount:      transacao.amount,
          description: transacao.description,
          due_date:    transacao.due_date ?? '',
          paid_at:     transacao.paid_at ?? '',
          booking_id:  transacao.booking_id ?? '',
          category:    transacao.category ?? '',
          notes:       transacao.notes ?? '',
        }}
      />
    </div>
  )
}
