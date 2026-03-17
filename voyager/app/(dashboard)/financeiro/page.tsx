'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DollarSign, Plus, X } from 'lucide-react'
import { DRESummary } from '@/components/financeiro/DRESummary'
import { TransacaoTable, type Transacao } from '@/components/financeiro/TransacaoTable'
import { Button } from '@/components/ui/button'

interface DRE {
  receitas_realizadas: number
  receitas_previstas: number
  despesas_realizadas: number
  despesas_previstas: number
  reembolsos: number
  resultado_realizado: number
  resultado_previsto: number
}

const TYPE_OPTIONS = [
  { value: '',        label: 'Todos os tipos' },
  { value: 'income',  label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
  { value: 'refund',  label: 'Reembolsos' },
]

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos os status' },
  { value: 'pending',   label: 'Pendente' },
  { value: 'paid',      label: 'Pago' },
  { value: 'overdue',   label: 'Vencido' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function FinanceiroPage() {
  const [data, setData]       = useState<Transacao[]>([])
  const [dre, setDre]         = useState<DRE | null>(null)
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [type, setType]       = useState('')
  const [status, setStatus]   = useState('')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '30' })
    if (type)   params.set('type', type)
    if (status) params.set('status', status)
    if (from)   params.set('from', from)
    if (to)     params.set('to', to)

    fetch(`/api/financeiro?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setData(j.data ?? [])
        setTotal(j.total ?? 0)
        setDre(j.dre ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, type, status, from, to])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages  = Math.ceil(total / 30)
  const hasFilters  = type || status || from || to

  function clearFilters() {
    setType(''); setStatus(''); setFrom(''); setTo(''); setPage(1)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          {!loading && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {total}
            </span>
          )}
        </div>
        <Link href="/financeiro/nova">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
      </div>

      {/* DRE */}
      {dre && <DRESummary dre={dre} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          title="Vencimento a partir de"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          title="Vencimento até"
        />
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

      <TransacaoTable data={data} loading={loading} onRefetch={fetchData} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} — {total} transações
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
