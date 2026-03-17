'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Plus, Search, X } from 'lucide-react'
import { ClienteTable } from '@/components/clientes/ClienteTable'
import { Button } from '@/components/ui/button'
import type { Client } from '@/types'

export default function ClientesPage() {
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [data, setData]       = useState<Client[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)

    fetch(`/api/clientes?${params}`)
      .then((r) => r.json())
      .then((j) => { setData(j.data ?? []); setTotal(j.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, page])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          {!loading && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {total}
            </span>
          )}
        </div>
        <Link href="/clientes/novo">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1) }}
            className="flex items-center gap-1.5 px-3 h-10 rounded-md border border-gray-300 text-sm text-gray-500 hover:bg-gray-50"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      <ClienteTable data={data} loading={loading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} — {total} clientes
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
