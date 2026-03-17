import type { TaskPriority } from '@/lib/validations/tarefa'

const config: Record<TaskPriority, { label: string; cls: string }> = {
  low:    { label: 'Baixa',  cls: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Média',  cls: 'bg-blue-100 text-blue-700' },
  high:   { label: 'Alta',   cls: 'bg-red-100 text-red-700' },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, cls } = config[priority] ?? config.medium
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
