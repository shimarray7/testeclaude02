'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CheckSquare, Plus, X, LayoutGrid, List } from 'lucide-react'
import { KanbanBoard } from '@/components/tarefas/KanbanBoard'
import { TarefaListView } from '@/components/tarefas/TarefaListView'
import { Button } from '@/components/ui/button'
import type { Task } from '@/components/tarefas/TarefaCard'

const PRIORITY_OPTIONS = [
  { value: '',       label: 'Todas as prioridades' },
  { value: 'high',   label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low',    label: 'Baixa' },
]

export default function TarefasPage() {
  const [data, setData]         = useState<Task[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'kanban' | 'list'>('kanban')
  const [priority, setPriority] = useState('')
  const [mine, setMine]         = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (priority) params.set('priority', priority)
    if (mine)     params.set('mine', 'true')

    fetch(`/api/tarefas?${params}`)
      .then((r) => r.json())
      .then((j) => { setData(j.data ?? []); setTotal(j.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [priority, mine])

  useEffect(() => { fetchData() }, [fetchData])

  const hasFilters = priority || mine

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          {!loading && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 h-9 text-sm transition-colors ${
                view === 'kanban' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 h-9 text-sm border-l border-gray-300 transition-colors ${
                view === 'list' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>
          <Link href="/tarefas/nova">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setMine((v) => !v)}
          className={`flex items-center gap-1.5 h-10 px-3 rounded-md border text-sm transition-colors ${
            mine
              ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Minhas tarefas
        </button>
        {hasFilters && (
          <button
            onClick={() => { setPriority(''); setMine(false) }}
            className="flex items-center gap-1.5 px-3 h-10 rounded-md border border-gray-300 text-sm text-gray-500 hover:bg-gray-50"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Board or List */}
      {view === 'kanban' ? (
        <KanbanBoard data={data} loading={loading} onRefetch={fetchData} />
      ) : (
        <TarefaListView data={data} loading={loading} onRefetch={fetchData} />
      )}
    </div>
  )
}
