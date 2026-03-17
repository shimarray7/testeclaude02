'use client'

import { useState, useEffect } from 'react'
import type { Client } from '@/types'

export function useClientes() {
  const [data, setData] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.fetch('/api/clientes?limit=200')
      .then((r) => r.json())
      .then((j) => setData(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
