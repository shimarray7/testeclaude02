import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TarefaForm } from '@/components/tarefas/TarefaForm'

export default async function NovaTarefaPage({
  searchParams,
}: {
  searchParams: { booking_id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tarefas" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Nova Tarefa</h1>
        </div>
      </div>

      <TarefaForm
        mode="create"
        defaultValues={{ booking_id: searchParams.booking_id ?? '' }}
      />
    </div>
  )
}
