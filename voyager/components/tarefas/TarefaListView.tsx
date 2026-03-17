'use client'

import Link from 'next/link'
import { Calendar, User, Link2, ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { PriorityBadge } from './PriorityBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Task } from './TarefaCard'
import type { TaskStatus } from '@/lib/validations/tarefa'

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo:        'A fazer',
  in_progress: 'Em andamento',
  done:        'Concluída',
}
const STATUS_STYLES: Record<TaskStatus, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-green-100 text-green-700',
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress', in_progress: 'done', done: null,
}

interface Props {
  data: Task[]
  loading: boolean
  onRefetch: () => void
}

export function TarefaListView({ data, loading, onRefetch }: Props) {
  async function handleAdvance(task: Task) {
    const next = NEXT_STATUS[task.status]
    if (!next) return
    const res = await fetch(`/api/tarefas/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) onRefetch()
    else toast.error('Erro ao atualizar tarefa')
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return
    const res = await fetch(`/api/tarefas/${id}`, { method: 'DELETE' })
    if (res.ok) onRefetch()
    else toast.error('Erro ao excluir tarefa')
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-400 font-medium">Nenhuma tarefa encontrada</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Prioridade</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Prazo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reserva</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((t) => {
              const isOverdue =
                t.status !== 'done' &&
                t.due_date &&
                new Date(t.due_date) < new Date(new Date().toDateString())

              return (
                <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.status === 'done' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tarefas/${t.id}/editar`}
                      className={`font-medium hover:text-blue-600 hover:underline ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}
                    >
                      {t.title}
                    </Link>
                    {t.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{t.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {t.due_date ? (
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {formatDate(t.due_date)} {isOverdue ? '⚠' : ''}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {t.assigned_user ? (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        {t.assigned_user.full_name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.booking ? (
                      <Link href={`/reservas/${t.booking.id}`} className="font-mono text-blue-600 hover:underline flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {t.booking.reference_code}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {NEXT_STATUS[t.status] && (
                        <button
                          onClick={() => handleAdvance(t)}
                          title="Avançar status"
                          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((t) => (
          <div key={t.id} className={`p-4 ${t.status === 'done' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/tarefas/${t.id}/editar`}
                  className={`text-sm font-medium hover:text-blue-600 ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}
                >
                  {t.title}
                </Link>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <PriorityBadge priority={t.priority} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                  {t.due_date && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(t.due_date)}
                    </span>
                  )}
                </div>
              </div>
              {NEXT_STATUS[t.status] && (
                <button
                  onClick={() => handleAdvance(t)}
                  className="flex-shrink-0 p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
