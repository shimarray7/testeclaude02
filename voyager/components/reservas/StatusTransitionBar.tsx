'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import type { BookingStatus } from '@/types'

const TRANSITIONS: Record<BookingStatus, BookingStatus | null> = {
  draft:           'pending_payment',
  pending_payment: 'confirmed',
  confirmed:       'completed',
  completed:       null,
  cancelled:       null,
}

const NEXT_LABEL: Record<BookingStatus, string> = {
  draft:           'Enviar para Aguardando Pagamento',
  pending_payment: 'Confirmar Reserva',
  confirmed:       'Marcar como Concluída',
  completed:       '',
  cancelled:       '',
}

interface StatusTransitionBarProps {
  bookingId: string
  currentStatus: BookingStatus
}

export function StatusTransitionBar({ bookingId, currentStatus }: StatusTransitionBarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const nextStatus = TRANSITIONS[currentStatus]

  if (!nextStatus) return null

  async function handleTransition() {
    setLoading(true)
    const res = await fetch(`/api/reservas/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao atualizar status')
    } else {
      toast.success('Status atualizado com sucesso!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <p className="text-sm text-blue-800">
        Próxima etapa: <strong>{nextStatus === 'pending_payment' ? 'Aguardando Pagamento' : nextStatus === 'confirmed' ? 'Confirmada' : 'Concluída'}</strong>
      </p>
      <button
        onClick={handleTransition}
        disabled={loading}
        className="flex items-center gap-2 h-8 px-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Atualizando...' : NEXT_LABEL[currentStatus]}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
