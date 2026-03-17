'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface DeleteClienteButtonProps {
  clienteId: string
  clienteName: string
  hasActiveBookings: boolean
}

export function DeleteClienteButton({ clienteId, clienteName, hasActiveBookings }: DeleteClienteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/clientes/${clienteId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Cliente excluído.')
      router.push('/clientes')
      router.refresh()
    } else {
      const json = await res.json()
      toast.error(json.error ?? 'Erro ao excluir cliente')
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Excluir Cliente</h2>
                  <p className="text-sm text-gray-500">{clienteName}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {hasActiveBookings ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                Este cliente possui <strong>reservas ativas</strong>. Cancele ou conclua as reservas antes de excluí-lo.
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Esta ação é irreversível. O histórico de reservas concluídas será mantido, mas o cliente não poderá mais ser editado ou vinculado a novas reservas.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                isLoading={loading}
                disabled={hasActiveBookings}
                onClick={handleDelete}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
