'use client'

import Link from 'next/link'
import { Calendar, User, Link2, ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { PriorityBadge } from './PriorityBadge'
import type { TaskStatus, TaskPriority } from '@/lib/validations/tarefa'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  assigned_user?: { id: string; full_name: string } | null
  booking?: { id: string; reference_code: string; destination: string } | null
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo:        'in_progress',
  in_progress: 'done',
  done:        null,
}

const NEXT_LABEL: Record<TaskStatus, string> = {
  todo:        'Iniciar',
  in_progress: 'Concluir',
  done:        '',
}

interface TarefaCardProps {
  task: Task
  onUpdate: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

export function TarefaCard({ task, onUpdate, onDelete }: TarefaCardProps) {
  const nextStatus = NEXT_STATUS[task.status]

  const isOverdue =
    task.status !== 'done' &&
    task.due_date &&
    new Date(task.due_date) < new Date(new Date().toDateString())

  async function handleAdvance() {
    if (!nextStatus) return
    const res = await fetch(`/api/tarefas/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) onUpdate(task.id, nextStatus)
    else toast.error('Erro ao atualizar tarefa')
  }

  async function handleDelete() {
    if (!confirm(`Excluir tarefa "${task.title}"?`)) return
    const res = await fetch(`/api/tarefas/${task.id}`, { method: 'DELETE' })
    if (res.ok) onDelete(task.id)
    else toast.error('Erro ao excluir tarefa')
  }

  return (
    <div
      className={`bg-white rounded-lg border p-3 shadow-sm space-y-2.5 hover:shadow-md transition-shadow ${
        task.status === 'done' ? 'opacity-60' : ''
      } ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/tarefas/${task.id}/editar`}
          className={`text-sm font-semibold leading-snug hover:text-blue-600 flex-1 ${
            task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </Link>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        {task.due_date && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
            {isOverdue && ' ⚠'}
          </span>
        )}
        {task.assigned_user && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assigned_user.full_name}
          </span>
        )}
        {task.booking && (
          <Link
            href={`/reservas/${task.booking.id}`}
            className="flex items-center gap-1 text-blue-500 hover:underline font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 className="h-3 w-3" />
            {task.booking.reference_code}
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        {nextStatus ? (
          <button
            onClick={handleAdvance}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {NEXT_LABEL[task.status]}
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : (
          <span className="text-xs text-green-600 font-medium">✓ Concluída</span>
        )}
        <button
          onClick={handleDelete}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
