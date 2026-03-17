'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlaneTakeoff, Plus, Search, X } from 'lucide-react'
import { useReservas } from '@/hooks/useReservas'
import { ReservaTable } from '@/components/reservas/ReservaTable'
import { Button } from '@/components/ui/button'
import type { BookingStatus } from '@/types'

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '',                label: 'Todos os status' },
  { value: 'draft',           label: 'Rascunho' },
  { value: 'pending_payment', label: 'Aguard. Pagamento' },
  { value: 'confirmed',       label: 'Confirmada' },
  { value: 'completed',       label: 'Concluída' },
  { value: 'cancelled',       label: 'Cancelada' },
]

export default function ReservasPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, total, loading } = useReservas({
    search: search || undefined,
    status: status || undefined,
    page,
  })

  const totalPages = Math.ceil(total / 20)

  function clearFilters() {
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const hasFilters = search || status

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <PlaneTakeoff className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          {!loading && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {total}
            </span>
          )}
        </div>
        <Link href="/reservas/nova">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, destino..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 h-10 rounded-md border border-gray-300 text-sm text-gray-500 hover:bg-gray-50"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <ReservaTable data={data} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} — {total} reservas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
