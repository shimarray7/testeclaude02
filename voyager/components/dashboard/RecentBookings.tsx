import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/reservas/StatusBadge'
import type { BookingStatus } from '@/types'

interface RecentBooking {
  id: string
  reference_code: string
  destination: string
  status: string
  departure_date: string
  total_price: number
  created_at: string
  client?: { id: string; full_name: string } | null
}

export function RecentBookings({ bookings }: { bookings: RecentBooking[] }) {
  if (!bookings.length) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">Nenhuma reserva ainda.</p>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/reservas/${b.id}`}
          className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 px-1 -mx-1 rounded-lg transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-600">{b.reference_code}</span>
              <StatusBadge status={b.status as BookingStatus} />
            </div>
            <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{b.destination}</p>
            <p className="text-xs text-gray-400">{b.client?.full_name ?? '—'} · {formatDate(b.departure_date)}</p>
          </div>
          <p className="text-sm font-bold text-gray-800 flex-shrink-0">{formatCurrency(b.total_price)}</p>
        </Link>
      ))}
    </div>
  )
}
