'use client'

import Link from 'next/link'
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export interface Transacao {
  id: string
  type: 'income' | 'expense' | 'refund'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  amount: number
  description: string
  due_date?: string
  paid_at?: string
  category?: string
  booking?: { id: string; reference_code: string; destination: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  income:  'Receita',
  expense: 'Despesa',
  refund:  'Reembolso',
}
const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendente',
  paid:      'Pago',
  overdue:   'Vencido',
  cancelled: 'Cancelado',
}
const TYPE_STYLES: Record<string, string> = {
  income:  'text-green-700',
  expense: 'text-red-700',
  refund:  'text-amber-700',
}

interface Props {
  data: Transacao[]
  loading: boolean
  onRefetch: () => void
}

export function TransacaoTable({ data, loading, onRefetch }: Props) {
  async function handleMarcarPago(id: string) {
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch(`/api/financeiro/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_at: today }),
    })
    if (res.ok) { toast.success('Marcado como pago!'); onRefetch() }
    else toast.error('Erro ao atualizar')
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    const res = await fetch(`/api/financeiro/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Transação excluída.'); onRefetch() }
    else {
      const json = await res.json()
      toast.error(json.error ?? 'Erro ao excluir')
    }
  }

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
        <p className="text-gray-400 font-medium">Nenhuma transação encontrada</p>
        <p className="text-sm text-gray-300 mt-1">Ajuste os filtros ou crie uma nova transação.</p>
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
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Descrição</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Vencimento</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Valor</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reserva</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 truncate max-w-[240px]">{t.description}</p>
                  {t.category && <p className="text-xs text-gray-400">{t.category}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${TYPE_STYLES[t.type]}`}>
                    {TYPE_LABELS[t.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {t.due_date ? formatDate(t.due_date) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-bold ${TYPE_STYLES[t.type]}`}>
                  {t.type === 'expense' || t.type === 'refund' ? '−' : '+'}
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {t.booking ? (
                    <Link
                      href={`/reservas/${t.booking.id}`}
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {t.booking.reference_code}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {t.status === 'pending' || t.status === 'overdue' ? (
                      <button
                        title="Marcar como pago"
                        onClick={() => handleMarcarPago(t.id)}
                        className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    ) : null}
                    <Link
                      href={`/financeiro/${t.id}/editar`}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {t.status !== 'paid' && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((t) => (
          <div key={t.id} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">{t.description}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold ${TYPE_STYLES[t.type]}`}>
                  {TYPE_LABELS[t.type]}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
                {t.due_date && (
                  <span className="text-xs text-gray-400">{formatDate(t.due_date)}</span>
                )}
              </div>
              {t.booking && (
                <Link
                  href={`/reservas/${t.booking.id}`}
                  className="text-xs font-mono text-blue-600 mt-0.5 block"
                >
                  {t.booking.reference_code}
                </Link>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className={`font-bold text-sm ${TYPE_STYLES[t.type]}`}>
                {t.type !== 'income' ? '−' : '+'}
                {formatCurrency(t.amount)}
              </p>
              <div className="flex gap-1">
                {(t.status === 'pending' || t.status === 'overdue') && (
                  <button onClick={() => handleMarcarPago(t.id)} className="p-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <Link href={`/financeiro/${t.id}/editar`} className="p-1 text-gray-400">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
