'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Client } from '@/types'

interface ClienteTableProps {
  data: Client[]
  loading: boolean
}

export function ClienteTable({ data, loading }: ClienteTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-400 font-medium">Nenhum cliente encontrado</p>
        <p className="text-sm text-gray-300 mt-1">Ajuste a busca ou cadastre um novo cliente.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Contato</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">CPF</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Passaporte</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Validade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                  >
                    {c.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                  {c.cpf ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                  {c.passport_number ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {c.passport_expiry ? (
                    <PassportExpiry expiry={c.passport_expiry} />
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((c) => (
          <Link
            key={c.id}
            href={`/clientes/${c.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">{c.full_name}</p>
            {c.email && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {c.email}
              </p>
            )}
            {c.phone && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {c.phone}
              </p>
            )}
            {c.passport_expiry && (
              <p className="text-xs mt-1">
                <PassportExpiry expiry={c.passport_expiry} />
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function PassportExpiry({ expiry }: { expiry: string }) {
  const today = new Date()
  const exp   = new Date(expiry)
  const diffMs = exp.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const color =
    diffDays < 0   ? 'text-red-600 font-semibold' :
    diffDays < 180 ? 'text-amber-600 font-semibold' :
    'text-gray-600'

  return <span className={color}>{formatDate(expiry)}</span>
}
