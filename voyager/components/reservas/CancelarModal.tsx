'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AlertTriangle, X } from 'lucide-react'
import { cancelarReservaSchema, type CancelarReservaInput } from '@/lib/validations/reserva'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CancelarModalProps {
  bookingId: string
  referenceCode: string
  onClose: () => void
  onSuccess: () => void
}

export function CancelarModal({ bookingId, referenceCode, onClose, onSuccess }: CancelarModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CancelarReservaInput>({
    resolver: zodResolver(cancelarReservaSchema),
  })

  async function onSubmit(data: CancelarReservaInput) {
    const res = await fetch(`/api/reservas/${bookingId}/cancelar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao cancelar reserva')
      return
    }

    toast.success('Reserva cancelada.')
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Cancelar Reserva</h2>
              <p className="text-sm text-gray-500">{referenceCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Esta ação não pode ser desfeita. Se houver pagamentos confirmados, um reembolso pendente será criado automaticamente.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cancelled_reason">Motivo do cancelamento *</Label>
            <Textarea
              id="cancelled_reason"
              placeholder="Descreva o motivo do cancelamento..."
              rows={4}
              error={errors.cancelled_reason?.message}
              {...register('cancelled_reason')}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Voltar
            </Button>
            <Button type="submit" variant="destructive" isLoading={isSubmitting}>
              Confirmar Cancelamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
