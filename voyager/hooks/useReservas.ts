'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Booking } from '@/types'

interface Filters {
  status?: string
  search?: string
  assigned_to?: string
  from?: string
  to?: string
  page?: number
}

interface ReservasResult {
  data: Booking[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useReservas(filters: Filters = {}): ReservasResult {
  const [data, setData] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v))
      })
      const res = await window.fetch(`/api/reservas?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar reservas')
      const json = await res.json()
      setData(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch() }, [fetch])

  return { data, total, loading, error, refetch: fetch }
}
