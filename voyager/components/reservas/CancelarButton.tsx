'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { CancelarModal } from './CancelarModal'

interface CancelarButtonProps {
  bookingId: string
  referenceCode: string
}

export function CancelarButton({ bookingId, referenceCode }: CancelarButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 text-sm text-red-600 hover:bg-red-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancelar
      </button>
      {open && (
        <CancelarModal
          bookingId={bookingId}
          referenceCode={referenceCode}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
