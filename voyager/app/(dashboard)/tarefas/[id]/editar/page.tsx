import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TarefaForm } from '@/components/tarefas/TarefaForm'

export default async function EditarTarefaPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: tarefa, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !tarefa) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tarefas" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar Tarefa</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{tarefa.title}</p>
        </div>
      </div>

      <TarefaForm
        mode="edit"
        tarefaId={tarefa.id}
        defaultValues={{
          title:       tarefa.title,
          description: tarefa.description ?? '',
          status:      tarefa.status,
          priority:    tarefa.priority,
          assigned_to: tarefa.assigned_to ?? '',
          booking_id:  tarefa.booking_id  ?? '',
          due_date:    tarefa.due_date    ?? '',
        }}
      />
    </div>
  )
}
