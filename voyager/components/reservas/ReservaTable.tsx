'use client'

import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Booking } from '@/types'

interface ReservaTableProps {
  data: Booking[]
  loading: boolean
}

export function ReservaTable({ data, loading }: ReservaTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-400 font-medium">Nenhuma reserva encontrada</p>
        <p className="text-sm text-gray-300 mt-1">Ajuste os filtros ou crie uma nova reserva.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Destino</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Partida</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Valor</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/reservas/${booking.id}`}
                    className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {booking.reference_code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {booking.client?.full_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">
                  {booking.destination}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(booking.departure_date)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {formatCurrency(booking.total_price)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {booking.assigned_user?.full_name ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((booking) => (
          <Link
            key={booking.id}
            href={`/reservas/${booking.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-blue-600">
                  {booking.reference_code}
                </p>
                <p className="font-medium text-gray-800 mt-0.5 truncate">
                  {booking.client?.full_name ?? '—'}
                </p>
                <p className="text-sm text-gray-500 truncate">{booking.destination}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StatusBadge status={booking.status} />
                <p className="text-sm font-semibold text-gray-800">
                  {formatCurrency(booking.total_price)}
                </p>
                <p className="text-xs text-gray-400">{formatDate(booking.departure_date)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
