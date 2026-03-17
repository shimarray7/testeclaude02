'use client'

import { useState } from 'react'
import { TarefaCard, type Task } from './TarefaCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { TaskStatus } from '@/lib/validations/tarefa'

const COLUMNS: { status: TaskStatus; label: string; color: string; dot: string }[] = [
  { status: 'todo',        label: 'A fazer',       color: 'bg-gray-50 border-gray-200',   dot: 'bg-gray-400' },
  { status: 'in_progress', label: 'Em andamento',  color: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500' },
  { status: 'done',        label: 'Concluída',     color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
]

interface KanbanBoardProps {
  data: Task[]
  loading: boolean
  onRefetch: () => void
}

export function KanbanBoard({ data, loading, onRefetch }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  // Sync when data changes (from parent)
  const displayTasks = data.length > 0 || !loading ? data : tasks

  function handleUpdate(id: string, status: TaskStatus) {
    // Optimistic update
    const updated = (displayTasks.length ? displayTasks : tasks).map((t) =>
      t.id === id ? { ...t, status } : t
    )
    setTasks(updated)
    onRefetch()
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    onRefetch()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="space-y-2">
            <Skeleton className="h-8 w-32 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const byStatus = Object.fromEntries(
    COLUMNS.map((col) => [col.status, displayTasks.filter((t) => t.status === col.status)])
  ) as Record<TaskStatus, Task[]>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = byStatus[col.status] ?? []
        return (
          <div key={col.status} className="flex flex-col gap-2">
            {/* Column header */}
            <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[120px]">
              {colTasks.length === 0 ? (
                <div className="flex-1 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center p-6">
                  <p className="text-xs text-gray-400">Sem tarefas</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TarefaCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
