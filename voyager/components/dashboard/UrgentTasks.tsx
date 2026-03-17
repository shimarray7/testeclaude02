import Link from 'next/link'
import { Calendar, Link2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/tarefas/PriorityBadge'
import type { TaskPriority } from '@/lib/validations/tarefa'

interface UrgentTask {
  id: string
  title: string
  priority: string
  status: string
  due_date?: string
  assigned_user?: { id: string; full_name: string } | null
  booking?: { id: string; reference_code: string } | null
}

export function UrgentTasks({ tasks }: { tasks: UrgentTask[] }) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">Nenhuma tarefa pendente.</p>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((t) => {
        const isOverdue = t.due_date && t.due_date < today
        return (
          <Link
            key={t.id}
            href={`/tarefas/${t.id}/editar`}
            className="flex items-start gap-3 py-3 hover:bg-gray-50 px-1 -mx-1 rounded-lg transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <PriorityBadge priority={t.priority as TaskPriority} />
                {t.due_date && (
                  <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                    <Calendar className="h-3 w-3" />
                    {formatDate(t.due_date)}
                    {isOverdue && ' ⚠'}
                  </span>
                )}
                {t.booking && (
                  <span className="flex items-center gap-1 text-xs font-mono text-blue-500">
                    <Link2 className="h-3 w-3" />
                    {t.booking.reference_code}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
